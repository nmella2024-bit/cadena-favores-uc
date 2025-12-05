import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StudyProvider } from '../context/StudyContext';
import QuizGenerator from '../components/study/QuizGenerator';
import AdaptiveQuiz from '../components/study/AdaptiveQuiz';
import WeaknessDetector from '../components/study/WeaknessDetector';
import DesarrolloPractice from '../components/study/DesarrolloPractice';
import StudyHistory from '../components/study/StudyHistory';
import { ArrowLeft, GraduationCap, LayoutGrid } from 'lucide-react';

const ModoEstudioPro = () => {
    const [activeTab, setActiveTab] = useState('generator');

    const renderContent = () => {
        switch (activeTab) {
            case 'generator': return <QuizGenerator />;
            case 'adaptive': return <AdaptiveQuiz />;
            case 'weakness': return <WeaknessDetector />;
            case 'desarrollo': return <DesarrolloPractice />;
            case 'history': return <StudyHistory />;
            default: return <QuizGenerator />;
        }
    };

    return (
        <StudyProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link to="/material" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <GraduationCap className="w-8 h-8 text-purple-600" />
                                Modo Estudio Pro
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">Tu centro de aprendizaje inteligente</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1 space-y-2">
                            <NavButton
                                active={activeTab === 'generator'}
                                onClick={() => setActiveTab('generator')}
                                label="Generador de Quizzes"
                                icon="⚡"
                            />
                            <NavButton
                                active={activeTab === 'adaptive'}
                                onClick={() => setActiveTab('adaptive')}
                                label="Quiz Adaptativo"
                                icon="📈"
                            />
                            <NavButton
                                active={activeTab === 'weakness'}
                                onClick={() => setActiveTab('weakness')}
                                label="Detector de Debilidades"
                                icon="🎯"
                            />
                            <NavButton
                                active={activeTab === 'desarrollo'}
                                onClick={() => setActiveTab('desarrollo')}
                                label="Práctica de Desarrollo"
                                icon="✍️"
                            />
                            <NavButton
                                active={activeTab === 'history'}
                                onClick={() => setActiveTab('history')}
                                label="Historial"
                                icon="🕒"
                            />
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-3">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </StudyProvider>
    );
};

const NavButton = ({ active, onClick, label, icon }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 font-medium ${active
                ? 'bg-white dark:bg-gray-800 shadow-md text-purple-600 border-l-4 border-purple-600'
                : 'hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
            }`}
    >
        <span className="text-xl">{icon}</span>
        {label}
    </button>
);

export default ModoEstudioPro;
