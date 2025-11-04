import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Star, AlertCircle } from 'lucide-react';
import { calificarUsuario, verificarPuedeCalificar, verificarPuedeCalificarFinalizado } from '../services/ratingService';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import PrimaryButton from './ui/PrimaryButton';
import GhostButton from './ui/GhostButton';

/**
 * Modal para calificar a un usuario después de completar un favor
 */
const CalificarUsuarioModal = ({ isOpen, onClose, favor, onCalificacionExitosa }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [infoCalificacion, setInfoCalificacion] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && favor && currentUser) {
      verificarSiPuedeCalificar();
    }
  }, [isOpen, favor, currentUser]);

  const verificarSiPuedeCalificar = async () => {
    try {
      setLoadingInfo(true);
      setError(null);

      console.log('🔍 [CalificarUsuarioModal] Verificando permisos:', {
        favorId: favor?.id,
        favorEstado: favor?.estado,
        userId: currentUser?.uid,
        favor: favor
      });

      // Validar que tenemos los datos necesarios
      if (!favor?.id) {
        console.error('❌ [CalificarUsuarioModal] No hay ID del favor');
        setError('No se pudo obtener la información del favor');
        setLoadingInfo(false);
        return;
      }

      if (!currentUser?.uid) {
        console.error('❌ [CalificarUsuarioModal] No hay UID del usuario');
        setError('No se pudo obtener la información del usuario');
        setLoadingInfo(false);
        return;
      }

      // Usar la función simplificada para favores finalizados
      const info = favor.estado === 'finalizado'
        ? await verificarPuedeCalificarFinalizado(favor.id, currentUser.uid)
        : await verificarPuedeCalificar(favor.id, currentUser.uid);

      console.log('✅ [CalificarUsuarioModal] Resultado de verificación:', info);

      if (!info.puedeCalificar) {
        setError(info.razon);
      } else {
        setInfoCalificacion(info);
      }
    } catch (error) {
      console.error('Error al verificar:', error);
      setError(error.message || 'Error al verificar si puedes calificar');
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (estrellas === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    if (!infoCalificacion) {
      alert('No se pudo obtener la información necesaria');
      return;
    }

    console.log('📝 [CalificarUsuarioModal] Preparando datos para calificar:', {
      favorId: favor.id,
      calificadorId: currentUser.uid,
      calificadorNombre: currentUser.nombre,
      calificadoId: infoCalificacion.usuarioACalificarId,
      calificadoNombre: infoCalificacion.usuarioACalificarNombre,
      estrellas,
      rolCalificador: infoCalificacion.rolUsuario,
      infoCalificacion: infoCalificacion
    });

    // Validar que tenemos todos los datos necesarios
    if (!favor?.id) {
      alert('Error: No se encontró el ID del favor');
      return;
    }

    if (!currentUser?.uid) {
      alert('Error: No se encontró tu información de usuario');
      return;
    }

    if (!infoCalificacion.usuarioACalificarId) {
      alert('Error: No se pudo obtener el ID del usuario a calificar');
      return;
    }

    if (!infoCalificacion.usuarioACalificarNombre) {
      alert('Error: No se pudo obtener el nombre del usuario a calificar');
      return;
    }

    try {
      setLoading(true);

      await calificarUsuario({
        favorId: favor.id,
        calificadorId: currentUser.uid,
        calificadorNombre: currentUser.nombre || 'Usuario',
        calificadoId: infoCalificacion.usuarioACalificarId,
        calificadoNombre: infoCalificacion.usuarioACalificarNombre,
        estrellas,
        comentario: comentario.trim(),
        rolCalificador: infoCalificacion.rolUsuario,
      });

      console.log('✅ [CalificarUsuarioModal] Calificación enviada exitosamente');

      alert('¡Calificación enviada exitosamente!');

      if (onCalificacionExitosa) {
        onCalificacionExitosa();
      }

      // Resetear formulario
      setEstrellas(0);
      setComentario('');
      onClose();
    } catch (error) {
      console.error('Error al calificar:', error);
      alert(error.message || 'Error al enviar la calificación. Intenta nuevamente.');
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
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-2xl border border-border bg-card p-6 shadow-2xl dark:bg-card/95">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="text-xl font-bold text-text-primary">
                Calificar Usuario
              </Dialog.Title>
              <p className="text-sm text-text-muted mt-1">
                Comparte tu experiencia con este favor
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-text-muted hover:bg-card/80 hover:text-text-primary transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {loadingInfo ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
              <p className="mt-4 text-sm text-text-muted">Verificando...</p>
            </div>
          ) : error ? (
            <div className="py-8">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                    No puedes calificar en este momento
                  </p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80">
                    {error}
                  </p>
                </div>
              </div>
              <GhostButton onClick={onClose} className="w-full">
                Cerrar
              </GhostButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Información del favor */}
              <div className="mb-6 p-4 rounded-lg bg-brand/10 border border-brand/20">
                <h4 className="font-semibold text-text-primary mb-1">{favor.titulo}</h4>
                <p className="text-xs text-text-muted">
                  {favor.categoria && `${favor.categoria} • `}
                  {favor.fecha}
                </p>
              </div>

              {/* Usuario a calificar */}
              {infoCalificacion && (
                <div className="mb-6">
                  <p className="text-sm text-text-muted mb-2">Calificando a:</p>
                  <div className="p-3 rounded-lg bg-card/70 dark:bg-card/50 border border-border">
                    <p className="font-medium text-text-primary">
                      {infoCalificacion.usuarioACalificarNombre}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Ayudante del favor
                    </p>
                  </div>
                </div>
              )}

              {/* Calificación con estrellas */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Calificación <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-center p-4 rounded-lg bg-canvas border border-border">
                  <StarRating
                    rating={estrellas}
                    onRatingChange={setEstrellas}
                    interactive={true}
                    size="lg"
                  />
                </div>
                {estrellas > 0 && (
                  <p className="text-center text-sm text-text-muted mt-2">
                    {estrellas === 1 && 'Muy mala experiencia'}
                    {estrellas === 2 && 'Mala experiencia'}
                    {estrellas === 3 && 'Experiencia regular'}
                    {estrellas === 4 && 'Buena experiencia'}
                    {estrellas === 5 && 'Excelente experiencia'}
                  </p>
                )}
              </div>

              {/* Comentario opcional */}
              <div className="mb-6">
                <label htmlFor="comentario" className="block text-sm font-medium text-text-primary mb-2">
                  Comentario <span className="text-text-muted text-xs">(opcional)</span>
                </label>
                <textarea
                  id="comentario"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Comparte tu experiencia con este favor..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-canvas text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                />
                <p className="text-xs text-text-muted mt-1 text-right">
                  {comentario.length}/500 caracteres
                </p>
              </div>

              {/* Info */}
              <div className="mb-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Como solicitante del favor, puedes calificar a quien te ayudó.
                  Tu calificación será visible públicamente y ayudará a construir confianza en la comunidad.
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <GhostButton
                  type="button"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </GhostButton>
                <PrimaryButton
                  type="submit"
                  disabled={loading || estrellas === 0}
                  className="flex-1"
                >
                  {loading ? 'Enviando...' : 'Enviar calificación'}
                </PrimaryButton>
              </div>
            </form>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CalificarUsuarioModal;
