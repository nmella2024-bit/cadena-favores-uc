import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { studyAI } from '../../services/studyAI';
import QuizPlayer from './QuizPlayer';
import { AlertTriangle, Target, Loader2, CheckCircle2 } from 'lucide-react';

const WeaknessDetector = () => {
    const { weakTopics } = useStudy();
    const [step, setStep] = useState('dashboard'); // dashboard, loading, playing
    const [quizData, setQuizData] = useState(null);

    const handlePracticeWeaknesses = async () => {
        if (weakTopics.length === 0) return;
        setStep('loading');
        try {
            const topics = weakTopics.map(w => w.topic);
            const data = await studyAI.generateWeaknessQuiz(topics);
            setQuizData(data);
            setStep('playing');
        } catch (err) {
            console.error(err);
            alert("Error al generar quiz de refuerzo.");
            setStep('dashboard');
        }
    };

    if (step === 'playing' && quizData) {
        return (
            <div>
                <button
                    onClick={() => setStep('dashboard')}
                    className="mb-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                    ← Volver al panel
                </button>
                <QuizPlayer
                    quizData={quizData}
                    onRestart={() => setStep('dashboard')}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                    <Target className="w-8 h-8 text-red-500" />
                    Detección de Temas Débiles
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Analizamos tu desempeño para identificar qué necesitas reforzar.
                </p>
            </div>

            {weakTopics.length === 0 ? (
                <div className="text-center p-12 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300">¡Todo se ve excelente!</h3>
                    <p className="text-green-600 dark:text-green-400">
                        No hemos detectado temas débiles por ahora. Sigue practicando para mantener tu nivel.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        {weakTopics.map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{item.topic}</h4>
                                    <p className="text-xs text-gray-500">
                                        Aciertos: {Math.round(item.percentage * 100)}%
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-8 text-white text-center flex flex-col justify-center items-center shadow-lg shadow-red-500/20">
                        <h3 className="text-2xl font-bold mb-4">¡Refuerza ahora!</h3>
                        <p className="mb-6 opacity-90">
                            Generaremos un quiz personalizado enfocado exclusivamente en estos {weakTopics.length} temas.
                        </p>
                        <button
                            onClick={handlePracticeWeaknesses}
                            disabled={step === 'loading'}
                            className="bg-white text-red-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors w-full max-w-xs flex items-center justify-center gap-2"
                        >
                            {step === 'loading' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Practicar Temas Débiles'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeaknessDetector;
