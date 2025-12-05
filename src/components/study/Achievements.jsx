import React from 'react';
import { Trophy, Flame, Target, BookOpen } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

const ACHIEVEMENTS_LIST = [
    {
        id: 'first_step',
        title: 'Primer Paso',
        description: 'Completa tu primer quiz',
        icon: <Target className="w-6 h-6" />,
        color: 'text-blue-500',
        bg: 'bg-blue-100'
    },
    {
        id: 'on_fire',
        title: 'En Racha',
        description: 'Mantén una racha de 3 días',
        icon: <Flame className="w-6 h-6" />,
        color: 'text-orange-500',
        bg: 'bg-orange-100'
    },
    {
        id: 'perfectionist',
        title: 'Perfeccionista',
        description: 'Obtén 100% en un quiz',
        icon: <Trophy className="w-6 h-6" />,
        color: 'text-yellow-500',
        bg: 'bg-yellow-100'
    },
    {
        id: 'scholar',
        title: 'Erudito',
        description: 'Responde 50 preguntas en total',
        icon: <BookOpen className="w-6 h-6" />,
        color: 'text-purple-500',
        bg: 'bg-purple-100'
    }
];

const Achievements = () => {
    const { achievements } = useStudy();
    const unlockedSet = new Set(achievements);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                    <Trophy className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Logros y Medallas</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ACHIEVEMENTS_LIST.map((achievement) => {
                    const isUnlocked = unlockedSet.has(achievement.id);
                    return (
                        <div
                            key={achievement.id}
                            className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${isUnlocked
                                    ? 'border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600'
                                    : 'border-gray-100 bg-gray-50 opacity-60 grayscale'
                                }`}
                        >
                            <div className={`p-3 rounded-full ${isUnlocked ? achievement.bg : 'bg-gray-200'} ${isUnlocked ? achievement.color : 'text-gray-400'}`}>
                                {achievement.icon}
                            </div>
                            <div>
                                <h3 className={`font-bold ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                    {achievement.title}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {achievement.description}
                                </p>
                            </div>
                            {isUnlocked && (
                                <div className="ml-auto text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                                    ¡Desbloqueado!
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Achievements;
