import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { Trophy, TrendingUp, AlertCircle, CheckCircle, Circle } from 'lucide-react';

const MasteryDashboard = () => {
    const { unitStats } = useStudy();

    // Calculate Overall Mastery
    const calculateOverallMastery = () => {
        const units = Object.values(unitStats);
        if (units.length === 0) return 0;

        let totalPercentage = 0;
        units.forEach(stat => {
            const p = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
            totalPercentage += p;
        });

        return Math.round(totalPercentage / units.length);
    };

    const overallMastery = calculateOverallMastery();

    // Helper to get color and icon based on percentage
    const getStatusConfig = (percentage) => {
        if (percentage >= 70) return {
            color: 'text-green-500',
            bg: 'bg-green-500',
            lightBg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            icon: CheckCircle,
            label: 'Dominado'
        };
        if (percentage >= 40) return {
            color: 'text-yellow-500',
            bg: 'bg-yellow-500',
            lightBg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-200 dark:border-yellow-800',
            icon: Circle, // Or a dash/loading icon
            label: 'En Progreso'
        };
        return {
            color: 'text-red-500',
            bg: 'bg-red-500',
            lightBg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            icon: AlertCircle,
            label: 'Necesita Refuerzo'
        };
    };

    return (
        <div className="space-y-6">
            {/* Overall Mastery Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-bl-full -mr-8 -mt-8" />

                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Dominio Global</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tu nivel de maestría en todas las unidades</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                                {overallMastery}%
                            </span>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                {/* Main Progress Bar */}
                <div className="mt-6 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${overallMastery}%` }}
                    />
                </div>
            </div>

            {/* Units Grid */}
            <div className="grid grid-cols-1 gap-4">
                {Object.entries(unitStats).length > 0 ? (
                    Object.entries(unitStats).map(([unit, stats]) => {
                        const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                        const config = getStatusConfig(percentage);
                        const Icon = config.icon;

                        return (
                            <div key={unit} className={`group bg-white dark:bg-gray-800 p-4 rounded-xl border ${config.border} hover:shadow-md transition-all duration-300`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                            {unit}
                                        </h4>
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.lightBg} ${config.color}`}>
                                            <Icon className="w-3 h-3" />
                                            {config.label}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-lg font-bold ${config.color}`}>
                                            {percentage}%
                                        </span>
                                        <p className="text-xs text-gray-400">
                                            {stats.correct}/{stats.total} correctas
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full ${config.bg} rounded-full transition-all duration-700 ease-out`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aún no tienes estadísticas.</p>
                        <p className="text-sm text-gray-400">Completa quizzes para ver tu mapa de dominio.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MasteryDashboard;
