import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, Target, PenTool, History, ArrowLeft, Sparkles } from 'lucide-react';
import { StudyProvider } from '../context/StudyContext';

// Components
import QuizGenerator from '../components/study/QuizGenerator';
import AdaptiveQuiz from '../components/study/AdaptiveQuiz';
import WeaknessDetector from '../components/study/WeaknessDetector';
import DesarrolloPractice from '../components/study/DesarrolloPractice';
import StudyHistory from '../components/study/StudyHistory';
import { Link } from 'react-router-dom';

const ModoEstudioPro = () => {
    const [activeView, setActiveView] = useState('dashboard');

    const features = [
        {
            id: 'quiz',
            title: 'Generador de Quiz',
            description: 'Crea quices personalizados sobre cualquier tema.',
            icon: Brain,
            color: 'bg-purple-100 text-purple-600',
            component: <QuizGenerator />
        },
        {
            id: 'adaptive',
            title: 'Quiz Adaptativo',
            description: 'La dificultad se ajusta a tu nivel automáticamente.',
            icon: TrendingUp,
            color: 'bg-blue-100 text-blue-600',
            component: <AdaptiveQuiz />
        },
        {
            id: 'weakness',
            title: 'Detección de Debilidades',
            description: 'Refuerza los temas donde más fallas.',
            icon: Target,
            color: 'bg-red-100 text-red-600',
            component: <WeaknessDetector />
        },
        {
            id: 'development',
            title: 'Práctica de Desarrollo',
            description: 'Mejora tu redacción con corrección IA.',
            icon: PenTool,
            color: 'bg-pink-100 text-pink-600',
            component: <DesarrolloPractice />
        },
        {
            id: 'history',
            title: 'Historial y Progreso',
            description: 'Revisa tus sesiones anteriores.',
            icon: History,
            color: 'bg-green-100 text-green-600',
            component: <StudyHistory />
        }
    ];

    const activeFeature = features.find(f => f.id === activeView);

    return (
        <StudyProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {activeView !== 'dashboard' ? (
                                <button
                                    onClick={() => setActiveView('dashboard')}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                </button>
                            ) : (
                                <Link to="/material" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                </Link>
                            )}
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                Modo Estudio Pro
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <AnimatePresence mode="wait">
                        {activeView === 'dashboard' ? (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {features.map((feature) => (
                                    <button
                                        key={feature.id}
                                        onClick={() => setActiveView(feature.id)}
                                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-900 transition-all text-left group"
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {feature.description}
                                        </p>
                                    </button>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="feature"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {activeFeature && activeFeature.component}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </StudyProvider>
    );
};

export default ModoEstudioPro;
