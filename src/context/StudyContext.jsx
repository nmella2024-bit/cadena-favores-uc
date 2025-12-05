import React, { createContext, useContext, useState, useEffect } from 'react';

const StudyContext = createContext();

export const useStudy = () => {
    const context = useContext(StudyContext);
    if (!context) {
        throw new Error('useStudy must be used within a StudyProvider');
    }
    return context;
};

export const StudyProvider = ({ children }) => {
    // Estado para el historial de quizzes
    const [quizHistory, setQuizHistory] = useState(() => {
        const saved = localStorage.getItem('study_quizHistory');
        return saved ? JSON.parse(saved) : [];
    });

    // Estado para temas débiles (agregación de estadísticas)
    const [topicStats, setTopicStats] = useState(() => {
        const saved = localStorage.getItem('study_topicStats');
        return saved ? JSON.parse(saved) : {};
    });

    // Nivel del usuario para quizzes adaptativos (1-5, default 3)
    const [userLevel, setUserLevel] = useState(() => {
        const saved = localStorage.getItem('study_userLevel');
        return saved ? parseInt(saved) : 3;
    });

    // Persistencia
    useEffect(() => {
        localStorage.setItem('study_quizHistory', JSON.stringify(quizHistory));
    }, [quizHistory]);

    useEffect(() => {
        localStorage.setItem('study_topicStats', JSON.stringify(topicStats));
    }, [topicStats]);

    useEffect(() => {
        localStorage.setItem('study_userLevel', userLevel.toString());
    }, [userLevel]);

    // Acciones
    const addQuizResult = (result) => {
        // result: { topic, score, total, date, type }
        setQuizHistory(prev => [result, ...prev]);

        // Actualizar estadísticas por tema
        setTopicStats(prev => {
            const current = prev[result.topic] || { correct: 0, total: 0 };
            const newStats = {
                ...prev,
                [result.topic]: {
                    correct: current.correct + result.score,
                    total: current.total + result.total
                }
            };
            return newStats;
        });

        // Lógica simple adaptativa
        const percentage = result.score / result.total;
        if (percentage >= 0.8 && userLevel < 5) {
            setUserLevel(prev => prev + 1);
        } else if (percentage < 0.4 && userLevel > 1) {
            setUserLevel(prev => prev - 1);
        }
    };

    const getWeakTopics = () => {
        return Object.entries(topicStats)
            .map(([topic, stats]) => ({
                topic,
                percentage: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
                total: stats.total
            }))
            .filter(item => item.percentage < 60 && item.total >= 5) // Criterio de debilidad
            .sort((a, b) => a.percentage - b.percentage);
    };

    const value = {
        quizHistory,
        topicStats,
        userLevel,
        addQuizResult,
        getWeakTopics
    };

    return (
        <StudyContext.Provider value={value}>
            {children}
        </StudyContext.Provider>
    );
};
