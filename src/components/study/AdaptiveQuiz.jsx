import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { studyAI } from '../../services/studyAI';
import QuizPlayer from './QuizPlayer';
import { TrendingUp, Loader2 } from 'lucide-react';

const AdaptiveQuiz = () => {
    const { userLevel } = useStudy();
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);

    const getDifficultyLabel = (level) => {
        if (level <= 2) return 'Básico';
        if (level <= 4) return 'Intermedio';
        return 'Avanzado';
    };

    const handleStart = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const difficulty = getDifficultyLabel(userLevel);
            const data = await studyAI.generateQuiz(topic, {
                numQuestions: 5,
                questionType: 'multiple-choice',
                difficulty
            });
            setQuizData({ ...data, topic });
        } catch (error) {
            alert('Error al iniciar quiz adaptativo');
        } finally {
            setLoading(false);
        }
    };

    if (quizData) {
        return <QuizPlayer quizData={quizData} onClose={() => setQuizData(null)} />;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Quiz Adaptativo</h2>
                    <p className="text-sm text-gray-500">Nivel actual: {userLevel}/5 ({getDifficultyLabel(userLevel)})</p>
                </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
                El sistema ajustará la dificultad de las preguntas basándose en tu rendimiento histórico.
            </p>

            <div className="space-y-4">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Tema a practicar..."
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />

                <button
                    onClick={handleStart}
                    disabled={loading || !topic}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Comenzar Desafío'}
                </button>
            </div>
        </div>
    );
};

export default AdaptiveQuiz;
