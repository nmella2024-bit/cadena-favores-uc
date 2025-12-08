import React, { useState, useEffect } from 'react';
import { Book, ChevronRight, Play, Layers, Calculator, Atom, Sigma, FileText, Sparkles } from 'lucide-react';
import { studyAI } from '../../services/studyAI';
import QuizPlayer from './QuizPlayer';
import { obtenerMaterialesFiltrados } from '../../services/materialService';
import { extractTextFromUrl } from '../../autoStudyDocs/contextProcessor';

const SYLLABUS = {
    "Introducción al Cálculo": {
        icon: <Calculator className="w-6 h-6" />,
        color: "text-green-500",
        bg: "bg-green-100",
        topics: [
            "Números Reales y Desigualdades",
            "Valor Absoluto",
            "Funciones: Dominio y Recorrido",
            "Composición de Funciones",
            "Funciones Inversas",
            "Trigonometría Básica"
        ]
    },
    "Cálculo I": {
        icon: <Calculator className="w-6 h-6" />,
        color: "text-blue-500",
        bg: "bg-blue-100",
        topics: [
            "Límites y Continuidad",
            "Derivadas: Definición y Reglas",
            "Regla de la Cadena",
            "Derivación Implícita",
            "Aplicaciones: Máximos y Mínimos",
            "Teorema del Valor Medio",
            "Integrales Indefinidas"
        ]
    },
    "Cálculo II": {
        icon: <Sigma className="w-6 h-6" />,
        color: "text-red-500",
        bg: "bg-red-100",
        topics: [
            "Técnicas de Integración",
            "Integrales Definidas y Áreas",
            "Volúmenes de Revolución",
            "Integrales Impropias",
            "Sucesiones y Series Numéricas",
            "Series de Potencias y Taylor",
            "Coordenadas Polares"
        ]
    },
    "Cálculo III": {
        icon: <Atom className="w-6 h-6" />,
        color: "text-indigo-500",
        bg: "bg-indigo-100",
        topics: [
            "Vectores y Geometría en el Espacio",
            "Funciones de Varias Variables",
            "Derivadas Parciales y Gradiente",
            "Optimización Multivariable (Lagrange)",
            "Integrales Dobles y Triples",
            "Campos Vectoriales",
            "Teoremas de Green, Stokes y Divergencia"
        ]
    },
    "Álgebra Lineal": {
        icon: <Layers className="w-6 h-6" />,
        color: "text-purple-500",
        bg: "bg-purple-100",
        topics: [
            "Matrices y Operaciones",
            "Determinantes e Inversa",
            "Sistemas de Ecuaciones Lineales",
            "Espacios Vectoriales y Subespacios",
            "Independencia Lineal y Bases",
            "Transformaciones Lineales",
            "Valores y Vectores Propios (Diagonalización)"
        ]
    },
    "Probabilidad y Estadística": {
        icon: <Book className="w-6 h-6" />,
        color: "text-yellow-500",
        bg: "bg-yellow-100",
        topics: [
            "Probabilidad Condicional y Bayes",
            "Variables Aleatorias Discretas",
            "Variables Aleatorias Continuas",
            "Distribuciones (Normal, Binomial, Poisson)",
            "Teorema del Límite Central",
            "Intervalos de Confianza",
            "Pruebas de Hipótesis"
        ]
    },
    "Física: Mecánica": {
        icon: <Atom className="w-6 h-6" />,
        color: "text-orange-500",
        bg: "bg-orange-100",
        topics: [
            "Cinemática en 1D y 2D",
            "Leyes de Newton (Dinámica)",
            "Trabajo y Energía",
            "Conservación del Momento Lineal",
            "Dinámica de Rotación y Torque",
            "Gravitación Universal",
            "Oscilaciones y Ondas Mecánicas"
        ]
    }
};

