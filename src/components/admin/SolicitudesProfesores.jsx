import React, { useState, useEffect } from 'react';
import { obtenerSolicitudesProfesores, aprobarProfesor, rechazarProfesor } from '../../services/profesorService';
import { Check, X, Loader2, GraduationCap, BookOpen, Clock } from 'lucide-react';

const SolicitudesProfesores = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const cargarSolicitudes = async () => {
        try {
            setLoading(true);
            const data = await obtenerSolicitudesProfesores();
            setSolicitudes(data);
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarSolicitudes();
    }, []);

    const handleAprobar = async (id) => {
        try {
            setProcessingId(id);
            await aprobarProfesor(id);
            setSolicitudes(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error al aprobar:', error);
            alert('Error al aprobar la solicitud');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRechazar = async (id) => {
        if (!window.confirm('¿Estás seguro de rechazar esta solicitud?')) return;

        try {
            setProcessingId(id);
            await rechazarProfesor(id);
            setSolicitudes(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error al rechazar:', error);
            alert('Error al rechazar la solicitud');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    if (solicitudes.length === 0) {
        return null; // No mostrar nada si no hay solicitudes
    }

    return (
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Solicitudes de Profesores Pendientes
            </h2>

            <div className="space-y-4">
                {solicitudes.map((solicitud) => (
                    <div key={solicitud.id} className="p-4 rounded-lg border border-border bg-background">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-medium text-text-primary">{solicitud.nombre}</h3>
                                    <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-xs">
                                        {solicitud.carrera}
                                    </span>
                                </div>

                                <div className="flex items-start gap-2 text-sm text-text-muted mb-2">
                                    <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p>{solicitud.ramos.join(', ')}</p>
                                </div>

                                <p className="text-sm text-text-muted italic">"{solicitud.descripcion}"</p>

                                <div className="mt-2 text-xs text-text-muted">
                                    Precio: ${solicitud.precio}/hora • {solicitud.modalidad.join(', ')}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center">
                                <button
                                    onClick={() => handleAprobar(solicitud.id)}
                                    disabled={processingId === solicitud.id}
                                    className="p-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                                    title="Aprobar"
                                >
                                    {processingId === solicitud.id ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Check className="h-5 w-5" />
                                    )}
                                </button>
                                <button
                                    onClick={() => handleRechazar(solicitud.id)}
                                    disabled={processingId === solicitud.id}
                                    className="p-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                    title="Rechazar"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SolicitudesProfesores;
