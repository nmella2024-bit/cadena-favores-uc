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
    const [studyHistory, setStudyHistory] = useState([]);
    const [weakTopics, setWeakTopics] = useState([]);
    const [userLevel, setUserLevel] = useState('Intermedio'); // Principiante, Intermedio, Avanzado

    // Load from LocalStorage on mount
    useEffect(() => {
        const storedHistory = localStorage.getItem('studyHistory');
        const storedLevel = localStorage.getItem('userLevel');

        if (storedHistory) {
            setStudyHistory(JSON.parse(storedHistory));
        }
        if (storedLevel) {
            setUserLevel(storedLevel);
        }
    }, []);

    // Calculate Weak Topics whenever history changes
    useEffect(() => {
        if (studyHistory.length === 0) return;

        const topicStats = {};

        studyHistory.forEach(session => {
            // Assuming session.details contains breakdown by topic/subtopic
            // or session.topic is the main topic
            const topic = session.topic;
            if (!topicStats[topic]) {
                topicStats[topic] = { correct: 0, total: 0 };
            }
            topicStats[topic].correct += session.correct;
            topicStats[topic].total += session.total;
        });

        const weak = [];
        Object.keys(topicStats).forEach(topic => {
            const stats = topicStats[topic];
            const percentage = stats.total > 0 ? (stats.correct / stats.total) : 0;
            if (percentage < 0.6) {
                weak.push({ topic, percentage, stats });
            }
        });

        setWeakTopics(weak);
    }, [studyHistory]);

    const addResult = (result) => {
        // result: { date, topic, type, correct, total, details? }
        const newHistory = [result, ...studyHistory];
        setStudyHistory(newHistory);
        localStorage.setItem('studyHistory', JSON.stringify(newHistory));

        // Update Adaptive Level Logic (Simple Heuristic)
        // If last 3 quizzes > 80% -> Level Up
        // If last 2 quizzes < 40% -> Level Down
        updateAdaptiveLevel(newHistory);
    };

    const updateAdaptiveLevel = (history) => {
        if (history.length < 3) return;

        const last3 = history.slice(0, 3);
        const allGood = last3.every(h => (h.correct / h.total) >= 0.8);

        if (allGood && userLevel !== 'Avanzado') {
            const next = userLevel === 'Principiante' ? 'Intermedio' : 'Avanzado';
            setUserLevel(next);
            localStorage.setItem('userLevel', next);
            return;
        }

        const last2 = history.slice(0, 2);
        const allBad = last2.every(h => (h.correct / h.total) <= 0.4);

        if (allBad && userLevel !== 'Principiante') {
            const prev = userLevel === 'Avanzado' ? 'Intermedio' : 'Principiante';
            setUserLevel(prev);
            localStorage.setItem('userLevel', prev);
        }
    };

    const value = {
        studyHistory,
        weakTopics,
        userLevel,
        addResult,
        setUserLevel
    };

    return (
        <StudyContext.Provider value={value}>
            {children}
        </StudyContext.Provider>
    );
};
