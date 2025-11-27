import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import LevelRing from '../gamification/LevelRing';
import { Trophy, Crown, Medal } from 'lucide-react';

const WallOfFame = () => {
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopUsers = async () => {
            try {
                // En un escenario real, esto debería filtrar por fecha (esta semana)
                // Por ahora, mostraremos los usuarios con más reputación/XP global
                const q = query(collection(db, 'usuarios'), orderBy('xp', 'desc'), limit(3));
                const querySnapshot = await getDocs(q);

                const users = [];
                querySnapshot.forEach((doc) => {
                    users.push({ id: doc.id, ...doc.data() });
                });

                setTopUsers(users);
            } catch (error) {
                console.error('Error fetching top users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopUsers();
    }, []);

    if (loading) {
        return <div className="h-48 animate-pulse rounded-2xl bg-card/50"></div>;
    }

    if (topUsers.length === 0) return null;

    return (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:bg-card/80">
            <div className="flex items-center gap-2 mb-6">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-bold tracking-tight">Muro de la Fama</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {/* 2nd Place */}
                {topUsers[1] && (
                    <div className="flex flex-col items-center justify-end p-4 rounded-xl bg-card/50 border border-border mt-4">
                        <div className="mb-3 relative">
                            <LevelRing user={topUsers[1]} size="md" />
                            <div className="absolute -top-2 -right-2 bg-gray-300 text-gray-800 rounded-full p-1 shadow-sm">
                                <Medal className="h-3 w-3" />
                            </div>
                        </div>
                        <p className="font-semibold text-sm text-center truncate w-full">{topUsers[1].nombre}</p>
                        <p className="text-xs text-text-muted">{topUsers[1].xp || 0} XP</p>
                    </div>
                )}

                {/* 1st Place */}
                {topUsers[0] && (
                    <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/20 relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-yellow-500/50"></div>
                        <div className="mb-3 relative scale-110">
                            <LevelRing user={topUsers[0]} size="lg" />
                            <div className="absolute -top-3 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-1.5 shadow-md animate-bounce">
                                <Crown className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="font-bold text-base text-center truncate w-full">{topUsers[0].nombre}</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">{topUsers[0].xp || 0} XP</p>
                        <span className="mt-2 text-[10px] uppercase tracking-wider font-bold text-yellow-500/80">MVP Semanal</span>
                    </div>
                )}

                {/* 3rd Place */}
                {topUsers[2] && (
                    <div className="flex flex-col items-center justify-end p-4 rounded-xl bg-card/50 border border-border mt-4">
                        <div className="mb-3 relative">
                            <LevelRing user={topUsers[2]} size="md" />
                            <div className="absolute -top-2 -right-2 bg-amber-700 text-amber-100 rounded-full p-1 shadow-sm">
                                <Medal className="h-3 w-3" />
                            </div>
                        </div>
                        <p className="font-semibold text-sm text-center truncate w-full">{topUsers[2].nombre}</p>
                        <p className="text-xs text-text-muted">{topUsers[2].xp || 0} XP</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WallOfFame;
