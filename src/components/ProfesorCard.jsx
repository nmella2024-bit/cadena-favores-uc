import React from 'react';
import { User, GraduationCap, BookOpen, DollarSign, Clock } from 'lucide-react';
import PrimaryButton from './ui/PrimaryButton';

const ProfesorCard = ({ profesor, onAgendar }) => {
    return (
        <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md dark:bg-card/80">
            {/* Header con foto y nombre */}
            <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-border bg-brand/5">
                    {profesor.fotoPerfil ? (
                        <img
                            src={profesor.fotoPerfil}
                            alt={profesor.nombre}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-brand">
                            <User className="h-8 w-8" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-text-primary truncate">
                        {profesor.nombre}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
                        <GraduationCap className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{profesor.carrera} • {profesor.anio}º Año</span>
                    </div>
                </div>
            </div>

            {/* Ramos */}
            <div className="mt-4">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                    <BookOpen className="h-3.5 w-3.5" />
                    Enseña
                </div>
                <div className="flex flex-wrap gap-2">
                    {profesor.ramos.slice(0, 3).map((ramo, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center rounded-md bg-brand/10 px-2 py-1 text-xs font-medium text-brand ring-1 ring-inset ring-brand/20"
                        >
                            {ramo}
                        </span>
                    ))}
                    {profesor.ramos.length > 3 && (
                        <span className="inline-flex items-center rounded-md bg-card px-2 py-1 text-xs font-medium text-text-muted ring-1 ring-inset ring-border">
                            +{profesor.ramos.length - 3} más
                        </span>
                    )}
                </div>
            </div>

            {/* Descripción */}
            <p className="mt-4 text-sm text-text-muted line-clamp-3 flex-grow">
                {profesor.descripcion}
            </p>

            {/* Footer con precio y botón */}
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
                <div className="flex flex-col">
                    <span className="text-xs text-text-muted">Precio por hora</span>
                    <div className="flex items-center gap-1 text-lg font-bold text-text-primary">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        {parseInt(profesor.precio).toLocaleString('es-CL')}
                    </div>
                </div>

                <PrimaryButton onClick={() => onAgendar(profesor)} className="px-4 py-2 text-sm">
                    Agendar clase
                </PrimaryButton>
            </div>

            {/* Modalidad badge */}
            <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                <Clock className="h-3.5 w-3.5" />
                <span className="capitalize">{profesor.modalidad.join(' / ')}</span>
            </div>
        </div>
    );
};

export default ProfesorCard;
