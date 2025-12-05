import React, { useState } from 'react';
import { useStudy, StudyProvider } from '../context/StudyContext';
import { Link } from 'react-router-dom';
import {
    Brain,
    Target,
    History,
    LineChart,
    BookOpen,
    ArrowLeft,
    GraduationCap,
    Flame,
    Trophy
} from 'lucide-react';

import ExerciseBank from '../components/study/ExerciseBank';
import QuizGenerator from '../components/study/QuizGenerator';
import AdaptiveQuiz from '../components/study/AdaptiveQuiz';
import WeaknessDetector from '../components/study/WeaknessDetector';
import DesarrolloPractice from '../components/study/DesarrolloPractice';
import StudyHistory from '../components/study/StudyHistory';
import Achievements from '../components/study/Achievements';

const Dashboard = () => {
    const { userLevel, streak, unitStats } = useStudy();
    const [activeTab, setActiveTab] = useState('generator');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/material" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="bg-purple-600 p-2 rounded-lg">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                                    Modo Estudio Pro
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Nivel {userLevel} • Adaptativo</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full border border-orange-200 dark:border-orange-800">
                            <Flame className="w-4 h-4" />
                            <span className="text-sm font-bold">{streak} días</span>
                        </div>
                        <div className="hidden md:block text-sm text-gray-500">
                            Potenciado por AI
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-3 space-y-6">
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('generator')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'generator' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                            >
                                <Brain className="w-5 h-5" />
                                <span className="font-medium">Generador de Quiz</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('bank')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'bank' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                            >
                                <BookOpen className="w-5 h-5" />
                                <span className="font-medium">Banco de Ejercicios</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('adaptive')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'adaptive' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                            >
                                <Target className="w-5 h-5" />
                                <span className="font-medium">Quiz Adaptativo</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('weakness')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'weakness' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                            >
                                <LineChart className="w-5 h-5" />
                                <span className="font-medium">Detectar Debilidades</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('desarrollo')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'desarrollo' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                            >
                                <BookOpen className="w-5 h-5" />
                                <span className="font-medium">Práctica Desarrollo</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('achievements')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'achievements' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                            >
                                <Trophy className="w-5 h-5" />
                                <span className="font-medium">Logros</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                            >
                                <History className="w-5 h-5" />
                                <span className="font-medium">Historial</span>
                            </button>
                        </nav>

                        {/* Unit Progress Widget */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Progreso por Unidad</h3>
                            <div className="space-y-3">
                                {Object.entries(unitStats).length > 0 ? (
                                    Object.entries(unitStats).map(([unit, stats]) => {
                                        const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                                        return (
                                            <div key={unit}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-medium truncate max-w-[120px]">{unit}</span>
                                                    <span className="text-gray-500">{percentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-gray-400 italic">Completa quizzes para ver tu progreso.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9">
                        {activeTab === 'generator' && <QuizGenerator />}
                        {activeTab === 'bank' && <ExerciseBank />}
                        {activeTab === 'adaptive' && <AdaptiveQuiz />}
                        {activeTab === 'weakness' && <WeaknessDetector />}
                        {activeTab === 'desarrollo' && <DesarrolloPractice />}
                        {activeTab === 'history' && <StudyHistory />}
                        {activeTab === 'achievements' && <Achievements />}
                    </div>
                </div>
            </main>
        </div>
    );
};

const ModoEstudioPro = () => {
    return (
        <StudyProvider>
            <Dashboard />
        </StudyProvider>
    );
};

export default ModoEstudioPro;
