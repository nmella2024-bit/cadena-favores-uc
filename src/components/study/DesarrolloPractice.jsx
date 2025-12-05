import React, { useState } from 'react';
import { studyAI } from '../../services/studyAI';
import { useStudy } from '../../context/StudyContext';
import { PenTool, Loader2, Send } from 'lucide-react';

const DesarrolloPractice = () => {
    const { addQuizResult } = useStudy();
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleSubmit = async () => {
        if (!question || !answer) return;
        setLoading(true);
        try {
            const result = await studyAI.gradeAnswer(question, answer);
            setFeedback(result);

            // Save result
            addQuizResult({
                topic: 'Práctica Desarrollo',
                score: result.score >= 60 ? 1 : 0,
                total: 1,
                date: new Date().toISOString(),
                type: 'open'
            });
        } catch (error) {
            alert('Error al evaluar la respuesta');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setQuestion('');
        setAnswer('');
        setFeedback(null);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                    <PenTool className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Práctica de Desarrollo</h2>
            </div>

            {!feedback ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Pregunta o Tema a Desarrollar</label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Escribe la pregunta que quieres responder..."
                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Tu Respuesta</label>
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Desarrolla tu respuesta aquí..."
                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 min-h-[150px]"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !question || !answer}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                            <>
                                <Send className="w-4 h-4" /> Enviar para Revisión
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-4">
                        <div className={`text-3xl font-bold ${feedback.score >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                            {feedback.score}/100
                        </div>
                        <div className="flex-1 h-3 bg-gray-200 rounded-full">
                            <div
                                className={`h-3 rounded-full ${feedback.score >= 60 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${feedback.score}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                            <strong className="text-green-800 block mb-1">👍 Lo bueno:</strong>
                            <p className="text-green-700">{feedback.feedback.good}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <strong className="text-red-800 block mb-1">👎 A mejorar:</strong>
                            <p className="text-red-700">{feedback.feedback.bad}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <strong className="text-blue-800 block mb-1">💡 Sugerencia:</strong>
                            <p className="text-blue-700">{feedback.feedback.improvement}</p>
                        </div>
                    </div>

                    <button
                        onClick={reset}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold transition-colors"
                    >
                        Practicar Otra Pregunta
                    </button>
                </div>
            )}
        </div>
    );
};

export default DesarrolloPractice;
