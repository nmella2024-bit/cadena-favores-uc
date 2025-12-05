import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';

const QuizPlayer = ({ quizData, onComplete, onClose }) => {
    const { addQuizResult } = useStudy();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const currentQuestion = quizData?.questions?.[currentIndex];

    // Debugging
    console.log('QuizPlayer Render:', {
        currentIndex,
        total: quizData?.questions?.length,
        currentQuestion
    });

    if (!currentQuestion && !showResults) {
        return (
            <div className="text-center p-8">
                <p className="text-red-500 mb-4">Lo sentimos, ha ocurrido un error al cargar la pregunta.</p>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                    Volver
                </button>
            </div>
        );
    }

    const [details, setDetails] = useState([]); // [{ subtopic, isCorrect }]

    const handleOptionSelect = (index) => {
        if (isChecked) return;
        setSelectedOption(index);
        setIsChecked(true);

        const isCorrect = index === currentQuestion.correctIndex;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        // Track details
        setDetails(prev => [
            ...prev,
            {
                subtopic: currentQuestion.subtopic,
                unit: currentQuestion.unit,
                isCorrect
            }
        ]);
    };

    const handleNext = () => {
        if (currentIndex < quizData.questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsChecked(false);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        setShowResults(true);
        addQuizResult({
            topic: quizData.topic || 'General',
            score: score + (selectedOption === currentQuestion.correctIndex ? 0 : 0), // Already added in handleOptionSelect? Yes.
            // Wait, handleOptionSelect adds to score state, but finishQuiz uses current score state.
            // The issue is if finishQuiz is called immediately after handleOptionSelect (e.g. last question).
            // But handleNext calls finishQuiz. handleNext is called by button click.
            // So score state is already updated.
            // However, handleOptionSelect updates details state.
            // If user clicks "Ver Resultados" immediately after selecting option (if we had auto-advance), it might be race condition.
            // But we have a "Next/Finish" button that appears AFTER selection. So state should be stable.
            total: quizData.questions.length,
            date: new Date().toISOString(),
            type: 'quiz',
            details: details
        });
        if (onComplete) onComplete(score);
    };

    if (showResults) {
        return (
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">¡Quiz Completado!</h2>
                <div className="text-6xl mb-4">
                    {score / quizData.questions.length >= 0.6 ? '🎉' : '📚'}
                </div>
                <p className="text-xl mb-6">
                    Tu puntaje: <span className="font-bold text-purple-600">{score}</span> / {quizData.questions.length}
                </p>
                <button
                    onClick={onClose}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Volver al Menú
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-gray-500">Pregunta {currentIndex + 1} de {quizData.questions.length}</span>
                <span className="text-sm font-bold text-purple-600">Puntaje: {score}</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / quizData.questions.length) * 100}%` }}
                />
            </div>

            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                {currentQuestion.question || 'Pregunta sin texto'}
            </h3>

            <div className="space-y-3 mb-6">
                {Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option, idx) => {
                        let className = "w-full text-left p-4 rounded-lg border transition-all ";
                        if (isChecked) {
                            if (idx === currentQuestion.correctIndex) className += "bg-green-100 border-green-500 text-green-800";
                            else if (idx === selectedOption) className += "bg-red-100 border-red-500 text-red-800";
                            else className += "border-gray-200 opacity-50";
                        } else {
                            className += "border-gray-200 hover:border-purple-500 hover:bg-purple-50";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                disabled={isChecked}
                                className={className}
                            >
                                {option}
                            </button>
                        );
                    })
                ) : (
                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
                        ⚠️ Esta pregunta no tiene opciones válidas.
                        <button
                            onClick={handleNext}
                            className="block mt-2 text-sm font-bold underline"
                        >
                            Saltar pregunta
                        </button>
                    </div>
                )}
            </div>

            {isChecked && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4 text-sm text-blue-800">
                        <strong>Explicación:</strong> {currentQuestion.explanation}
                    </div>
                    <button
                        onClick={handleNext}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-bold transition-colors"
                    >
                        {currentIndex < quizData.questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizPlayer;
