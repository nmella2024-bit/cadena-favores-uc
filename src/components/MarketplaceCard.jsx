import React, { useState } from 'react';
import { Calendar, User, Trash2, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { esProductoNuevo, formatearPrecio } from '../services/marketplaceService';

const MarketplaceCard = ({ producto, esAutor, onEliminar, currentUserId }) => {
  const esNuevo = esProductoNuevo(producto.fecha);
  const [imagenActual, setImagenActual] = useState(0);

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const siguienteImagen = () => {
    if (producto.imagenesURL && producto.imagenesURL.length > 0) {
      setImagenActual((prev) => (prev + 1) % producto.imagenesURL.length);
    }
  };

  const imagenAnterior = () => {
    if (producto.imagenesURL && producto.imagenesURL.length > 0) {
      setImagenActual((prev) => (prev - 1 + producto.imagenesURL.length) % producto.imagenesURL.length);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-card/80 relative overflow-hidden">
      {esNuevo && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-brand text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
            NUEVO
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-xl font-semibold text-text-primary">
              {producto.titulo}
            </h3>
            <div className="text-xl font-bold text-brand whitespace-nowrap">
              {formatearPrecio(producto.precio)}
            </div>
          </div>
          <p className="text-text-muted whitespace-pre-wrap">
            {producto.descripcion}
          </p>
        </div>

        {producto.imagenesURL && producto.imagenesURL.length > 0 && (
          <div className="rounded-lg overflow-hidden relative group">
            <img
              src={producto.imagenesURL[imagenActual]}
              alt={`${producto.titulo} - imagen ${imagenActual + 1}`}
              className="w-full max-h-96 object-cover"
            />

            {producto.imagenesURL.length > 1 && (
              <>
                <button
                  onClick={imagenAnterior}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={siguienteImagen}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {imagenActual + 1} / {producto.imagenesURL.length}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex flex-col gap-2 text-sm text-text-muted">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{producto.autorNombre}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatFecha(producto.fecha)}</span>
            </div>
            {producto.autorEmail && producto.autor !== currentUserId && (
              <a
                href={`mailto:${producto.autorEmail}`}
                className="flex items-center gap-1 text-brand hover:underline"
              >
                <Mail className="h-4 w-4" />
                <span>Contactar</span>
              </a>
            )}
          </div>

          {esAutor && onEliminar && (
            <button
              onClick={() => onEliminar(producto.id)}
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

export default MarketplaceCard;
