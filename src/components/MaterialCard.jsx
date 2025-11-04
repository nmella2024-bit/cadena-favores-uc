import React from 'react';
import { Calendar, User, Trash2, BookOpen, ExternalLink, Pin, PinOff } from 'lucide-react';
import { esMaterialNuevo } from '../services/materialService';

const MaterialCard = ({ material, esExclusivo, onEliminar, onFijar, currentUser }) => {
  const esNuevo = esMaterialNuevo(material.fechaSubida);

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-brand transition-all hover:shadow-lg group relative overflow-hidden flex flex-col h-full">
      {/* Badge de fijado */}
      {material.fijado && (
        <div className="absolute top-0 left-0">
          <div className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-br-lg flex items-center gap-1">
            <Pin className="h-3 w-3" />
            FIJADO
          </div>
        </div>
      )}

      {/* Badge de nuevo */}
      {esNuevo && !material.fijado && (
        <div className="absolute top-0 right-0">
          <div className="bg-brand text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
            NUEVO
          </div>
        </div>
      )}

      {esNuevo && material.fijado && (
        <div className="absolute top-0 right-0">
          <div className="bg-brand text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
            NUEVO
          </div>
        </div>
      )}

      <div className="space-y-3 flex flex-col flex-1">
        {/* Tipo de archivo badge */}
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-brand/10 text-brand">
            {material.tipo || 'PDF'}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-lg font-semibold text-text-primary group-hover:text-brand transition-colors line-clamp-2">
          {material.titulo}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-text-muted line-clamp-2">
          {material.descripcion}
        </p>

        {/* Información del ramo */}
        <div className="space-y-2 text-sm flex-1">
          <div className="flex items-center gap-2 text-text-muted">
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">{material.ramo}</span>
          </div>
          <div className="text-text-muted">
            <span className="font-medium">{material.carrera}</span> - Año {material.anio}
          </div>
        </div>

        {/* Footer con autor y fecha */}
        <div className="flex flex-col gap-2 pt-3 mt-auto border-t border-border">
          <div className="flex items-center justify-between text-xs text-text-muted">
            {material.autorNombre && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{material.autorNombre}</span>
              </div>
            )}
            {material.fechaSubida && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(material.fechaSubida).toLocaleDateString('es-CL')}</span>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-2">
            {/* Botón ver material - visible para todos */}
            <button
              onClick={() => window.open(material.archivoUrl, '_blank')}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand/20"
            >
              Ver material
              <ExternalLink className="h-4 w-4" />
            </button>

            {/* Botones exclusivos para usuarios con rol exclusivo */}
            {esExclusivo && (
              <>
                {/* Botón de fijar - solo para usuarios con rol exclusivo */}
                {onFijar && (
                  <button
                    onClick={() => onFijar(material.id, !material.fijado)}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      material.fijado
                        ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
                        : 'border-border bg-background text-text-muted hover:bg-border/50'
                    }`}
                    title={material.fijado ? 'Desfijar material' : 'Fijar material'}
                  >
                    {material.fijado ? (
                      <PinOff className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                  </button>
                )}
              </>
            )}

            {/* Botón de eliminar - solo para el autor del material */}
            {currentUser && currentUser.uid === material.autorId && onEliminar && (
              <button
                onClick={() => onEliminar(material.id)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
                title="Eliminar material"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
