import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { studyAI } from '../../services/studyAI';
import { useStudy } from '../../context/StudyContext';

const QuizPlayer = ({ quizData, onComplete, onRestart }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [openAnswer, setOpenAnswer] = useState('');
    const [gradingFeedback, setGradingFeedback] = useState(null);
    const [isGrading, setIsGrading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const { addResult } = useStudy();

    const currentQuestion = quizData.questions[currentIndex];
    const isLastQuestion = currentIndex === quizData.questions.length - 1;

    const handleOptionSelect = (index) => {
        if (isChecked) return;
        setSelectedOption(index);
        setIsChecked(true);
        if (index === currentQuestion.correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    const handleOpenSubmit = async () => {
        if (!openAnswer.trim()) return;
        setIsGrading(true);
        try {
            const feedback = await studyAI.gradeAnswer(currentQuestion.question, openAnswer);
            setGradingFeedback(feedback);
            setIsChecked(true);
            if (feedback.score >= 60) {
                setScore(prev => prev + 1);
            }
        } catch (error) {
            console.error(error);
            alert("Error al corregir. Intenta de nuevo.");
        } finally {
            setIsGrading(false);
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            finishQuiz();
        } else {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsChecked(false);
            setOpenAnswer('');
            setGradingFeedback(null);
        }
    };

    const finishQuiz = () => {
        setShowResults(true);
        const finalScore = isChecked && selectedOption === currentQuestion.correctIndex ? score : score; // Adjust if last question logic needs it, but state update is immediate
        // Actually score is updated on selection/grading.

        addResult({
            date: new Date().toISOString(),
            topic: "Quiz Generado", // Ideally passed prop
            type: "Mixed",
            correct: score,
            total: quizData.questions.length
        });

        if (onComplete) onComplete(score, quizData.questions.length);
    };

    if (showResults) {
        return (
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="mb-6">
                    <div className="w-24 h-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto text-4xl">
                        🏆
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    ¡Quiz Completado!
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Tu puntaje: <span className="font-bold text-purple-600">{score}</span> / {quizData.questions.length}
                </p>
                <button
                    onClick={onRestart}
                    className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                    Intentar Otro
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                    <span>Pregunta {currentIndex + 1} de {quizData.questions.length}</span>
                    <span>Puntaje: {score}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((currentIndex + 1) / quizData.questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    {currentQuestion.question}
                </h3>

                <div className="space-y-4">
                    {currentQuestion.type === 'open' ? (
                        <div className="space-y-4">
                            <textarea
                                value={openAnswer}
                                onChange={(e) => setOpenAnswer(e.target.value)}
                                disabled={isChecked}
                                placeholder="Escribe tu respuesta..."
                                className="w-full p-4 border rounded-xl bg-gray-50 dark:bg-gray-700 min-h-[150px] focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                            {!isChecked && (
                                <button
                                    onClick={handleOpenSubmit}
                                    disabled={!openAnswer.trim() || isGrading}
                                    className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {isGrading ? 'Evaluando...' : 'Enviar Respuesta'}
                                </button>
                            )}
                        </div>
                    ) : (
                        currentQuestion.options.map((option, idx) => {
                            let className = "w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ";
                            if (isChecked) {
                                if (idx === currentQuestion.correctIndex) className += "border-green-500 bg-green-50 text-green-800";
                                else if (idx === selectedOption) className += "border-red-500 bg-red-50 text-red-800";
                                else className += "border-gray-100 opacity-50";
                            } else {
                                className += "border-gray-100 hover:border-purple-200 hover:bg-purple-50";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    disabled={isChecked}
                                    className={className}
                                >
                                    <span className="font-medium">{option}</span>
                                    {isChecked && idx === currentQuestion.correctIndex && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    {isChecked && idx === selectedOption && idx !== currentQuestion.correctIndex && <XCircle className="w-5 h-5 text-red-600" />}
                                </button>
                            );
                        })
                    )}
                </div>

                {isChecked && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700"
                    >
                        {gradingFeedback ? (
                            <div className="mb-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2 font-bold text-lg mb-2">
                                    <span>Nota: {gradingFeedback.score}/100</span>
                                    <div className={`h-2 flex-1 rounded-full ${gradingFeedback.score >= 60 ? 'bg-green-500' : 'bg-red-500'}`} />
                                </div>
                                <p className="bg-green-50 text-green-800 p-2 rounded">👍 {gradingFeedback.feedback.good}</p>
                                <p className="bg-red-50 text-red-800 p-2 rounded">👎 {gradingFeedback.feedback.bad}</p>
                                <p className="bg-blue-50 text-blue-800 p-2 rounded">💡 {gradingFeedback.feedback.improvement}</p>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 mb-4 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{currentQuestion.explanation}</p>
                            </div>
                        )}

                        <button
                            onClick={handleNext}
                            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            {isLastQuestion ? 'Ver Resultados' : 'Siguiente Pregunta'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default QuizPlayer;
