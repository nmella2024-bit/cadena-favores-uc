import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { History, Calendar, CheckCircle, XCircle } from 'lucide-react';

const StudyHistory = () => {
    const { studyHistory } = useStudy();

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                    <History className="w-8 h-8 text-blue-500" />
                    Historial de Estudio
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Tus últimas sesiones y resultados.
                </p>
            </div>

            {studyHistory.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500">Aún no tienes historial. ¡Completa tu primer quiz!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {studyHistory.map((session, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded uppercase">
                                        {session.type || 'Quiz'}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(session.date)}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {session.topic}
                                </h3>
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Puntaje</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {session.correct}/{session.total}
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                                    {(session.correct / session.total) >= 0.6 ? (
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-500" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudyHistory;
