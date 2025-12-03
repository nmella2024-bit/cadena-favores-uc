import React, { useState, useRef, useEffect } from 'react';
import { generateStudyMaterial, askAI } from './aiService';
import { extractTextFromFile, extractTextFromUrl } from './contextProcessor';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { obtenerMateriales } from '../services/materialService';
import { buscarEnMateriales } from '../services/searchService';
import { Search, FileText, X, Loader2, Plus, Database, Sparkles, MessageSquare, FileOutput } from 'lucide-react';

const AutoStudyWidget = (props) => {
    const [topic, setTopic] = useState('');
    const [style, setStyle] = useState('Resumen');
    const [contextFiles, setContextFiles] = useState([]);
    const [generatedContent, setGeneratedContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [processingFiles, setProcessingFiles] = useState(false);

    // Material Selector State
    const [showMaterialSelector, setShowMaterialSelector] = useState(false);
    const [availableMaterials, setAvailableMaterials] = useState([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);



    // Chat State
    const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'chat'
    const [chatQuery, setChatQuery] = useState('');
    const [chatHistory, setChatHistory] = useState([{ role: 'system', content: '¡Hola! Soy tu asistente de estudio. Pregúntame sobre materiales o pídeme que genere documentos.' }]);
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    const contentRef = useRef(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, activeTab]);

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatQuery.trim()) return;

        const userMsg = { role: 'user', content: chatQuery };
        setChatHistory(prev => [...prev, userMsg]);
        setChatQuery('');
        setChatLoading(true);

        try {
            // 1. Search for relevant materials to provide context
            let context = "";
            try {
                const searchResults = await buscarEnMateriales(chatQuery, 'all', 10);
                const materials = searchResults.materiales || [];
                const folders = searchResults.carpetas || [];

                if (materials.length > 0 || folders.length > 0) {
                    context += "Materiales encontrados:\n";
                    materials.forEach(m => {
                        context += `- ${m.titulo} (${m.ramo || 'General'}, ${m.anio || 'N/A'}). Ruta: ${m.carpetaInfo?.rutaCompleta || 'Raíz'}\n`;
                    });
                    context += "\nCarpetas encontradas:\n";
                    folders.forEach(f => {
                        context += `- ${f.nombre}. Ruta: ${f.rutaCompleta}\n`;
                    });
                }
            } catch (err) {
                console.warn("Chat search failed:", err);
            }

            // 2. Ask AI
            const answer = await askAI(userMsg.content, context);
            setChatHistory(prev => [...prev, { role: 'assistant', content: answer }]);
        } catch (err) {
            console.error("Chat Error:", err);
            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ **Error de conexión**: ${err.message || 'Error desconocido'}. \n\nIntenta de nuevo o reduce la cantidad de texto.`
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
                        Generador de Documentos
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Chat Asistente
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {activeTab === 'generate' ? (
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
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
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
                                        <h3 className="font-medium text-gray-700 dark:text-gray-300">Vista Previa</h3>
                                        <div className="flex gap-2">
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
                                                className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-6 rounded shadow-sm"
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
                    ) : (
                        /* Chat Interface - Fixed Layout */
                        <div className="flex flex-col h-full overflow-hidden relative">
                            {/* Messages Area - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 scroll-smooth">
                                {chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`
                                                relative px-4 py-3 rounded-2xl text-sm shadow-sm max-w-[90%] md:max-w-[85%] 
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
                                                className="prose-sm max-w-none leading-relaxed break-words whitespace-pre-wrap"
                                                dir="ltr"
                                                style={{ color: 'inherit' }} // Force inherit color
                                            >
                                                {msg.role === 'system' ? (
                                                    <span>{msg.content}</span>
                                                ) : (
                                                    <div dangerouslySetInnerHTML={{
                                                        __html: msg.content
                                                            ? msg.content
                                                                .replace(/\n/g, '<br/>')
                                                                .replace(/```/g, '') // Strip code blocks for now to prevent layout break
                                                            : '<span class="italic opacity-50">...</span>'
                                                    }} />
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
                                <form onSubmit={handleChatSubmit} className="flex gap-3 items-center">
                                    <input
                                        type="text"
                                        value={chatQuery}
                                        onChange={(e) => setChatQuery(e.target.value)}
                                        placeholder="Escribe tu pregunta aquí..."
                                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={chatLoading || !chatQuery.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-md hover:shadow-lg"
                                    >
                                        {chatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="text-lg">➤</span>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
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
        </div>
    );
};

export default AutoStudyWidget;
