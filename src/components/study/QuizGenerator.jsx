import React, { useState } from 'react';
import { studyAI } from '../../services/studyAI';
import QuizPlayer from './QuizPlayer';
import { Loader2, Brain } from 'lucide-react';

import { extractTextFromFile } from '../../autoStudyDocs/contextProcessor';

const QuizGenerator = () => {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [contextFiles, setContextFiles] = useState([]);
    const [processingFiles, setProcessingFiles] = useState(false);
    const [config, setConfig] = useState({
        numQuestions: 5,
        questionType: 'multiple-choice'
    });

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setProcessingFiles(true);
        try {
            const processed = await Promise.all(
                files.map(async (file) => {
                    try {
                        const text = await extractTextFromFile(file);
                        return { name: file.name, text };
                    } catch (err) {
                        console.error(`Error reading ${file.name}:`, err);
                        return null;
                    }
                })
            );
            setContextFiles(prev => [...prev, ...processed.filter(Boolean)]);
        } catch (err) {
            alert('Error al procesar archivos');
        } finally {
            setProcessingFiles(false);
        }
    };

    const removeFile = (index) => {
        setContextFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!topic && contextFiles.length === 0) return;
        setLoading(true);
        try {
            const context = contextFiles.map(f => `--- ${f.name} ---\n${f.text}`).join('\n\n');
            const data = await studyAI.generateQuiz(topic || 'Material Adjunto', { ...config, context });
            setQuizData({ ...data, topic: topic || 'Material Adjunto' });
        } catch (error) {
            alert('Error al generar el quiz. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (quizData) {
        return <QuizPlayer quizData={quizData} onClose={() => setQuizData(null)} />;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                    <Brain className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Generador de Quizzes</h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Tema de Estudio</label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ej: Cálculo I, Historia de Chile..."
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Material de Apoyo (Opcional)</label>
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.txt,.md,.json"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        disabled={processingFiles}
                    />
                    {processingFiles && <p className="text-xs text-blue-500 mt-1">Procesando archivos...</p>}

                    {contextFiles.length > 0 && (
                        <ul className="mt-2 space-y-1">
                            {contextFiles.map((file, index) => (
                                <li key={index} className="flex items-center justify-between text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                    <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 ml-2">✕</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo</label>
                        <select
                            value={config.questionType}
                            onChange={(e) => setConfig({ ...config, questionType: e.target.value })}
                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="multiple-choice">Alternativas</option>
                            <option value="open">Desarrollo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Cantidad</label>
                        <select
                            value={config.numQuestions}
                            onChange={(e) => setConfig({ ...config, numQuestions: parseInt(e.target.value) })}
                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value={5}>5 Preguntas</option>
                            <option value={10}>10 Preguntas</option>
                            <option value={15}>15 Preguntas</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || processingFiles || (!topic && contextFiles.length === 0)}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Generar Quiz'}
                </button>
            </div>
        </div>
    );
};

export default QuizGenerator;
