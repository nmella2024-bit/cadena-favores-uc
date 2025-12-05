import React, { useState } from 'react';
import { studyAI } from '../../services/studyAI';
import QuizPlayer from './QuizPlayer';
import { PenTool, Loader2, BookOpen } from 'lucide-react';

const DesarrolloPractice = () => {
    const [step, setStep] = useState('config'); // config, loading, playing
    const [topic, setTopic] = useState('');
    const [contextText, setContextText] = useState('');
    const [quizData, setQuizData] = useState(null);
    const [error, setError] = useState('');

    const handleStart = async () => {
        if (!topic.trim()) return;
        setStep('loading');
        setError('');
        try {
            const data = await studyAI.generateQuiz(topic, contextText, {
                numQuestions: 3, // Fewer questions for deep work
                questionType: 'open',
                difficulty: 'Intermedio'
            });
            setQuizData(data);
            setStep('playing');
        } catch (err) {
            console.error(err);
            setError('Error al generar preguntas de desarrollo.');
            setStep('config');
        }
    };

    if (step === 'playing' && quizData) {
        return (
            <div>
                <button
                    onClick={() => setStep('config')}
                    className="mb-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                    ← Volver a configuración
                </button>
                <QuizPlayer
                    quizData={quizData}
                    onRestart={() => setStep('config')}
                />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/20">
                    <PenTool className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Práctica de Desarrollo</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Mejora tu redacción y argumentación con corrección detallada por IA.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tema a desarrollar
                    </label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ej: Causas de la Primera Guerra Mundial..."
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Material de Referencia (Opcional)
                    </label>
                    <textarea
                        value={contextText}
                        onChange={(e) => setContextText(e.target.value)}
                        placeholder="Pega aquí el texto que quieres que la IA use para evaluarte..."
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-pink-500 outline-none min-h-[150px]"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    onClick={handleStart}
                    disabled={!topic.trim() || step === 'loading'}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-lg shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {step === 'loading' ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Generando Preguntas...
                        </>
                    ) : (
                        'Comenzar Práctica'
                    )}
                </button>
            </div>
        </div>
    );
};

export default DesarrolloPractice;
