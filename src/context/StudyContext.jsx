import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const StudyContext = createContext();

export const useStudy = () => {
    const context = useContext(StudyContext);
    if (!context) {
        throw new Error('useStudy must be used within a StudyProvider');
    }
    return context;
};

export const StudyProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial State (Default Empty)
    const [quizHistory, setQuizHistory] = useState([]);
    const [topicStats, setTopicStats] = useState({});
    const [userLevel, setUserLevel] = useState(3);
    const [streak, setStreak] = useState(0);
    const [lastStudyDate, setLastStudyDate] = useState(null);
    const [unitStats, setUnitStats] = useState({});
    const [achievements, setAchievements] = useState([]);

    // 1. Auth Listener & Data Fetching
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // User Logged In: Fetch from Firestore
                const docRef = doc(db, 'users', currentUser.uid, 'study', 'data');

                // Real-time listener for sync across devices
                const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setQuizHistory(data.quizHistory || []);
                        setTopicStats(data.topicStats || {});
                        setUserLevel(data.userLevel || 3);
                        setStreak(data.streak || 0);
                        setLastStudyDate(data.lastStudyDate || null);
                        setUnitStats(data.unitStats || {});
                        setAchievements(data.achievements || []);
                    } else {
                        // New user or no data yet: Try to merge local data if exists? 
                        // For now, just start fresh or keep defaults.
                        // Optional: Upload local data if it was just created? 
                        // Let's keep it simple: Cloud is source of truth.
                    }
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                // User Logged Out: Load from LocalStorage (Guest Mode)
                setQuizHistory(JSON.parse(localStorage.getItem('study_quizHistory') || '[]'));
                setTopicStats(JSON.parse(localStorage.getItem('study_topicStats') || '{}'));
                setUserLevel(parseInt(localStorage.getItem('study_userLevel') || '3'));
                setStreak(parseInt(localStorage.getItem('study_streak') || '0'));
                setLastStudyDate(localStorage.getItem('study_lastDate') || null);
                setUnitStats(JSON.parse(localStorage.getItem('study_unitStats') || '{}'));
                setAchievements(JSON.parse(localStorage.getItem('study_achievements') || '[]'));
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // 2. Persistence Helper
    const saveProgress = async (newData) => {
        // Update Local State
        if (newData.quizHistory) setQuizHistory(newData.quizHistory);
        if (newData.topicStats) setTopicStats(newData.topicStats);
        if (newData.userLevel) setUserLevel(newData.userLevel);
        if (newData.streak) setStreak(newData.streak);
        if (newData.lastStudyDate) setLastStudyDate(newData.lastStudyDate);
        if (newData.unitStats) setUnitStats(newData.unitStats);
        if (newData.achievements) setAchievements(newData.achievements);

        // Persist to Cloud or Local
        if (user) {
            const docRef = doc(db, 'users', user.uid, 'study', 'data');
            // Construct full object to save (merge true handles partial updates, but we want consistency)
            // We need the CURRENT state merged with NEW data for the write.
            // Since state updates are async, we rely on the passed 'newData' being the complete new value for that field,
            // and fallback to current state for others.

            const dataToSave = {
                quizHistory: newData.quizHistory || quizHistory,
                topicStats: newData.topicStats || topicStats,
                userLevel: newData.userLevel || userLevel,
                streak: newData.streak || streak,
                lastStudyDate: newData.lastStudyDate || lastStudyDate,
                unitStats: newData.unitStats || unitStats,
                achievements: newData.achievements || achievements,
                updatedAt: new Date().toISOString()
            };

            try {
                await setDoc(docRef, dataToSave, { merge: true });
            } catch (error) {
                console.error("Error saving to Firestore:", error);
            }
        } else {
            // Save to LocalStorage
            if (newData.quizHistory) localStorage.setItem('study_quizHistory', JSON.stringify(newData.quizHistory));
            if (newData.topicStats) localStorage.setItem('study_topicStats', JSON.stringify(newData.topicStats));
            if (newData.userLevel) localStorage.setItem('study_userLevel', newData.userLevel.toString());
            if (newData.streak) localStorage.setItem('study_streak', newData.streak.toString());
            if (newData.lastStudyDate) localStorage.setItem('study_lastDate', newData.lastStudyDate);
            if (newData.unitStats) localStorage.setItem('study_unitStats', JSON.stringify(newData.unitStats));
            if (newData.achievements) localStorage.setItem('study_achievements', JSON.stringify(newData.achievements));
        }
    };

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
        let totalQ = 0;
        Object.values(newStats).forEach(s => totalQ += s.total);
        if (totalQ >= 50 && !unlockedSet.has('scholar')) {
            newUnlocked.push('scholar');
        }

        if (newUnlocked.length > 0) {
            const updatedAchievements = [...achievements, ...newUnlocked];
            // We need to return this to be saved, not just set state, to avoid race conditions in saveProgress
            return updatedAchievements;
        }
        return null;
    };

    // Acciones
    const addQuizResult = (result) => {
        const { topic, score, total, type, details } = result;

        // 1. Update History
        const newHistory = [result, ...quizHistory];

        // 2. Update Streak
        const today = new Date().toDateString();
        const last = lastStudyDate ? new Date(lastStudyDate).toDateString() : null;
        let newStreak = streak;
        let newLastDate = lastStudyDate;

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
            newLastDate = new Date().toISOString();
        }

        // 3. Update Stats
        let newTopicStats = { ...topicStats };
        let newUnitStats = { ...unitStats };

        const currentStats = newTopicStats[topic] || { correct: 0, total: 0, subtopics: {} };
        const newCorrect = currentStats.correct + score;
        const newTotal = currentStats.total + total;
        const currentSubtopics = currentStats.subtopics || {};
        let updatedSubtopics = { ...currentSubtopics };

        // Determine Unit
        const unit = details && details.length > 0 && details.find(d => d.unit)?.unit;
        const finalUnit = unit || currentStats.unit || 'General';

        if (details && Array.isArray(details)) {
            details.forEach(d => {
                if (d.subtopic) {
                    const sub = updatedSubtopics[d.subtopic] || { correct: 0, total: 0 };
                    updatedSubtopics[d.subtopic] = {
                        correct: sub.correct + (d.isCorrect ? 1 : 0),
                        total: sub.total + 1
                    };
                }
                if (d.unit) {
                    const uStat = newUnitStats[d.unit] || { correct: 0, total: 0 };
                    newUnitStats[d.unit] = {
                        correct: uStat.correct + (d.isCorrect ? 1 : 0),
                        total: uStat.total + 1
                    };
                }
            });
        }

        newTopicStats[topic] = {
            correct: newCorrect,
            total: newTotal,
            subtopics: updatedSubtopics,
            unit: finalUnit
        };

        // 4. Achievements
        const newAchievements = checkAchievements(newTopicStats, newStreak, 0);

        // 5. User Level
        let newUserLevel = userLevel;
        const percentage = total > 0 ? score / total : 0;
        if (total > 0) {
            if (percentage >= 0.8 && userLevel < 5) {
                newUserLevel += 1;
            } else if (percentage < 0.4 && userLevel > 1) {
                newUserLevel -= 1;
            }
        }

        // SAVE EVERYTHING AT ONCE
        saveProgress({
            quizHistory: newHistory,
            streak: newStreak,
            lastStudyDate: newLastDate || lastStudyDate, // Keep existing if not updated
            topicStats: newTopicStats,
            unitStats: newUnitStats,
            achievements: newAchievements || achievements,
            userLevel: newUserLevel
        });
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
        getWeakTopics,
        loading
    };

    return (
        <StudyContext.Provider value={value}>
            {children}
        </StudyContext.Provider>
    );
};
