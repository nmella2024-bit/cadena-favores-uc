import React from 'react';
import { Award, Zap, Heart, ShoppingBag, Star } from 'lucide-react';

const BADGES_CONFIG = {
    first_favor: {
        id: 'first_favor',
        name: 'Buen Samaritano',
        description: 'Completaste tu primer favor',
        icon: Heart,
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    },
    speedster: {
        id: 'speedster',
        name: 'El Rayo',
        description: 'Respondiste en menos de 5 minutos',
        icon: Zap,
        color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    },
    hero: {
        id: 'hero',
        name: 'Héroe de Campus',
        description: 'Completaste 20 favores',
        icon: Award,
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    merchant: {
        id: 'merchant',
        name: 'Mercader',
        description: 'Vendiste 10 artículos',
        icon: ShoppingBag,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    legend: {
        id: 'legend',
        name: 'Leyenda UC',
        description: 'Nivel 10 alcanzado',
        icon: Star,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
};

const BadgeList = ({ badges = [] }) => {
    if (!badges || badges.length === 0) {
        return (
            <div className="text-center py-6 text-text-muted text-sm">
                Aún no has desbloqueado medallas. ¡Empieza a ayudar!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {badges.map((badgeId) => {
                const badge = BADGES_CONFIG[badgeId];
                if (!badge) return null;

                const Icon = badge.icon;

                return (
                    <div
                        key={badgeId}
                        className={`flex flex-col items-center p-3 rounded-xl border ${badge.color} text-center transition-transform hover:scale-105`}
                    >
                        <div className="mb-2 p-2 rounded-full bg-white/50 dark:bg-black/20">
                            <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold">{badge.name}</span>
                        <span className="text-[10px] opacity-80 mt-1">{badge.description}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default BadgeList;
