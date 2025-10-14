import React from 'react';
import { Calendar, User, Trash2 } from 'lucide-react';
import { esAnuncioNuevo } from '../services/anuncioService';

const AnuncioCard = ({ anuncio, esExclusivo, onEliminar }) => {
  const esNuevo = esAnuncioNuevo(anuncio.fecha);

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-card/80 relative overflow-hidden">
      {esNuevo && (
        <div className="absolute top-0 right-0">
          <div className="bg-brand text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
            NUEVO
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            {anuncio.titulo}
          </h3>
          <p className="text-text-muted whitespace-pre-wrap">
            {anuncio.descripcion}
          </p>
        </div>

        {anuncio.imagenURL && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={anuncio.imagenURL}
              alt={anuncio.titulo}
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{anuncio.autorNombre}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatFecha(anuncio.fecha)}</span>
            </div>
          </div>

          {esExclusivo && onEliminar && (
            <button
              onClick={() => onEliminar(anuncio.id)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnuncioCard;