const ExerciseBank = () => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [realMaterials, setRealMaterials] = useState([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);

    // Fetch real materials when course changes
    useEffect(() => {
        const fetchMaterials = async () => {
            if (!selectedCourse) {
                setRealMaterials([]);
                return;
            }

            setLoadingMaterials(true);
            try {
                // Try to find materials that match the course name in 'ramo' or 'tags'
                // Since obtenerMaterialesFiltrados filters by exact 'ramo', we use that.
                // Note: This assumes the 'ramo' field in DB matches the SYLLABUS keys.
                // If not, we might need a more flexible search, but let's start with this.
                const materials = await obtenerMaterialesFiltrados({ ramo: selectedCourse });

                // Filter for "Pruebas", "Exámenes", "Ayudantías" based on title or type
                // We prioritize files that look like exams
                const relevant = materials.filter(m => {
                    const title = m.titulo.toLowerCase();
                    return title.includes('prueba') || title.includes('examen') || title.includes('control') || title.includes('ayudantía') || title.includes('guía');
                });

                setRealMaterials(relevant.slice(0, 5)); // Keep top 5
            } catch (error) {
                console.error("Error fetching course materials:", error);
            } finally {
                setLoadingMaterials(false);
            }
        };

        fetchMaterials();
    }, [selectedCourse]);

    const handleGenerateGuide = async (course, topic, mode = 'quiz') => {
        setIsGenerating(true);
        try {
            let context = "";
            let prompt = `Genera una guía de ejercicios práctica y desafiante sobre "${topic}" para el curso de "${course}". Incluye problemas variados.`;

            // If exam mode, try to use a real exam as context for style matching
            if (mode === 'exam') {
                prompt = `Genera un problema de ALTA DIFICULTAD (Tipo Prueba/Examen) para el curso "${course}". Debe ser un desafío complejo que integre múltiples conceptos.`;

                // Find a suitable real material to use as style reference
                const referenceMaterial = realMaterials.find(m =>
                    m.archivoUrl && (m.titulo.toLowerCase().includes('prueba') || m.titulo.toLowerCase().includes('examen'))
                );

                if (referenceMaterial) {
                    try {
                        console.log("Using reference material:", referenceMaterial.titulo);
                        const text = await extractTextFromUrl(referenceMaterial.archivoUrl);
                        context = `REFERENCIA DE ESTILO Y DIFICULTAD (NO COPIAR, SOLO IMITAR ESTILO):\n\n${text.substring(0, 15000)}`; // Limit context length
                        prompt += `\n\nIMPORTANTE: Usa el material adjunto como REFERENCIA del nivel de dificultad y estilo de preguntas de la universidad. NO copies los ejercicios, crea uno NUEVO con ese mismo estándar.`;
                    } catch (err) {
                        console.warn("Could not extract text from reference material:", err);
                    }
                }
            }

            const data = await studyAI.generateQuiz(prompt, {
                numQuestions: mode === 'exam' ? 1 : 5, // Exam mode = 1 big problem
                type: mode === 'exam' ? 'open' : 'mixed',
                difficulty: mode === 'exam' ? 'exam' : 'Intermedio',
                mode: mode,
                context: context // Pass the extracted text as context
            });

            // Enforce unit tagging for gamification
            const taggedQuestions = data.questions.map(q => ({
                ...q,
                unit: course, // Tag with the course name
                subtopic: topic
            }));

            setQuizData({ ...data, questions: taggedQuestions, isExam: mode === 'exam' });
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
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[400px] p-4 flex flex-col">
                        {!selectedCourse ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                                <Book className="w-12 h-12 mb-3 opacity-20" />
                                <p>Selecciona un ramo a la izquierda para ver sus materias.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300 flex-1">
                                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${SYLLABUS[selectedCourse].bg} ${SYLLABUS[selectedCourse].color}`}>
                                        {selectedCourse}
                                    </span>
                                    <span className="text-sm text-gray-500">Selecciona un tema:</span>
                                </div>

                                <button
                                    onClick={() => handleGenerateGuide(selectedCourse, 'Examen Final', 'exam')}
                                    disabled={isGenerating}
                                    className="mb-4 w-full flex items-center justify-center gap-2 p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition-colors font-bold shadow-sm"
                                >
                                    <span className="text-lg">🔥</span>
                                    Generar Ejercicio Tipo Prueba (Nivel Difícil)
                                </button>

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

                                {/* Real Materials Section */}
                                {realMaterials.length > 0 && (
                                    <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-yellow-500" />
                                            Material Real Encontrado
                                        </h4>
                                        <div className="space-y-2">
                                            {realMaterials.map((material) => (
                                                <a
                                                    key={material.id}
                                                    href={material.archivoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-transparent hover:border-purple-200 transition-all group"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-purple-500 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 line-clamp-1">
                                                                {material.titulo}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(material.fechaSubida).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                            {realMaterials.length > 0 && selectedTopic === 'Examen Final' && (
                                <p className="text-xs text-purple-600 font-medium mt-2 animate-pulse">
                                    ✨ Usando material real de la UC como referencia de estilo...
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExerciseBank;
