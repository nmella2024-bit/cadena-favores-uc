import React, { useState, useRef, useEffect } from 'react';
import { generateStudyMaterial, askAI, generateQuiz, gradeOpenAnswer } from './aiService';
import { extractTextFromFile, extractTextFromUrl } from './contextProcessor';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { obtenerMateriales } from '../services/materialService';
import { buscarEnMateriales } from '../services/searchService';
import { Search, FileText, X, Loader2, Plus, Database, Sparkles, MessageSquare, FileOutput } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion'; // Temporarily disabled for debugging

const AutoStudyWidget = (props) => {
    const [topic, setTopic] = useState('');
    const [style, setStyle] = useState('Resumen');
    const [contextFiles, setContextFiles] = useState([]);
    const [generatedContent, setGeneratedContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [processingFiles, setProcessingFiles] = useState(false);

    // Quiz State
    const [quizData, setQuizData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [showQuizResults, setShowQuizResults] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);

    // Advanced Quiz State
    const [quizConfig, setQuizConfig] = useState({ questionType: 'multiple-choice', numQuestions: 5 });
    const [openAnswer, setOpenAnswer] = useState('');
    const [gradingFeedback, setGradingFeedback] = useState(null);
    const [weakTopics, setWeakTopics] = useState([]);
    const [isGrading, setIsGrading] = useState(false);

    // Load Weak Topics on Mount
    useEffect(() => {
        const stats = JSON.parse(localStorage.getItem('studyStats') || '{}');
        const weak = Object.keys(stats).filter(topic => {
            const s = stats[topic];
            return (s.correct / (s.correct + s.wrong)) < 0.6 || s.wrong >= 2; // Simple heuristic
        });
        setWeakTopics(weak);
    }, []);

    const updateTopicStats = (topic, isCorrect) => {
        const stats = JSON.parse(localStorage.getItem('studyStats') || '{}');
        if (!stats[topic]) stats[topic] = { correct: 0, wrong: 0 };

        if (isCorrect) stats[topic].correct++;
        else stats[topic].wrong++;

        localStorage.setItem('studyStats', JSON.stringify(stats));
    };

    // Material Selector State
    const [showMaterialSelector, setShowMaterialSelector] = useState(false);
    const [availableMaterials, setAvailableMaterials] = useState([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);



    // Chat State
    const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'chat' | 'quiz'
    const [chatQuery, setChatQuery] = useState('');
    const [chatHistory, setChatHistory] = useState([{ role: 'system', content: '¡Hola! Soy tu asistente de estudio. Pregúntame sobre materiales o pídeme que genere documentos.' }]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatFiles, setChatFiles] = useState([]); // Files attached to chat
    const chatEndRef = useRef(null);
    const chatFileRef = useRef(null); // Ref for hidden file input

    const contentRef = useRef(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, activeTab]);

    const handleChatFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        console.log("Processing chat files:", files.map(f => f.name));
        setChatLoading(true);

        try {
            const processed = await Promise.all(
                files.map(async (file) => {
                    try {
                        const text = await extractTextFromFile(file);
                        console.log(`Extracted text from ${file.name} (${text.length} chars)`);
                        return { name: file.name, text };
                    } catch (err) {
                        console.error(`Error reading chat file ${file.name}:`, err);
                        alert(`Error al leer ${file.name}: ${err.message}`);
                        return null;
                    }
                })
            );
            const validFiles = processed.filter(Boolean);
            if (validFiles.length > 0) {
                setChatFiles(prev => [...prev, ...validFiles]);
            }
        } catch (err) {
            console.error("Error processing chat files:", err);
            alert("Error general al procesar archivos.");
        } finally {
            setChatLoading(false);
            if (chatFileRef.current) chatFileRef.current.value = '';
        }
    };

    const removeChatFile = (index) => {
        setChatFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatQuery.trim() && chatFiles.length === 0) return;

        const userMsg = { role: 'user', content: chatQuery };

        // Add file context to the message display if files are present
        if (chatFiles.length > 0) {
            userMsg.content += `\n\n[Archivos adjuntos: ${chatFiles.map(f => f.name).join(', ')}]`;
        }

        setChatHistory(prev => [...prev, userMsg]);
        setChatQuery('');
        const currentFiles = [...chatFiles]; // Snapshot current files
        setChatFiles([]); // Clear files after sending
        setChatLoading(true);

        try {
            // 1. Prepare Context from Files
            let context = "";
            if (currentFiles.length > 0) {
                context += "--- Archivos Adjuntos por el Usuario ---\n";
                currentFiles.forEach(f => {
                    context += `Documento: ${f.name}\nContenido: ${f.text.substring(0, 10000)}\n\n`;
                });
            }

            // 2. Search for relevant materials (if query is long enough)
            if (chatQuery.length > 5) {
                try {
                    const searchResults = await buscarEnMateriales(chatQuery, 'all', 5);
                    const materials = searchResults.materiales || [];

                    if (materials.length > 0) {
                        context += "\n--- Materiales Relacionados Encontrados ---\n";
                        materials.forEach(m => {
                            context += `- ${m.titulo} (${m.ramo || 'General'}).\n`;
                        });
                    }
                } catch (err) {
                    console.warn("Chat search failed:", err);
                }
            }

            // 3. Ask AI
            // We pass the raw query (without the attachment note) to the AI, but with the full context
            const answer = await askAI(chatQuery, context);
            setChatHistory(prev => [...prev, { role: 'assistant', content: answer }]);
        } catch (err) {
            console.error("Chat Error:", err);
            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ **Error de conexión**: ${err.message || 'Error desconocido'}.`
            }]);
        } finally {
            setChatLoading(false);
        }
    };

    const loadMaterials = async () => {
        setLoadingMaterials(true);
        try {
            const materials = await obtenerMateriales();
            setAvailableMaterials(materials);
        } catch (error) {
            console.error("Error loading materials:", error);
        } finally {
            setLoadingMaterials(false);
        }
    };

    const handleOpenMaterialSelector = () => {
        setShowMaterialSelector(true);
        loadMaterials();
    };

    const handleSelectMaterial = async (material) => {
        if (!material.archivoUrl) return;

        setProcessingFiles(true);
        setShowMaterialSelector(false); // Close selector

        try {
            const text = await extractTextFromUrl(material.archivoUrl);
            setContextFiles(prev => [...prev, { name: material.titulo || 'Material sin título', text }]);
        } catch (err) {
            console.error(`Error processing material ${material.titulo}:`, err);
            setError(`Error al procesar el material: ${material.titulo}`);
        } finally {
            setProcessingFiles(false);
        }
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setProcessingFiles(true);
        setError('');

        try {
            const processedFiles = await Promise.all(
                files.map(async (file) => {
                    try {
                        const text = await extractTextFromFile(file);
                        return { name: file.name, text };
                    } catch (err) {
                        console.error(`Error processing ${file.name}:`, err);
                        return { name: file.name, error: 'Error reading file' };
                    }
                })
            );

            setContextFiles((prev) => [...prev, ...processedFiles]);
        } catch (err) {
            setError('Error processing files.');
        } finally {
            setProcessingFiles(false);
        }
    };

    const removeFile = (index) => {
        setContextFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!topic) {
            setError('Por favor ingresa un tema.');
            return;
        }

        setLoading(true);
        setError('');
        setGeneratedContent('');

        try {
            // 1. Auto-Search for context if no files are manually selected
            let autoContext = '';
            let usedMaterials = [];

            if (contextFiles.length === 0) {
                setProcessingFiles(true);
                try {
                    // Search for materials related to the topic
                    const searchResults = await buscarEnMateriales(topic, 'all', 5); // Top 5 results
                    const materials = searchResults.materiales || [];

                    if (materials.length > 0) {
                        // Extract text from top 3 materials with URLs
                        const materialsWithUrl = materials.filter(m => m.archivoUrl).slice(0, 3);

                        const extractedTexts = await Promise.all(
                            materialsWithUrl.map(async (m) => {
                                try {
                                    const text = await extractTextFromUrl(m.archivoUrl);
                                    usedMaterials.push(m.titulo);
                                    return `--- Material: ${m.titulo} ---\n${text.substring(0, 3000)}`; // Limit per file
                                } catch (e) {
                                    console.warn(`Failed to extract from ${m.titulo}`, e);
                                    return '';
                                }
                            })
                        );
                        autoContext = extractedTexts.join('\n\n');
                    }
                } catch (searchErr) {
                    console.warn('Auto-search failed:', searchErr);
                } finally {
                    setProcessingFiles(false);
                }
            }

            // 2. Combine manual and auto context
            const manualContext = contextFiles
                .filter(f => !f.error)
                .map(f => `--- Documento: ${f.name} ---\n${f.text}`)
                .join('\n\n');

            const fullContext = `${manualContext}\n\n${autoContext}`.trim();

            // 3. Generate Content
            const content = await generateStudyMaterial(topic, style, fullContext);

            // Add note about used sources if auto-search was used
            let finalContent = content;
            if (usedMaterials.length > 0) {
                finalContent += `<div class="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
                    <p><strong>Fuentes utilizadas automáticamente:</strong> ${usedMaterials.join(', ')}</p>
                </div>`;
            }

            setGeneratedContent(finalContent);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al generar el documento.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateQuiz = async () => {
        if (!topic) {
            setError('Por favor ingresa un tema para el Quiz.');
            return;
        }

        setLoading(true);
        setError('');
        setQuizData(null);
        setCurrentQuestionIndex(0);
        setQuizScore(0);
        setShowQuizResults(false);

        try {
            // Prepare context (similar to generate)
            const manualContext = contextFiles
                .filter(f => !f.error)
                .map(f => `--- Documento: ${f.name} ---\n${f.text}`)
                .join('\n\n');

            const quizJson = await generateQuiz(topic, manualContext, quizConfig);
            if (quizJson && quizJson.questions && quizJson.questions.length > 0) {
                setQuizData(quizJson);
            } else {
                throw new Error("La IA no generó preguntas válidas.");
            }
        } catch (err) {
            console.error("Quiz Error:", err);
            setError(err.message || 'Error al generar el Quiz.');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (optionIndex) => {
        if (isAnswerChecked) return;
        setSelectedOption(optionIndex);
        setIsAnswerChecked(true);

        const currentQuestion = quizData.questions[currentQuestionIndex];
        const isCorrect = optionIndex === currentQuestion.correctIndex;

        if (isCorrect) {
            setQuizScore(prev => prev + 1);
        }
        updateTopicStats(topic, isCorrect);
    };

    const handleOpenAnswerSubmit = async () => {
        if (!openAnswer.trim()) return;
        setIsGrading(true);
        try {
            const currentQuestion = quizData.questions[currentQuestionIndex];
            const feedback = await gradeOpenAnswer(currentQuestion.question, openAnswer);
            setGradingFeedback(feedback);
            setIsAnswerChecked(true);

            if (feedback.score >= 60) {
                setQuizScore(prev => prev + 1);
                updateTopicStats(topic, true);
            } else {
                updateTopicStats(topic, false);
            }
        } catch (err) {
            console.error("Grading Error:", err);
            alert("Error al evaluar la respuesta.");
        } finally {
            setIsGrading(false);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswerChecked(false);
            setOpenAnswer('');
            setGradingFeedback(null);
        } else {
            setShowQuizResults(true);
        }
    };

    const handleRestartQuiz = () => {
        setQuizData(null);
        setTopic('');
        setContextFiles([]);
        setError('');
        setOpenAnswer('');
        setGradingFeedback(null);
    };

    const handleExportPDF = async () => {
        if (!contentRef.current) return;

        try {
            const canvas = await html2canvas(contentRef.current, {
                scale: 2,
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`Estudio_${topic.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error('Error exporting PDF:', err);
            setError('Error al exportar PDF.');
        }
    };

    const handleExportTXT = () => {
        if (!contentRef.current) return;

        // Simple HTML to Text conversion
        const text = contentRef.current.innerText;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Estudio_${topic.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Auto Study Docs</h2>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">BETA</span>
                    </div>
                    <button
                        onClick={props.onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>


                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'generate' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        <FileOutput className="w-4 h-4" />
                        Generador
                    </button>
                    <button
                        onClick={() => setActiveTab('quiz')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'quiz' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        <span className="w-4 h-4">🧠</span>
                        Modo Estudio
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Chat
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {activeTab === 'generate' && (
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Inputs */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tema de estudio
                                        </label>
                                        <input
                                            type="text"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder="Ej: Cálculo Integral, Historia de Chile..."
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Estilo del documento
                                        </label>
                                        <select
                                            value={style}
                                            onChange={(e) => setStyle(e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Resumen">Resumen</option>
                                            <option value="Apuntes">Apuntes (Bullet points)</option>
                                            <option value="Guía de estudio">Guía de estudio (Preguntas y respuestas)</option>
                                            <option value="Explicación detallada">Explicación detallada</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Contexto (Opcional)
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            Sube archivos PDF, TXT o MD para usarlos como base.
                                        </p>
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.txt,.md,.json"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        dark:file:bg-gray-700 dark:file:text-gray-300
                      "
                                            disabled={processingFiles}
                                        />

                                        <div className="mt-2">
                                            <button
                                                onClick={handleOpenMaterialSelector}
                                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                            >
                                                <Database className="w-4 h-4" />
                                                Seleccionar de Material existente
                                            </button>
                                        </div>

                                        {processingFiles && <p className="text-xs text-blue-500 mt-1">Procesando archivos...</p>}

                                        {contextFiles.length > 0 && (
                                            <ul className="mt-2 space-y-1">
                                                {contextFiles.map((file, index) => (
                                                    <li key={index} className="flex items-center justify-between text-xs bg-gray-100 dark:bg-gray-700 p-1.5 rounded">
                                                        <span className="truncate max-w-[200px] text-gray-700 dark:text-gray-300">{file.name}</span>
                                                        <button
                                                            onClick={() => removeFile(index)}
                                                            className="text-red-500 hover:text-red-700 ml-2"
                                                        >
                                                            ✕
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading || processingFiles || !topic}
                                        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
                  ${loading || processingFiles || !topic
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transform hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin h-5 w-5" />
                                                Generando...
                                            </span>
                                        ) : '✨ Generar Documento'}
                                    </button>

                                    {error && (
                                        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
                                            {error}
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Preview */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 min-h-[400px] flex flex-col">
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-lg">
                                        <h3 className="font-medium text-gray-700 dark:text-gray-300">Vista Previa (Editable)</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    if (!contentRef.current) return;
                                                    const text = contentRef.current.innerText;
                                                    navigator.clipboard.writeText(text);
                                                    alert("¡Texto copiado!");
                                                }}
                                                disabled={!generatedContent}
                                                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded disabled:opacity-50"
                                            >
                                                Copiar
                                            </button>
                                            <button
                                                onClick={handleExportTXT}
                                                disabled={!generatedContent}
                                                className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                            >
                                                TXT
                                            </button>
                                            <button
                                                onClick={handleExportPDF}
                                                disabled={!generatedContent}
                                                className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded disabled:opacity-50"
                                            >
                                                PDF
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-4 overflow-y-auto max-h-[500px]">
                                        {generatedContent ? (
                                            <div
                                                ref={contentRef}
                                                contentEditable
                                                suppressContentEditableWarning
                                                onBlur={(e) => setGeneratedContent(e.currentTarget.innerHTML)}
                                                className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[500px]"
                                                dangerouslySetInnerHTML={{ __html: generatedContent }}
                                            />
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                                <p className="text-sm">El documento generado aparecerá aquí</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'quiz' && (
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                            {!quizData ? (
                                // Quiz Setup View
                                <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <span className="text-3xl">🧠</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Modo Estudio Interactivo</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                                        Genera un quiz de 5 preguntas sobre cualquier tema o documento para poner a prueba tus conocimientos.
                                    </p>

                                    <div className="space-y-4 text-left mb-8">
                                        {/* Weak Topic Banner */}
                                        {weakTopics.length > 0 && (
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                                                <p className="text-sm text-orange-800 font-medium mb-2">
                                                    ⚠️ Detectamos temas que podrías reforzar:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {weakTopics.map(t => (
                                                        <button
                                                            key={t}
                                                            onClick={() => setTopic(t)}
                                                            className="text-xs bg-white border border-orange-200 text-orange-700 px-2 py-1 rounded-full hover:bg-orange-100"
                                                        >
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Tema del Quiz
                                            </label>
                                            <input
                                                type="text"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                placeholder="Ej: Biología Celular, Historia..."
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Tipo de Preguntas
                                                </label>
                                                <select
                                                    value={quizConfig.questionType}
                                                    onChange={(e) => setQuizConfig({ ...quizConfig, questionType: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                >
                                                    <option value="multiple-choice">Alternativas</option>
                                                    <option value="open">Desarrollo (IA)</option>
                                                    <option value="mixed">Mixto</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Cantidad
                                                </label>
                                                <select
                                                    value={quizConfig.numQuestions}
                                                    onChange={(e) => setQuizConfig({ ...quizConfig, numQuestions: parseInt(e.target.value) })}
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                >
                                                    <option value={5}>5 Preguntas</option>
                                                    <option value={10}>10 Preguntas</option>
                                                    <option value={15}>15 Preguntas</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Material de Apoyo (Opcional)
                                            </label>
                                            <input
                                                type="file"
                                                multiple
                                                accept=".pdf,.txt,.md,.json"
                                                onChange={handleFileChange}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                            />
                                            {contextFiles.length > 0 && (
                                                <p className="text-xs text-green-600 mt-2">✓ {contextFiles.length} archivos adjuntos</p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGenerateQuiz}
                                        disabled={loading || !topic}
                                        className="w-full py-3 px-6 rounded-xl text-white font-bold text-lg transition-all bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin h-6 w-6" />
                                                Creando Quiz...
                                            </span>
                                        ) : 'Comenzar Quiz 🚀'}
                                    </button>
                                    {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
                                </div>
                            ) : showQuizResults ? (
                                // Results View
                                <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
                                    <div className="mb-6">
                                        {quizScore >= 3 ? (
                                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                                <span className="text-4xl">✅</span>
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
                                                <span className="text-4xl">✨</span>
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        Tu Puntaje: {quizScore}/{quizData.questions.length}
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                                        {quizScore === 5 ? '¡Perfecto! Eres un experto.' :
                                            quizScore >= 3 ? '¡Muy bien! Sigue así.' :
                                                'Sigue practicando, vas por buen camino.'}
                                    </p>
                                    <button
                                        onClick={handleRestartQuiz}
                                        className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-colors"
                                    >
                                        <span>🔄</span>
                                        Generar Nuevo Quiz
                                    </button>
                                </div>
                            ) : (
                                // Active Quiz View
                                <div className="max-w-2xl mx-auto">
                                    <div className="mb-6 flex justify-between items-center text-sm font-medium text-gray-500">
                                        <span>Pregunta {currentQuestionIndex + 1} de {quizData.questions.length}</span>
                                        <span>Puntaje: {quizScore}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
                                        />
                                    </div>

                                    {/* AnimatePresence and motion removed for debugging */}
                                    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
                                            {quizData.questions[currentQuestionIndex].question}
                                        </h3>

                                        <div className="space-y-3">
                                            {quizData.questions[currentQuestionIndex].type === 'open' || (!quizData.questions[currentQuestionIndex].type && quizConfig.questionType === 'open') ? (
                                                // Open Question UI
                                                <div className="space-y-4">
                                                    <textarea
                                                        value={openAnswer}
                                                        onChange={(e) => setOpenAnswer(e.target.value)}
                                                        disabled={isAnswerChecked}
                                                        placeholder="Escribe tu respuesta aquí..."
                                                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 min-h-[150px] focus:ring-2 focus:ring-purple-500 outline-none"
                                                    />
                                                    {!isAnswerChecked && (
                                                        <button
                                                            onClick={handleOpenAnswerSubmit}
                                                            disabled={!openAnswer.trim() || isGrading}
                                                            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors disabled:opacity-50"
                                                        >
                                                            {isGrading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Enviar Respuesta'}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                // Multiple Choice UI
                                                quizData.questions[currentQuestionIndex].options.map((option, idx) => {
                                                    const isSelected = selectedOption === idx;
                                                    const isCorrect = idx === quizData.questions[currentQuestionIndex].correctIndex;
                                                    const showStatus = isAnswerChecked;

                                                    let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex justify-between items-center ";

                                                    if (showStatus) {
                                                        if (isCorrect) buttonClass += "border-green-500 bg-green-50 text-green-800";
                                                        else if (isSelected) buttonClass += "border-red-500 bg-red-50 text-red-800";
                                                        else buttonClass += "border-gray-100 opacity-50";
                                                    } else {
                                                        buttonClass += "border-gray-100 hover:border-purple-200 hover:bg-purple-50";
                                                    }

                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleOptionSelect(idx)}
                                                            disabled={isAnswerChecked}
                                                            className={buttonClass}
                                                        >
                                                            <span className="font-medium">{option}</span>
                                                            {/* Icons removed for debugging */}
                                                            {showStatus && isCorrect && <span>✅</span>}
                                                            {showStatus && isSelected && !isCorrect && <span>❌</span>}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>

                                        {isAnswerChecked && (
                                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                                {gradingFeedback ? (
                                                    <div className="mb-4 space-y-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-lg font-bold">Puntaje: {gradingFeedback.score}/100</span>
                                                            <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                                                <div
                                                                    className={`h-2 rounded-full ${gradingFeedback.score >= 60 ? 'bg-green-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${gradingFeedback.score}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="text-sm space-y-2">
                                                            <p className="text-green-700 bg-green-50 p-2 rounded">👍 {gradingFeedback.feedback.good}</p>
                                                            <p className="text-red-700 bg-red-50 p-2 rounded">👎 {gradingFeedback.feedback.bad}</p>
                                                            <p className="text-blue-700 bg-blue-50 p-2 rounded">💡 {gradingFeedback.feedback.improvement}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                                        <strong>Explicación:</strong> {quizData.questions[currentQuestionIndex].explanation}
                                                    </p>
                                                )}
                                                <button
                                                    onClick={handleNextQuestion}
                                                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors"
                                                >
                                                    {currentQuestionIndex < quizData.questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        /* Chat Interface - Fixed Layout */
                        <div className="flex flex-col h-full overflow-hidden relative">
                            {/* Messages Area - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 scroll-smooth">
                                {chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`
                                                relative px-4 py-3 rounded-2xl text-sm shadow-sm max-w-[90%] md:max-w-[85%] min-w-[40%]
                                                ${msg.role === 'user'
                                                    ? 'bg-blue-600 text-white rounded-br-none'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                                                }
                                            `}
                                        >
                                            {/* Sender Label */}
                                            {msg.role === 'system' && (
                                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-2 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-1">
                                                    <Sparkles className="w-3 h-3" />
                                                    <span>Asistente IA</span>
                                                </div>
                                            )}

                                            {/* Message Content */}
                                            <div
                                                className="text-sm leading-relaxed break-words whitespace-pre-wrap font-normal"
                                                dir="ltr"
                                                style={{ color: 'inherit' }}
                                            >
                                                {msg.role === 'system' ? (
                                                    <span>{msg.content}</span>
                                                ) : (
                                                    <span>
                                                        {msg.content && msg.content.trim()
                                                            ? msg.content.replace(/<[^>]*>/g, '') // Strip HTML tags just in case
                                                            : '...'
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Loading Indicator */}
                                {chatLoading && (
                                    <div className="flex justify-start w-full animate-pulse">
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none p-4 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pensando...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} className="h-1" />
                            </div>

                            {/* Input Area - Fixed at Bottom */}
                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
                                {/* File Chips */}
                                {chatFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {chatFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-100">
                                                <span className="truncate max-w-[150px]">{file.name}</span>
                                                <button onClick={() => removeChatFile(idx)} className="hover:text-blue-900">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={handleChatSubmit} className="flex gap-3 items-center">
                                    <input
                                        type="file"
                                        ref={chatFileRef}
                                        onChange={handleChatFileChange}
                                        className="hidden"
                                        multiple
                                        accept=".pdf,.txt,.md,.json"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => chatFileRef.current?.click()}
                                        className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                        title="Adjuntar archivo"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                    </button>

                                    <input
                                        type="text"
                                        value={chatQuery}
                                        onChange={(e) => setChatQuery(e.target.value)}
                                        placeholder={chatFiles.length > 0 ? "Pregunta sobre los archivos..." : "Escribe tu pregunta aquí..."}
                                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={chatLoading || (!chatQuery.trim() && chatFiles.length === 0)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-md hover:shadow-lg"
                                    >
                                        {chatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="text-lg">➤</span>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Material Selector Modal */}
            {showMaterialSelector && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Seleccionar Material</h3>
                            <button onClick={() => setShowMaterialSelector(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {loadingMaterials ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {availableMaterials.map(material => (
                                        <button
                                            key={material.id}
                                            onClick={() => handleSelectMaterial(material)}
                                            className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                                        >
                                            <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-gray-200">{material.titulo}</p>
                                                <p className="text-xs text-gray-500">{material.ramo} • {material.anio}</p>
                                            </div>
                                            <Plus className="w-4 h-4 text-gray-400 ml-auto" />
                                        </button>
                                    ))}
                                    {availableMaterials.length === 0 && (
                                        <p className="text-center text-gray-500 py-8">No se encontraron materiales.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div >
    );
};

export default AutoStudyWidget;
