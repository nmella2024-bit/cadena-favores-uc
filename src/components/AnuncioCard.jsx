import React, { useState } from 'react';
import { Calendar, User, Trash2, Maximize2 } from 'lucide-react';
import { esAnuncioNuevo } from '../services/anuncioService';
import ImageModal from './ImageModal';

const AnuncioCard = ({ anuncio, esExclusivo, onEliminar }) => {
  const esNuevo = esAnuncioNuevo(anuncio.fecha);
  const [modalAbierto, setModalAbierto] = useState(false);

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-card/80 relative overflow-hidden flex flex-col h-full">
      {esNuevo && (
        <div className="absolute top-0 right-0">
          <div className="bg-brand text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
            NUEVO
          </div>
        </div>
      )}

      <div className="space-y-3 flex flex-col flex-1">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2">
            {anuncio.titulo}
          </h3>
          <p className="text-sm text-text-muted line-clamp-3">
            {anuncio.descripcion}
          </p>
        </div>

        {anuncio.imagenURL && (
          <div className="rounded-lg overflow-hidden relative group cursor-pointer">
            {/* Thumbnail con altura limitada */}
            <img
              src={anuncio.imagenURL}
              alt={anuncio.titulo}
              className="w-full h-48 object-cover"
              onClick={() => setModalAbierto(true)}
            />

            {/* Botón para ampliar */}
            <button
              onClick={() => setModalAbierto(true)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Ver imagen completa"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 mt-auto border-t border-border">
          <div className="flex flex-col gap-1 text-xs text-text-muted">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{anuncio.autorNombre}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
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

      {/* Modal para ver imagen completa */}
      <ImageModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        imagenes={anuncio.imagenURL}
        imagenActual={0}
      />
    </div>
  );
};

export default AnuncioCard;
