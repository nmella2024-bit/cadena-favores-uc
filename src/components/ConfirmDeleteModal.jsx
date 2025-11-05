import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import PrimaryButton from './ui/PrimaryButton';
import GhostButton from './ui/GhostButton';

/**
 * Modal de confirmación para eliminar contenido
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado de apertura del modal
 * @param {function} props.onClose - Función para cerrar el modal
 * @param {function} props.onConfirm - Función a ejecutar al confirmar
 * @param {string} props.title - Título del modal
 * @param {string} props.message - Mensaje de confirmación
 * @param {string} props.itemName - Nombre del item a eliminar (opcional)
 * @param {boolean} props.isDeleting - Estado de carga durante la eliminación
 */
const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Eliminar contenido?',
  message = 'Esta acción no se puede deshacer. El contenido será eliminado permanentemente.',
  itemName = '',
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // El error ya se maneja en el componente padre
      console.error('Error en confirmación:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icono de advertencia */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Mensaje */}
        <p className="text-gray-600 mb-4">
          {message}
        </p>

        {/* Nombre del item (si existe) */}
        {itemName && (
          <div className="bg-gray-50 rounded-md p-3 mb-4 border border-gray-200">
            <p className="text-sm text-gray-700 font-medium break-words">
              {itemName}
            </p>
          </div>
        )}

        {/* Advertencia adicional */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Advertencia:</strong> Esta acción eliminará el contenido permanentemente de la base de datos y del almacenamiento.
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <GhostButton
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancelar
          </GhostButton>
          <PrimaryButton
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isDeleting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Eliminando...
              </span>
            ) : (
              'Eliminar'
            )}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
