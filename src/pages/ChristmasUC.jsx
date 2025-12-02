import React, { useState, useEffect } from 'react';
import { Gift, Lock, Snowflake } from 'lucide-react';
import { UC_FACTS } from '../data/ucFacts';
import { useAuth } from '../context/AuthContext';

const ChristmasUC = () => {
    const { currentUser } = useAuth();
    const [openedDays, setOpenedDays] = useState([]);
    const [selectedFact, setSelectedFact] = useState(null);

    // Load opened days from local storage
    useEffect(() => {
        const saved = localStorage.getItem('christmas_uc_opened_days');
        if (saved) {
            setOpenedDays(JSON.parse(saved));
        }
    }, []);

    const handleDayClick = (day) => {
        if (openedDays.includes(day)) {
            setSelectedFact({ day, fact: UC_FACTS[day - 1] });
            return;
        }

        const newOpenedDays = [...openedDays, day];
        setOpenedDays(newOpenedDays);
        localStorage.setItem('christmas_uc_opened_days', JSON.stringify(newOpenedDays));
        setSelectedFact({ day, fact: UC_FACTS[day - 1] });
    };

    const isAdmin = currentUser?.rol === 'admin';

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="text-center text-white max-w-md">
                    <Lock className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h1 className="text-3xl font-bold mb-2">Acceso Restringido</h1>
                    <p className="text-slate-300">
                        Esta sección es exclusiva para administradores por el momento.
                        ¡Vuelve pronto para disfrutar del espíritu navideño UC!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 p-4 sm:p-8 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <Snowflake
                        key={i}
                        className="absolute text-white/10 animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            fontSize: `${Math.random() * 20 + 10}px`,
                            animationDuration: `${Math.random() * 3 + 2}s`
                        }}
                    />
                ))}
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-red-500 mb-4 font-display">
                        Christmas UC
                    </h1>
                    <p className="text-slate-300 text-lg">
                        Descubre un dato curioso de la UC cada día hasta Navidad
                    </p>
                </header>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 25 }, (_, i) => i + 1).map((day) => {
                        const isOpened = openedDays.includes(day);
                        return (
                            <button
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className={`aspect-square rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 ${isOpened
                                        ? 'bg-green-600/20 border-2 border-green-500/50 text-green-400'
                                        : 'bg-slate-800/50 border-2 border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 text-slate-300'
                                    }`}
                            >
                                {isOpened ? (
                                    <>
                                        <span className="text-3xl font-bold mb-2">{day}</span>
                                        <span className="text-xs text-center line-clamp-2">
                                            {UC_FACTS[day - 1]}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-4xl font-bold mb-2">{day}</span>
                                        <Gift className="w-6 h-6 text-red-500" />
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Modal for viewing full fact */}
                {selectedFact && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedFact(null)}>
                        <div className="bg-slate-800 p-8 rounded-2xl max-w-lg w-full border border-slate-700 relative" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setSelectedFact(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Gift className="w-8 h-8 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4">Día {selectedFact.day}</h2>
                                <p className="text-lg text-slate-300 leading-relaxed">
                                    {selectedFact.fact}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChristmasUC;
