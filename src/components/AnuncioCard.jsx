import React, { useState } from 'react';
import { Calendar, User, Trash2, Maximize2, Eye, Pin, PinOff } from 'lucide-react';
import { esAnuncioNuevo } from '../services/anuncioService';
import ImageModal from './ImageModal';
import AnuncioDetalleModal from './AnuncioDetalleModal';

const AnuncioCard = ({ anuncio, esExclusivo, onEliminar, onFijar }) => {
  const esNuevo = esAnuncioNuevo(anuncio.fecha);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleModalAbierto, setDetalleModalAbierto] = useState(false);

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-card/80 relative overflow-hidden flex flex-col h-full">
      {/* Badge de fijado */}
      {anuncio.fijado && (
        <div className="absolute top-0 left-0">
          <div className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-br-lg flex items-center gap-1">
            <Pin className="h-3 w-3" />
            FIJADO
          </div>
        </div>
      )}

      {/* Badge de nuevo */}
      {esNuevo && !anuncio.fijado && (
        <div className="absolute top-0 right-0">
          <div className="bg-brand text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
            NUEVO
          </div>
        </div>
      )}

      {esNuevo && anuncio.fijado && (
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

        <div className="flex flex-col gap-3 pt-3 mt-auto border-t border-border">
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

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-2">
            {/* Botón ver detalles - visible para todos */}
            <button
              onClick={() => setDetalleModalAbierto(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand/20"
            >
              <Eye className="h-4 w-4" />
              Ver detalles
            </button>

            {/* Botones exclusivos para usuarios con rol exclusivo */}
            {esExclusivo && (
              <>
                {onFijar && (
                  <button
                    onClick={() => onFijar(anuncio.id, !anuncio.fijado)}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      anuncio.fijado
                        ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
                        : 'border-border bg-background text-text-muted hover:bg-border/50'
                    }`}
                    title={anuncio.fijado ? 'Desfijar' : 'Fijar'}
                  >
                    {anuncio.fijado ? (
                      <PinOff className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                  </button>
                )}

                {onEliminar && (
                  <button
                    onClick={() => onEliminar(anuncio.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal para ver imagen completa */}
      <ImageModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        imagenes={anuncio.imagenURL}
        imagenActual={0}
      />

      {/* Modal para ver detalles completos */}
      <AnuncioDetalleModal
        isOpen={detalleModalAbierto}
        onClose={() => setDetalleModalAbierto(false)}
        anuncio={anuncio}
      />
    </div>
  );
};

export default AnuncioCard;
