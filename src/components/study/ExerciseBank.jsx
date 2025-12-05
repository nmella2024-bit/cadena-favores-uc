import React, { useState } from 'react';
import { Book, ChevronRight, Play, Layers, Calculator, Atom, Sigma } from 'lucide-react';
import { studyAI } from '../../services/studyAI';
import QuizPlayer from './QuizPlayer';

const SYLLABUS = {
    "Cálculo I": {
        icon: <Calculator className="w-6 h-6" />,
        color: "text-blue-500",
        bg: "bg-blue-100",
        topics: [
            "Números Reales y Desigualdades",
            "Funciones y Gráficas",
            "Límites y Continuidad",
            "Derivadas: Concepto y Reglas",
            "Aplicaciones de la Derivada",
            "Integrales Indefinidas"
        ]
    },
    "Álgebra Lineal": {
        icon: <Layers className="w-6 h-6" />,
        color: "text-purple-500",
        bg: "bg-purple-100",
        topics: [
            "Matrices y Determinantes",
            "Sistemas de Ecuaciones Lineales",
            "Espacios Vectoriales",
            "Transformaciones Lineales",
            "Valores y Vectores Propios"
        ]
    },
    "Física I": {
        icon: <Atom className="w-6 h-6" />,
        color: "text-orange-500",
        bg: "bg-orange-100",
        topics: [
            "Vectores y Cinemática",
            "Dinámica de la Partícula (Leyes de Newton)",
            "Trabajo y Energía",
            "Momento Lineal y Colisiones",
            "Dinámica de Rotación"
        ]
    },
    "Cálculo II": {
        icon: <Sigma className="w-6 h-6" />,
        color: "text-red-500",
        bg: "bg-red-100",
        topics: [
            "Técnicas de Integración",
            "Integrales Impropias",
            "Sucesiones y Series",
            "Coordenadas Polares",
            "Vectores en el Espacio"
        ]
    }
};

const ExerciseBank = () => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [quizData, setQuizData] = useState(null);

    const handleGenerateGuide = async (course, topic) => {
        setIsGenerating(true);
        try {
            const prompt = `Genera una guía de ejercicios práctica y desafiante sobre "${topic}" para el curso de "${course}". Incluye problemas variados.`;

            const data = await studyAI.generateQuiz(prompt, {
                numQuestions: 5,
                type: 'mixed' // Mezcla de selección múltiple y desarrollo si es posible, o solo multiple por ahora para seguridad
            });

            // Enforce unit tagging for gamification
            const taggedQuestions = data.questions.map(q => ({
                ...q,
                unit: course, // Tag with the course name
                subtopic: topic
            }));

            setQuizData({ ...data, questions: taggedQuestions });
        } catch (error) {
            console.error("Error generating guide:", error);
            alert("Hubo un error generando la guía. Por favor intenta de nuevo.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBack = () => {
        setQuizData(null);
    };

    if (quizData) {
        return (
            <div className="space-y-4">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Volver al Banco de Ejercicios
                </button>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Guía de Ejercicios: {selectedTopic}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Curso: {selectedCourse} • 5 Ejercicios Generados por IA
                    </p>
                </div>
                <QuizPlayer
                    quizData={quizData}
                    onComplete={() => { }}
                    onExit={handleBack}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Banco de Ejercicios</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Selecciona un ramo y materia para generar una guía de estudio instantánea.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Selection */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 px-2">
                        1. Selecciona un Ramo
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(SYLLABUS).map(([course, data]) => (
                            <button
                                key={course}
                                onClick={() => {
                                    setSelectedCourse(course);
                                    setSelectedTopic(null);
                                }}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${selectedCourse === course
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
                                    }`}
                            >
                                <div className={`p-3 rounded-lg ${data.bg} ${data.color}`}>
                                    {data.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{course}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {data.topics.length} Unidades
                                    </p>
                                </div>
                                <ChevronRight className={`w-5 h-5 ml-auto text-gray-400 transition-transform ${selectedCourse === course ? 'rotate-90' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Topic Selection */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 px-2">
                        2. Selecciona una Materia
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[400px] p-4">
                        {!selectedCourse ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                                <Book className="w-12 h-12 mb-3 opacity-20" />
                                <p>Selecciona un ramo a la izquierda para ver sus materias.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${SYLLABUS[selectedCourse].bg} ${SYLLABUS[selectedCourse].color}`}>
                                        {selectedCourse}
                                    </span>
                                    <span className="text-sm text-gray-500">Selecciona un tema:</span>
                                </div>
                                {SYLLABUS[selectedCourse].topics.map((topic) => (
                                    <button
                                        key={topic}
                                        onClick={() => handleGenerateGuide(selectedCourse, topic)}
                                        disabled={isGenerating}
                                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 group transition-colors text-left"
                                    >
                                        <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                            {topic}
                                        </span>
                                        {isGenerating && selectedTopic === topic ? (
                                            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Play className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors opacity-0 group-hover:opacity-100" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isGenerating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-4 animate-in zoom-in duration-300">
                        <div className="relative w-20 h-20 mx-auto">
                            <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Creando Guía de Ejercicios...
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                La IA está redactando problemas únicos sobre <strong>{selectedTopic || 'el tema seleccionado'}</strong> para ti.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExerciseBank;
