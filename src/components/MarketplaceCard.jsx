import React, { useState, useEffect } from 'react';
import { Calendar, User, Trash2, Mail, ChevronLeft, ChevronRight, MessageCircle, Maximize2 } from 'lucide-react';
import { esProductoNuevo, formatearPrecio } from '../services/marketplaceService';
import { getUserData } from '../services/userService';
import ImageModal from './ImageModal';

const MarketplaceCard = ({ producto, esAutor, onEliminar, currentUserId }) => {
  const esNuevo = esProductoNuevo(producto.fecha);
  const [imagenActual, setImagenActual] = useState(0);
  const [autorTelefono, setAutorTelefono] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    // Obtener teléfono del autor del producto
    const obtenerTelefonoAutor = async () => {
      if (producto.autor && !esAutor) {
        try {
          const datosAutor = await getUserData(producto.autor);
          if (datosAutor?.telefono) {
            setAutorTelefono(datosAutor.telefono);
          }
        } catch (error) {
          console.error('Error al obtener teléfono del autor:', error);
        }
      }
    };

    obtenerTelefonoAutor();
  }, [producto.autor, esAutor]);

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
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-card/80 relative overflow-hidden flex flex-col h-full">
      {esNuevo && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-brand text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-bl-lg">
            NUEVO
          </div>
        </div>
      )}

      <div className="space-y-2 sm:space-y-3 flex flex-col flex-1">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary line-clamp-2">
              {producto.titulo}
            </h3>
            <div className="text-base sm:text-lg font-bold text-brand whitespace-nowrap flex-shrink-0">
              {formatearPrecio(producto.precio)}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-text-muted line-clamp-3">
            {producto.descripcion}
          </p>
        </div>

        {producto.imagenesURL && producto.imagenesURL.length > 0 && (
          <div className="rounded-lg overflow-hidden relative group cursor-pointer">
            {/* Thumbnail con altura limitada */}
            <div className="relative">
              <img
                src={producto.imagenesURL[imagenActual]}
                alt={`${producto.titulo} - imagen ${imagenActual + 1}`}
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

              {/* Navegación entre imágenes */}
              {producto.imagenesURL.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      imagenAnterior();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      siguienteImagen();
                    }}
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
          </div>
        )}

        <div className="flex flex-col gap-2 pt-3 mt-auto border-t border-border">
          <div className="flex flex-col gap-1 text-xs text-text-muted">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate">{producto.autorNombre}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatFecha(producto.fecha)}</span>
            </div>
          </div>

          {producto.autor !== currentUserId && (
            <div className="flex flex-wrap items-center gap-2">
              {producto.autorEmail && (
                <a
                  href={`mailto:${producto.autorEmail}`}
                  className="flex items-center gap-1 text-xs text-brand hover:underline"
                >
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </a>
              )}
              {autorTelefono && (
                <a
                  href={`https://wa.me/${autorTelefono.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 transition-colors dark:text-emerald-400"
                >
                  <MessageCircle className="h-3 w-3" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          )}

          {esAutor && onEliminar && (
            <button
              onClick={() => onEliminar(producto.id)}
              className="inline-flex items-center gap-1 justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="h-3 w-3" />
              <span>Eliminar</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal para ver imagen completa */}
      <ImageModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        imagenes={producto.imagenesURL}
        imagenActual={imagenActual}
        onSiguiente={siguienteImagen}
        onAnterior={imagenAnterior}
      />
    </div>
  );
};

export default MarketplaceCard;
