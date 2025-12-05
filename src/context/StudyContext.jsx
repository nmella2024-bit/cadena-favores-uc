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

    // Gamification State
    const [streak, setStreak] = useState(() => {
        const saved = localStorage.getItem('study_streak');
        return saved ? parseInt(saved) : 0;
    });
    const [lastStudyDate, setLastStudyDate] = useState(() => {
        return localStorage.getItem('study_lastDate') || null;
    });
    const [unitStats, setUnitStats] = useState(() => {
        const saved = localStorage.getItem('study_unitStats');
        return saved ? JSON.parse(saved) : {};
    });
    const [achievements, setAchievements] = useState(() => {
        const saved = localStorage.getItem('study_achievements');
        return saved ? JSON.parse(saved) : [];
    });

    // Persistence for Gamification
    useEffect(() => { localStorage.setItem('study_streak', streak.toString()); }, [streak]);
    useEffect(() => { if (lastStudyDate) localStorage.setItem('study_lastDate', lastStudyDate); }, [lastStudyDate]);
    useEffect(() => { localStorage.setItem('study_unitStats', JSON.stringify(unitStats)); }, [unitStats]);
    useEffect(() => { localStorage.setItem('study_achievements', JSON.stringify(achievements)); }, [achievements]);

    // Check Streak on Mount
    useEffect(() => {
        if (lastStudyDate) {
            const today = new Date().toDateString();
            const last = new Date(lastStudyDate).toDateString();
            const diffTime = Math.abs(new Date(today) - new Date(last));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1 && last !== today) {
                setStreak(0); // Reset streak if missed a day
            }
        }
    }, []);

    const checkAchievements = (newStats, currentStreak, totalQuestions) => {
        const newUnlocked = [];
        const unlockedSet = new Set(achievements);

        // 1. First Step
        if (!unlockedSet.has('first_step')) {
            newUnlocked.push('first_step');
        }

        // 2. On Fire (Streak >= 3)
        if (currentStreak >= 3 && !unlockedSet.has('on_fire')) {
            newUnlocked.push('on_fire');
        }

        // 3. Scholar (Total Questions >= 50)
        // Need to calculate total questions across all topics
        let totalQ = 0;
        Object.values(newStats).forEach(s => totalQ += s.total);
        if (totalQ >= 50 && !unlockedSet.has('scholar')) {
            newUnlocked.push('scholar');
        }

        if (newUnlocked.length > 0) {
            setAchievements(prev => [...prev, ...newUnlocked]);
            // Could trigger a toast here
            // alert(`¡Logro desbloqueado! ${newUnlocked.join(', ')}`);
        }
    };

    // Acciones
    const addQuizResult = (result) => {
        const { topic, score, total, type, details } = result; // details: [{ subtopic, isCorrect, unit }]

        // Update History
        const newHistory = [result, ...quizHistory];
        setQuizHistory(newHistory);
        localStorage.setItem('study_quizHistory', JSON.stringify(newHistory));

        // Update Streak
        const today = new Date().toDateString();
        const last = lastStudyDate ? new Date(lastStudyDate).toDateString() : null;
        let newStreak = streak;

        if (last !== today) {
            if (last) {
                const diffTime = Math.abs(new Date(today) - new Date(last));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    newStreak += 1;
                } else {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }
            setStreak(newStreak);
            setLastStudyDate(new Date().toISOString());
        }

        // Update Topic Stats & Unit Stats
        let newTopicStats = { ...topicStats };
        let newUnitStats = { ...unitStats };

        // Topic Stats Logic
        const currentStats = newTopicStats[topic] || { correct: 0, total: 0, subtopics: {} };
        const newCorrect = currentStats.correct + score;
        const newTotal = currentStats.total + total;

        const currentSubtopics = currentStats.subtopics || {};
        let updatedSubtopics = { ...currentSubtopics };

        if (details && Array.isArray(details)) {
            details.forEach(d => {
                // Subtopic Update
                if (d.subtopic) {
                    const sub = updatedSubtopics[d.subtopic] || { correct: 0, total: 0 };
                    updatedSubtopics[d.subtopic] = {
                        correct: sub.correct + (d.isCorrect ? 1 : 0),
                        total: sub.total + 1
                    };
                }
                // Unit Update
                if (d.unit) {
                    const uStat = newUnitStats[d.unit] || { correct: 0, total: 0 };
                    newUnitStats[d.unit] = {
                        correct: uStat.correct + (d.isCorrect ? 1 : 0),
                        total: uStat.total + 1
                    };
                }
            });
        }

        // Determine Unit from details if possible
        const unit = details && details.length > 0 && details.find(d => d.unit)?.unit;

        newTopicStats[topic] = {
            correct: newCorrect,
            total: newTotal,
            subtopics: updatedSubtopics,
            unit: unit || currentStats.unit || 'General' // Persist unit
        };

        setTopicStats(newTopicStats);
        setUnitStats(newUnitStats);

        // Check Achievements
        checkAchievements(newTopicStats, newStreak, 0);

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
        const groupedWeaknesses = {};

        Object.entries(topicStats).forEach(([topic, stats]) => {
            const unit = stats.unit || 'General';

            // Check main topic
            const mainPercentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 100;
            if (stats.total >= 3 && mainPercentage < 60) {
                if (!groupedWeaknesses[unit]) groupedWeaknesses[unit] = [];
                groupedWeaknesses[unit].push({ topic, percentage: mainPercentage, type: 'topic' });
            }

            // Check subtopics
            if (stats.subtopics) {
                Object.entries(stats.subtopics).forEach(([sub, subStats]) => {
                    const subPercentage = subStats.total > 0 ? (subStats.correct / subStats.total) * 100 : 100;
                    if (subStats.total >= 1 && subPercentage < 60) {
                        if (!groupedWeaknesses[unit]) groupedWeaknesses[unit] = [];
                        groupedWeaknesses[unit].push({ topic: `${topic}: ${sub}`, percentage: subPercentage, type: 'subtopic', rawTopic: topic, rawSubtopic: sub });
                    }
                });
            }
        });

        // Sort within units
        Object.keys(groupedWeaknesses).forEach(unit => {
            groupedWeaknesses[unit].sort((a, b) => a.percentage - b.percentage);
        });

        return groupedWeaknesses;
    };

    const value = {
        quizHistory,
        topicStats,
        userLevel,
        streak,
        unitStats,
        achievements,
        addQuizResult,
        getWeakTopics
    };

    return (
        <StudyContext.Provider value={value}>
            {children}
        </StudyContext.Provider>
    );
};
