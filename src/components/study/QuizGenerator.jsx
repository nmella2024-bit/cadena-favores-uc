import React, { useState } from 'react';
import { studyAI } from '../../services/studyAI';
import QuizPlayer from './QuizPlayer';
import { Loader2, Brain, FileText, Settings } from 'lucide-react';

const QuizGenerator = () => {
    const [step, setStep] = useState('config'); // config, loading, playing
    const [topic, setTopic] = useState('');
    const [contextText, setContextText] = useState('');
    const [config, setConfig] = useState({
        numQuestions: 5,
        questionType: 'mixed',
        difficulty: 'Intermedio'
    });
    const [quizData, setQuizData] = useState(null);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setStep('loading');
        setError('');
        try {
            const data = await studyAI.generateQuiz(topic, contextText, config);
            setQuizData(data);
            setStep('playing');
        } catch (err) {
            console.error(err);
            setError('Error al generar el quiz. Intenta nuevamente.');
            setStep('config');
        }
    };

    if (step === 'playing' && quizData) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                    <Brain className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generador de Quiz</h2>
                <p className="text-gray-500 dark:text-gray-400">Personaliza tu sesión de estudio</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ¿Qué quieres estudiar hoy?
                    </label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ej: Historia de Chile, Cálculo I, Biología..."
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Contexto Adicional (Opcional)
                    </label>
                    <textarea
                        value={contextText}
                        onChange={(e) => setContextText(e.target.value)}
                        placeholder="Pega aquí apuntes o textos para que la IA los use como base..."
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px]"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo</label>
                        <select
                            value={config.questionType}
                            onChange={(e) => setConfig({ ...config, questionType: e.target.value })}
                            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                            <option value="multiple-choice">Alternativas</option>
                            <option value="open">Desarrollo</option>
                            <option value="mixed">Mixto</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cantidad</label>
                        <select
                            value={config.numQuestions}
                            onChange={(e) => setConfig({ ...config, numQuestions: parseInt(e.target.value) })}
                            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                            <option value={5}>5 Preguntas</option>
                            <option value={10}>10 Preguntas</option>
                            <option value={15}>15 Preguntas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dificultad</label>
                        <select
                            value={config.difficulty}
                            onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                            <option value="Principiante">Principiante</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Avanzado">Avanzado</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={!topic.trim() || step === 'loading'}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {step === 'loading' ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Generando Quiz...
                        </>
                    ) : (
                        'Comenzar Quiz'
                    )}
                </button>
            </div>
        </div>
    );
};

export default QuizGenerator;
