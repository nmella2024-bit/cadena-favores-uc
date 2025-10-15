import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Modal para mostrar imágenes en tamaño completo
 * Soporta navegación entre múltiples imágenes
 */
const ImageModal = ({ isOpen, onClose, imagenes, imagenActual, onSiguiente, onAnterior }) => {
  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Navegación con flechas del teclado
  useEffect(() => {
    const handleArrows = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowLeft' && onAnterior) {
        onAnterior();
      } else if (e.key === 'ArrowRight' && onSiguiente) {
        onSiguiente();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleArrows);
    }

    return () => {
      document.removeEventListener('keydown', handleArrows);
    };
  }, [isOpen, onSiguiente, onAnterior]);

  if (!isOpen) return null;

  const esMultiple = imagenes && imagenes.length > 1;
  const imagenUrl = Array.isArray(imagenes) ? imagenes[imagenActual] : imagenes;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Botón de cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="Cerrar"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navegación izquierda */}
      {esMultiple && onAnterior && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAnterior();
          }}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          aria-label="Imagen anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Imagen */}
      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imagenUrl}
          alt="Vista completa"
          className="h-auto w-auto max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
        />

        {/* Contador de imágenes */}
        {esMultiple && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white">
            {imagenActual + 1} / {imagenes.length}
          </div>
        )}
      </div>

      {/* Navegación derecha */}
      {esMultiple && onSiguiente && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSiguiente();
          }}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          aria-label="Siguiente imagen"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default ImageModal;
