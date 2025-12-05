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
        const { topic, score, total, type, details } = result; // details: [{ subtopic, isCorrect }]

        // Update History
        const newHistory = [result, ...quizHistory];
        setQuizHistory(newHistory);
        localStorage.setItem('study_quizHistory', JSON.stringify(newHistory));

        // Update Topic Stats
        setTopicStats(prev => {
            const currentStats = prev[topic] || { correct: 0, total: 0, subtopics: {} };
            const newCorrect = currentStats.correct + score;
            const newTotal = currentStats.total + total;

            // Update Subtopic Stats if available
            const currentSubtopics = currentStats.subtopics || {};
            let updatedSubtopics = { ...currentSubtopics };

            if (details && Array.isArray(details)) {
                details.forEach(d => {
                    if (d.subtopic) {
                        const sub = updatedSubtopics[d.subtopic] || { correct: 0, total: 0 };
                        updatedSubtopics[d.subtopic] = {
                            correct: sub.correct + (d.isCorrect ? 1 : 0),
                            total: sub.total + 1
                        };
                    }
                });
            }

            return {
                ...prev,
                [topic]: {
                    correct: newCorrect,
                    total: newTotal,
                    subtopics: updatedSubtopics
                }
            };
        });

        // Lógica simple adaptativa
        const percentage = total > 0 ? score / total : 0;
        if (total > 0) {
            if (percentage >= 0.8 && userLevel < 5) {
                setUserLevel(prev => prev + 1);
            } else if (percentage < 0.4 && userLevel > 1) {
                setUserLevel(prev => prev - 1);
            }
        }
    };

    const getWeakTopics = () => {
        const weaknesses = [];
        Object.entries(topicStats).forEach(([topic, stats]) => {
            // Check main topic
            const mainPercentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 100;
            if (stats.total >= 3 && mainPercentage < 60) {
                weaknesses.push({ topic, percentage: mainPercentage, type: 'topic' });
            }

            // Check subtopics
            if (stats.subtopics) {
                Object.entries(stats.subtopics).forEach(([sub, subStats]) => {
                    const subPercentage = subStats.total > 0 ? (subStats.correct / subStats.total) * 100 : 100;
                    if (subStats.total >= 1 && subPercentage < 60) {
                        weaknesses.push({ topic: `${topic}: ${sub}`, percentage: subPercentage, type: 'subtopic' });
                    }
                });
            }
        });
        return weaknesses.sort((a, b) => a.percentage - b.percentage);
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
