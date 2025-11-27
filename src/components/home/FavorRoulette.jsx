import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dices, ArrowRight, Sparkles } from 'lucide-react';
import { obtenerFavores } from '../../services/favorService';

const FavorRoulette = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const spinRoulette = async () => {
        setLoading(true);
        try {
            // Obtener todos los favores activos
            // Nota: En una app real con muchos datos, esto debería hacerse con una query más eficiente
            // o una Cloud Function que retorne un ID aleatorio.
            const favores = await obtenerFavores();
            const favoresActivos = favores.filter(f => f.estado === 'activo');

            if (favoresActivos.length > 0) {
                const randomIndex = Math.floor(Math.random() * favoresActivos.length);
                const randomFavor = favoresActivos[randomIndex];

                // Simular un pequeño delay para el efecto de "pensando"
                setTimeout(() => {
                    navigate(`/favores?id=${randomFavor.id}`);
                    setLoading(false);
                }, 800);
            } else {
                alert('No hay favores activos en este momento. ¡Sé el primero en publicar uno!');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error en la ruleta:', error);
            setLoading(false);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-black/10 blur-xl"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Dices className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">¿Te sientes con suerte?</h3>
                </div>

                <p className="text-indigo-100 mb-6 max-w-sm">
                    Deja que el destino decida a quién ayudarás hoy. ¡Gira la ruleta y haz el día de alguien!
                </p>

                <button
                    onClick={spinRoulette}
                    disabled={loading}
                    className="group flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50 hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
                >
                    {loading ? (
                        <>
                            <Sparkles className="h-4 w-4 animate-spin" />
                            Buscando destino...
                        </>
                    ) : (
                        <>
                            Girar Ruleta
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default FavorRoulette;
