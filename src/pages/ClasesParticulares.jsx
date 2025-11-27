import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Search, Plus, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerProfesores, verificarRegistroProfesor } from '../services/profesorService';
import ProfesorCard from '../components/ProfesorCard';
import RegistroProfesorModal from '../components/RegistroProfesorModal';
import AgendarClaseModal from '../components/AgendarClaseModal';
import PrimaryButton from '../components/ui/PrimaryButton';
import GhostButton from '../components/ui/GhostButton';
import TextField from '../components/ui/TextField';

const ClasesParticulares = () => {
    const { currentUser } = useAuth();
    const [profesores, setProfesores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRegistroOpen, setIsRegistroOpen] = useState(false);
    const [isAgendarOpen, setIsAgendarOpen] = useState(false);
    const [selectedProfesor, setSelectedProfesor] = useState(null);
    const [isProfesor, setIsProfesor] = useState(false);

    const cargarProfesores = async () => {
        try {
            setLoading(true);
            const data = await obtenerProfesores();
            setProfesores(data);
        } catch (error) {
            console.error('Error al cargar profesores:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarProfesores();
    }, []);

    useEffect(() => {
        const checkStatus = async () => {
            if (currentUser) {
                const registro = await verificarRegistroProfesor(currentUser.uid);
                setIsProfesor(!!registro);
            }
        };
        checkStatus();
    }, [currentUser]);

    const handleAgendar = (profesor) => {
        if (!currentUser) {
            // Redirigir a login si no está autenticado
            window.location.href = '/login';
            return;
        }
        setSelectedProfesor(profesor);
        setIsAgendarOpen(true);
    };

    const filteredProfesores = profesores.filter(p => {
        const query = searchQuery.toLowerCase();
        return (
            p.nombre.toLowerCase().includes(query) ||
            p.carrera.toLowerCase().includes(query) ||
            p.ramos.some(r => r.toLowerCase().includes(query))
        );
    });

    return (
        <div className="bg-[rgb(var(--bg-canvas))] py-12 sm:py-16">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl flex items-center gap-3">
                            <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-brand" />
                            Clases Particulares
                        </h1>
                        <p className="mt-2 text-text-muted text-lg">
                            Encuentra estudiantes de la UC dispuestos a enseñarte.
                        </p>
                    </div>

                    <div>
                        {!isProfesor ? (
                            <PrimaryButton
                                onClick={() => currentUser ? setIsRegistroOpen(true) : window.location.href = '/login'}
                                className="px-6 py-3 text-base shadow-lg shadow-brand/20"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Hacerse Profesor
                            </PrimaryButton>
                        ) : (
                            <div className="inline-flex items-center rounded-full bg-brand/10 px-4 py-2 text-sm font-medium text-brand ring-1 ring-inset ring-brand/20">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Ya eres profesor
                            </div>
                        )}
                    </div>
                </header>

                {/* Search & Filters */}
                <div className="mb-10 max-w-2xl">
                    <TextField
                        id="search"
                        placeholder="Buscar por ramo, carrera o nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={Search}
                        className="h-12 text-lg"
                    />
                </div>

                {/* Feed */}
                {loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 rounded-2xl bg-card/50 animate-pulse border border-border" />
                        ))}
                    </div>
                ) : filteredProfesores.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProfesores.map(profesor => (
                            <ProfesorCard
                                key={profesor.id}
                                profesor={profesor}
                                onAgendar={handleAgendar}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm">
                        <div className="mx-auto h-20 w-20 rounded-full bg-brand/10 flex items-center justify-center mb-6">
                            <BookOpen className="h-10 w-10 text-brand" />
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary mb-2">
                            No hay profesores disponibles
                        </h3>
                        <p className="text-text-muted max-w-md mx-auto mb-8">
                            Aún no hay profesores registrados que coincidan con tu búsqueda. ¡Sé el primero en ofrecer clases!
                        </p>
                        {!isProfesor && (
                            <PrimaryButton onClick={() => setIsRegistroOpen(true)}>
                                Hacerse Profesor
                            </PrimaryButton>
                        )}
                    </div>
                )}

                {/* Modals */}
                <RegistroProfesorModal
                    isOpen={isRegistroOpen}
                    onClose={() => setIsRegistroOpen(false)}
                    onRegistroExitoso={() => {
                        cargarProfesores();
                        setIsProfesor(true);
                    }}
                />

                <AgendarClaseModal
                    isOpen={isAgendarOpen}
                    onClose={() => setIsAgendarOpen(false)}
                    profesor={selectedProfesor}
                />

            </div>
        </div>
    );
};

// Icono auxiliar
const CheckCircle2 = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export default ClasesParticulares;
