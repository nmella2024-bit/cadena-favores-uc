import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { History, Clock } from 'lucide-react';

const StudyHistory = () => {
    const { quizHistory } = useStudy();

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                    <History className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Historial de Estudio</h2>
            </div>

            {quizHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aún no tienes actividad registrada.</p>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {quizHistory.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{item.topic}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {new Date(item.date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className={`text-sm font-bold px-2 py-1 rounded ${(item.score / item.total) >= 0.6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {item.score}/{item.total}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudyHistory;
