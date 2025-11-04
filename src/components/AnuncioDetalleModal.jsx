import React from 'react';
import { X, Calendar, User, ExternalLink } from 'lucide-react';

const AnuncioDetalleModal = ({ isOpen, onClose, anuncio }) => {
  if (!isOpen || !anuncio) return null;

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Función para detectar y convertir URLs en links clicables
  const renderDescripcionConLinks = (texto) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const partes = texto.split(urlRegex);

    return partes.map((parte, index) => {
      if (parte.match(urlRegex)) {
        return (
          <a
            key={index}
            href={parte}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:text-brand/80 underline inline-flex items-center gap-1 break-all"
          >
            {parte}
            <ExternalLink className="h-3 w-3 inline shrink-0" />
          </a>
        );
      }
      return <span key={index}>{parte}</span>;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <h2 className="text-2xl font-bold text-text-primary">
            Detalles del anuncio
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-background hover:text-text-primary"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Título */}
          <div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              {anuncio.titulo}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{anuncio.autorNombre}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatFecha(anuncio.fecha)}</span>
              </div>
            </div>
          </div>

          {/* Imagen si existe */}
          {anuncio.imagenURL && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={anuncio.imagenURL}
                alt={anuncio.titulo}
                className="w-full object-contain max-h-96"
              />
            </div>
          )}

          {/* Descripción */}
          <div className="prose prose-sm max-w-none">
            <div className="text-base text-text-primary whitespace-pre-wrap break-words leading-relaxed">
              {renderDescripcionConLinks(anuncio.descripcion)}
            </div>
          </div>

          {/* Información adicional si existe */}
          {(anuncio.carrera || anuncio.anio) && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
              {anuncio.carrera && (
                <span className="px-3 py-1.5 bg-brand/10 text-brand rounded-lg text-sm font-medium">
                  {anuncio.carrera}
                </span>
              )}
              {anuncio.anio && (
                <span className="px-3 py-1.5 bg-brand/10 text-brand rounded-lg text-sm font-medium">
                  {anuncio.anio}º año
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-border bg-card px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition-colors hover:bg-brand/90"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnuncioDetalleModal;
