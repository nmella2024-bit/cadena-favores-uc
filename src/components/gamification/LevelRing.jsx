import React from 'react';
import { UserRound } from 'lucide-react';

const LevelRing = ({ user, size = 'md' }) => {
    const level = user?.level || 0;
    const xp = user?.xp || 0;

    // Calcular progreso hacia el siguiente nivel
    // Nivel = floor(sqrt(XP / 100))
    // XP necesario para nivel N = 100 * N^2
    const currentLevelXp = 100 * Math.pow(level, 2);
    const nextLevelXp = 100 * Math.pow(level + 1, 2);
    const progress = Math.min(100, Math.max(0, ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-24 h-24',
    };

    const strokeWidth = size === 'sm' ? 2 : 4;
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
            {/* Ring Background */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                <circle
                    className="text-border"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="20"
                    cy="20"
                />
                {/* Progress Ring */}
                <circle
                    className="text-brand transition-all duration-1000 ease-out"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="20"
                    cy="20"
                />
            </svg>

            {/* Avatar */}
            <div className="relative z-10 w-[85%] h-[85%] rounded-full overflow-hidden border-2 border-card">
                {user?.fotoPerfil ? (
                    <img src={user.fotoPerfil} alt={user.nombre} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-brand/10 flex items-center justify-center text-brand">
                        <UserRound className={size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} />
                    </div>
                )}
            </div>

            {/* Level Badge */}
            <div className="absolute -bottom-1 -right-1 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-card shadow-sm">
                Lv.{level}
            </div>
        </div>
    );
};

export default LevelRing;
