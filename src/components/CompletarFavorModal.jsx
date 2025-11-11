import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, CheckCircle, Clock } from 'lucide-react';
import { confirmarFinalizacion, obtenerEstadoConfirmacion } from '../services/ratingService';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from './ui/PrimaryButton';
import GhostButton from './ui/GhostButton';

/**
 * Modal para confirmar la finalización de un favor
 * Ambas partes (solicitante y ayudante) deben confirmar
 */
const CompletarFavorModal = ({ isOpen, onClose, favor, onConfirmacionExitosa }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [estadoConfirmacion, setEstadoConfirmacion] = useState(null);
  const [loadingEstado, setLoadingEstado] = useState(true);

  useEffect(() => {
    if (isOpen && favor && currentUser) {
      cargarEstadoConfirmacion();
    }
  }, [isOpen, favor, currentUser]);

  const cargarEstadoConfirmacion = async () => {
    try {
      setLoadingEstado(true);
      const estado = await obtenerEstadoConfirmacion(favor.id, currentUser.uid);
      setEstadoConfirmacion(estado);
    } catch (error) {
      console.error('Error al cargar estado:', error);
    } finally {
      setLoadingEstado(false);
    }
  };

  const handleConfirmar = async () => {
    if (!currentUser || !estadoConfirmacion?.rolUsuario) {
      alert('No se pudo determinar tu rol en este favor');
      return;
    }

    try {
      setLoading(true);
      const resultado = await confirmarFinalizacion(
        favor.id,
        currentUser.uid,
        estadoConfirmacion.rolUsuario
      );

      if (resultado.ambosConfirmaron) {
        alert('¡Excelente! Ambas partes han confirmado. Ahora pueden calificarse mutuamente.');
      } else {
        alert('Has confirmado la finalización. Esperando confirmación de la otra parte.');
      }

      if (onConfirmacionExitosa) {
        onConfirmacionExitosa(resultado);
      }

      onClose();
    } catch (error) {
      console.error('Error al confirmar:', error);
      alert('Error al confirmar la finalización. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!favor) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <Dialog.Panel className="mx-auto max-w-[95vw] sm:max-w-md w-full rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xl dark:bg-card/95 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 gap-2">
            <div className="min-w-0">
              <Dialog.Title className="text-lg sm:text-xl font-bold text-text-primary">
                Confirmar Finalización
              </Dialog.Title>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5 sm:mt-1">
                Confirma que este favor se ha completado
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 sm:p-2 text-text-muted hover:bg-card/80 hover:text-text-primary transition-colors flex-shrink-0"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Información del favor */}
          <div className="mb-6 p-4 rounded-lg bg-brand/10 border border-brand/20">
            <h4 className="font-semibold text-text-primary mb-1">{favor.titulo}</h4>
            <p className="text-xs text-text-muted">
              {favor.categoria && `${favor.categoria} • `}
              {favor.fecha}
            </p>
          </div>

          {loadingEstado ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
              <p className="mt-4 text-sm text-text-muted">Cargando estado...</p>
            </div>
          ) : (
            <>
              {/* Estado de confirmación */}
              <div className="mb-6 space-y-3">
                {estadoConfirmacion?.yoConfirme ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      Ya confirmaste la finalización
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Clock className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                      Aún no has confirmado
                    </p>
                  </div>
                )}

                {estadoConfirmacion?.otraParteConfirmo ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      La otra parte ya confirmó
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                    <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Esperando confirmación de la otra parte
                    </p>
                  </div>
                )}
              </div>

              {/* Mensaje informativo */}
              <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {estadoConfirmacion?.ambosConfirmaron ? (
                    <>
                      ¡Ambas partes han confirmado! Ya pueden calificarse mutuamente.
                    </>
                  ) : estadoConfirmacion?.yoConfirme ? (
                    <>
                      Una vez que la otra parte confirme, podrán calificarse mutuamente.
                    </>
                  ) : (
                    <>
                      Al confirmar, indicas que el favor se completó satisfactoriamente.
                      Cuando ambas partes confirmen, podrán calificarse mutuamente.
                    </>
                  )}
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <GhostButton
                  onClick={onClose}
                  className="flex-1"
                >
                  {estadoConfirmacion?.yoConfirme ? 'Cerrar' : 'Cancelar'}
                </GhostButton>
                {!estadoConfirmacion?.yoConfirme && (
                  <PrimaryButton
                    onClick={handleConfirmar}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Confirmando...' : 'Confirmar finalización'}
                  </PrimaryButton>
                )}
              </div>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CompletarFavorModal;
