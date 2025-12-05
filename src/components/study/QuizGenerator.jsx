import React, { useState } from 'react';
import { generateQuiz } from '../../services/studyAI';
import QuizPlayer from './QuizPlayer';
import { Loader2, Brain } from 'lucide-react';

const QuizGenerator = () => {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [config, setConfig] = useState({
        numQuestions: 5,
        questionType: 'multiple-choice'
    });

    const handleGenerate = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const data = await generateQuiz(topic, config);
            // Ensure data has topic for history
            setQuizData({ ...data, topic });
        } catch (error) {
            alert('Error al generar el quiz. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (quizData) {
        return <QuizPlayer quizData={quizData} onClose={() => setQuizData(null)} />;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                    <Brain className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Generador de Quizzes</h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Tema de Estudio</label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ej: Cálculo I, Historia de Chile..."
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo</label>
                        <select
                            value={config.questionType}
                            onChange={(e) => setConfig({ ...config, questionType: e.target.value })}
                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="multiple-choice">Alternativas</option>
                            <option value="open">Desarrollo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Cantidad</label>
                        <select
                            value={config.numQuestions}
                            onChange={(e) => setConfig({ ...config, numQuestions: parseInt(e.target.value) })}
                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value={5}>5 Preguntas</option>
                            <option value={10}>10 Preguntas</option>
                            <option value={15}>15 Preguntas</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || !topic}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Generar Quiz'}
                </button>
            </div>
        </div>
    );
};

export default QuizGenerator;
