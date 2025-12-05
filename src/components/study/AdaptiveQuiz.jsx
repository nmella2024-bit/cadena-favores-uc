import React, { useState, useEffect } from 'react';
import { useStudy } from '../../context/StudyContext';
import { studyAI } from '../../services/studyAI';
import QuizPlayer from './QuizPlayer';
import { TrendingUp, Loader2, Award } from 'lucide-react';

const AdaptiveQuiz = () => {
    const { userLevel } = useStudy();
    const [step, setStep] = useState('intro'); // intro, loading, playing
    const [topic, setTopic] = useState('');
    const [quizData, setQuizData] = useState(null);
    const [error, setError] = useState('');

    const handleStart = async () => {
        if (!topic.trim()) return;
        setStep('loading');
        try {
            const data = await studyAI.generateQuiz(topic, '', {
                numQuestions: 5,
                questionType: 'mixed',
                difficulty: userLevel
            });
            setQuizData(data);
            setStep('playing');
        } catch (err) {
            console.error(err);
            setError('Error al iniciar el quiz adaptativo.');
            setStep('intro');
        }
    };

    if (step === 'playing' && quizData) {
        return (
            <div>
                <div className="mb-4 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Nivel Actual: <strong>{userLevel}</strong>
                    </span>
                    <button
                        onClick={() => setStep('intro')}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Salir
                    </button>
                </div>
                <QuizPlayer
                    quizData={quizData}
                    onRestart={() => setStep('intro')}
                />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Adaptativo</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    El sistema ajustará la dificultad automáticamente según tu desempeño.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                        <Award className="w-4 h-4" />
                        Tu Nivel: {userLevel}
                    </div>
                </div>

                <div className="mb-6 text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tema a practicar
                    </label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ej: Matemáticas, Historia, Programación..."
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                    onClick={handleStart}
                    disabled={!topic.trim() || step === 'loading'}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {step === 'loading' ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Preparando Desafío...
                        </>
                    ) : (
                        'Iniciar Desafío'
                    )}
                </button>
            </div>
        </div>
    );
};

export default AdaptiveQuiz;
