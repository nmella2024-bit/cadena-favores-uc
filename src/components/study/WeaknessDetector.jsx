import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { studyAI } from '../../services/studyAI';
import QuizPlayer from './QuizPlayer';
import { AlertTriangle, CheckCircle, Loader2, Target, ChevronRight, BookOpen } from 'lucide-react';

const WeaknessDetector = () => {
    const { getWeakTopics } = useStudy();
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [generatingTopic, setGeneratingTopic] = useState(null);

    const groupedWeakTopics = getWeakTopics();
    const hasWeaknesses = Object.keys(groupedWeakTopics).length > 0;

    const handleReinforceTopic = async (topicItem) => {
        setLoading(true);
        setGeneratingTopic(topicItem.topic);
        try {
            // Use the specific topic/subtopic for generation
            const prompt = `Genera un quiz de refuerzo específico sobre: ${topicItem.topic}. El estudiante tiene un rendimiento del ${Math.round(topicItem.percentage)}% en este tema. Enfócate en corregir errores comunes.`;

            const data = await studyAI.generateQuiz(prompt, {
                numQuestions: 5,
                type: 'mixed', // Mix of multiple choice and open to test depth
                difficulty: 'Intermedio'
            });

            setQuizData({ ...data, topic: `Refuerzo: ${topicItem.topic}` });
        } catch (error) {
            alert('Error al generar quiz de refuerzo');
        } finally {
            setLoading(false);
            setGeneratingTopic(null);
        }
    };

    if (quizData) {
        return <QuizPlayer quizData={quizData} onClose={() => setQuizData(null)} />;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detector de Debilidades</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Áreas que requieren atención prioritaria</p>
                </div>
            </div>

            {!hasWeaknesses ? (
                <div className="text-center py-12 flex flex-col items-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¡Todo en orden!</h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-xs mx-auto">
                        No hemos detectado temas críticos por ahora. Sigue practicando para mantener tu nivel.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedWeakTopics).map(([unit, topics]) => (
                        <div key={unit} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-gray-500" />
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">{unit}</h3>
                                <span className="ml-auto text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                    {topics.length} temas
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {topics.map((item, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {item.type === 'subtopic' ? item.topic.split(': ')[1] : item.topic}
                                                </span>
                                                {item.percentage < 40 && (
                                                    <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">Crítico</span>
                                                )}
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[150px]">
                                                <div
                                                    className={`h-1.5 rounded-full ${item.percentage < 40 ? 'bg-red-500' : 'bg-orange-500'}`}
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleReinforceTopic(item)}
                                            disabled={loading}
                                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-purple-500 hover:text-purple-600 transition-all shadow-sm"
                                        >
                                            {loading && generatingTopic === item.topic ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Target className="w-4 h-4" />
                                            )}
                                            Reforzar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WeaknessDetector;
