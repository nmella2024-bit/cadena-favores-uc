import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { studyAI } from '../../services/studyAI';
import QuizPlayer from './QuizPlayer';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const WeaknessDetector = () => {
    const { getWeakTopics } = useStudy();
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);

    const weakTopics = getWeakTopics();

    const handleReinforce = async () => {
        if (weakTopics.length === 0) return;
        setLoading(true);
        try {
            const data = await studyAI.generateWeaknessQuiz(weakTopics.slice(0, 3)); // Top 3 weak topics
            setQuizData({ ...data, topic: 'Refuerzo Personalizado' });
        } catch (error) {
            alert('Error al generar quiz de refuerzo');
        } finally {
            setLoading(false);
        }
    };

    if (quizData) {
        return <QuizPlayer quizData={quizData} onClose={() => setQuizData(null)} />;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Detector de Debilidades</h2>
            </div>

            {weakTopics.length === 0 ? (
                <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">¡Excelente! No hemos detectado temas débiles por ahora.</p>
                    <p className="text-xs text-gray-400 mt-2">Sigue practicando para mantener tu nivel.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Hemos detectado que necesitas reforzar estos temas:</p>
                    <div className="space-y-2">
                        {weakTopics.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                                <span className="font-medium text-red-700 dark:text-red-300">{item.topic}</span>
                                <span className="text-xs font-bold bg-red-200 text-red-800 px-2 py-1 rounded">
                                    {Math.round(item.percentage)}%
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleReinforce}
                        disabled={loading}
                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-colors flex justify-center items-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Reforzar Temas Débiles'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WeaknessDetector;
