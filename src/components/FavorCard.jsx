import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Link2, Tag, UserRound, MessageCircle, X, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/mockData';
import { eliminarFavor, asociarAyudante, finalizarFavor } from '../services/favorService';
import { getUserData } from '../services/userService';
import { obtenerEstadoConfirmacion } from '../services/ratingService';
import PrimaryButton from './ui/PrimaryButton';
import GhostButton from './ui/GhostButton';
import CompletarFavorModal from './CompletarFavorModal';
import CalificarUsuarioModal from './CalificarUsuarioModal';
import StarRating from './StarRating';
import { cn } from '../utils/cn';

const FavorCard = ({ favor, className }) => {
  const { currentUser, firebaseUser } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [showCompletarModal, setShowCompletarModal] = useState(false);
  const [showCalificarModal, setShowCalificarModal] = useState(false);
  const [estadoConfirmacion, setEstadoConfirmacion] = useState(null);
  const [solicitanteData, setSolicitanteData] = useState(null);

  const category = categories.find((c) => c.id === favor.categoria);
  const isOwnFavor = currentUser && favor.usuarioId === currentUser.uid;
  const canRespond = currentUser && !isOwnFavor && favor.estado === 'activo';
  const isCompleted = favor.estado === 'completado';
  const isConfirmado = favor.estado === 'confirmado';
  const isFinalizado = favor.estado === 'finalizado';

  // Verificar si el usuario es parte del favor (solicitante o ayudante)
  const esParteDelFavor = currentUser && (
    favor.usuarioId === currentUser.uid ||
    favor.ayudanteId === currentUser.uid
  );

  // Cargar estado de confirmación si es parte del favor
  useEffect(() => {
    if (esParteDelFavor && currentUser) {
      cargarEstadoConfirmacion();
    }
  }, [favor.id, currentUser, esParteDelFavor]);

  // Cargar datos del solicitante para mostrar calificación
  useEffect(() => {
    const cargarSolicitante = async () => {
      if (favor.usuarioId) {
        const datos = await getUserData(favor.usuarioId);
        setSolicitanteData(datos);
      }
    };
    cargarSolicitante();
  }, [favor.usuarioId]);

  const cargarEstadoConfirmacion = async () => {
    try {
      const estado = await obtenerEstadoConfirmacion(favor.id, currentUser.uid);
      setEstadoConfirmacion(estado);
    } catch (error) {
      console.error('Error al cargar estado de confirmación:', error);
    }
  };

  const handleRespond = async () => {
    if (!firebaseUser) {
      alert('Debes iniciar sesión para responder a este favor');
      return;
    }

    // Verificar que el usuario actual tenga teléfono
    if (!currentUser.telefono) {
      alert('Debes agregar un número de WhatsApp a tu perfil para poder contactar al solicitante. Ve a "Mi Perfil" para agregarlo.');
      return;
    }

    if (window.confirm('¿Deseas ofrecer ayuda con este favor? Se mostrará la información de contacto del solicitante.')) {
      try {
        setLoadingContact(true);
        // Obtener información del solicitante
        const solicitanteData = await getUserData(favor.usuarioId);

        if (!solicitanteData) {
          alert('No se pudo obtener la información del solicitante.');
          return;
        }

        if (!solicitanteData.telefono) {
          alert('El solicitante aún no ha agregado un número de WhatsApp. No se puede establecer contacto en este momento.');
          return;
        }

        // Intentar asociar al ayudante con el favor (no crítico si falla)
        try {
          // Solo asociar si aún no hay ayudante
          if (!favor.ayudanteId) {
            await asociarAyudante(favor.id, currentUser.uid, currentUser.nombre || currentUser.displayName);
          }
        } catch (asociarError) {
          console.error('Error al asociar ayudante (no crítico):', asociarError);
          // Continuar aunque falle la asociación
        }

        // Mostrar modal con la información de contacto
        setContactInfo(solicitanteData);
        setShowContactModal(true);
      } catch (error) {
        console.error('Error al obtener contacto:', error);
        alert('Error al obtener la información de contacto. Intenta nuevamente.');
      } finally {
        setLoadingContact(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!firebaseUser) {
      alert('Debes iniciar sesión para eliminar este favor');
      return;
    }

    if (window.confirm('¿Estás seguro de eliminar este favor?')) {
      try {
        await eliminarFavor(favor.id);
        alert('Favor eliminado exitosamente');
        // Recargar la página para ver los cambios
        window.location.reload();
      } catch (error) {
        console.error('Error al eliminar favor:', error);
        alert('Error al eliminar el favor. Intenta nuevamente.');
      }
    }
  };

  const handleFinalizar = async () => {
    if (!firebaseUser) {
      alert('Debes iniciar sesión para finalizar este favor');
      return;
    }

    if (!favor.ayudanteId) {
      alert('No puedes finalizar un favor que nadie ha aceptado ayudar aún.');
      return;
    }

    if (window.confirm('¿Confirmas que este favor se ha completado? Podrás calificar al usuario que te ayudó.')) {
      try {
        await finalizarFavor(favor.id, currentUser.uid);
        alert('✅ Favor marcado como finalizado. Ahora puedes calificar al usuario.');
        // Recargar para ver los cambios
        window.location.reload();
      } catch (error) {
        console.error('Error al finalizar favor:', error);
        alert('Error al finalizar el favor. ' + (error.message || 'Intenta nuevamente.'));
      }
    }
  };

  return (
    <article
      className={cn(
        'rounded-xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md dark:bg-card/80',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-xl font-semibold tracking-tight" data-testid="favor-title">
          {favor.titulo}
        </h3>
        {isFinalizado && (
          <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-500">
            Finalizado
          </span>
        )}
        {isCompleted && !isFinalizado && (
          <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-500">
            Completado
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        {category && (
          <span
            data-testid="favor-category"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted dark:bg-card/50"
          >
            <Tag className="h-4 w-4" aria-hidden="true" />
            {category.name}
          </span>
        )}
        <span className="inline-flex items-center gap-2">
          <UserRound className="h-4 w-4" aria-hidden="true" />
          <span>{favor.solicitante || favor.nombreUsuario}</span>
        </span>
        {solicitanteData && solicitanteData.reputacion && (
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <span className="font-medium">{solicitanteData.reputacion.toFixed(1)}</span>
            {solicitanteData.totalCalificaciones > 0 && (
              <span className="text-xs">({solicitanteData.totalCalificaciones})</span>
            )}
          </span>
        )}
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          <time dateTime={favor.fecha}>{favor.fecha}</time>
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-text-muted">{favor.descripcion}</p>

      {favor.disponibilidad && (
        <p className="mt-3 text-sm text-text-muted">
          <span className="font-medium text-text-primary">Disponibilidad:</span> {favor.disponibilidad}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-text-muted">
          <span className="font-medium text-text-primary">Estado:</span>{' '}
          {isFinalizado ? 'Finalizado' : isConfirmado ? 'Confirmado' : isCompleted ? 'Completado' : 'Disponible'}
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Botón ofrecer ayuda - solo si no es propio y está activo */}
          {canRespond && (
            <PrimaryButton
              data-testid="cta-offer"
              type="button"
              onClick={handleRespond}
              className="px-4 py-2 text-sm"
            >
              Ofrecer ayuda
            </PrimaryButton>
          )}

          {/* Botón MARCAR COMO FINALIZADO - solo creador, solo si hay ayudante y está activo */}
          {isOwnFavor && favor.estado === 'activo' && favor.ayudanteId && (
            <PrimaryButton
              type="button"
              onClick={handleFinalizar}
              className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="h-4 w-4 mr-1 inline" />
              Marcar como finalizado
            </PrimaryButton>
          )}

          {/* Botón CALIFICAR USUARIO - solo creador, solo si está finalizado y no ha calificado */}
          {isOwnFavor && isFinalizado && favor.ayudanteId && (
            <PrimaryButton
              type="button"
              onClick={() => setShowCalificarModal(true)}
              className="px-4 py-2 text-sm bg-yellow-600 hover:bg-yellow-700"
            >
              <Star className="h-4 w-4 mr-1 inline" />
              Calificar usuario
            </PrimaryButton>
          )}

          {/* Botón eliminar - solo si es propio y está activo */}
          {isOwnFavor && favor.estado === 'activo' && (
            <GhostButton
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-400 focus-visible:ring-red-500/40"
            >
              Eliminar
            </GhostButton>
          )}

          {/* Botón ver detalles - siempre visible */}
          <GhostButton as={Link} to={`/favores?id=${favor.id}`} className="px-4 py-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <Link2 className="h-4 w-4" aria-hidden="true" />
              Detalles
            </span>
          </GhostButton>
        </div>
      </div>

      {/* Modal de información de contacto */}
      {showContactModal && contactInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-card rounded-2xl border border-border shadow-2xl dark:bg-card/95 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-text-primary">
                  Información de Contacto
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  Contacta al solicitante por WhatsApp
                </p>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="rounded-lg p-2 text-text-muted hover:bg-card/80 hover:text-text-primary transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Información del favor */}
            <div className="mb-6 p-4 rounded-lg bg-brand/10 border border-brand/20">
              <h4 className="font-semibold text-text-primary mb-1">{favor.titulo}</h4>
              <p className="text-xs text-text-muted">Favor publicado</p>
            </div>

            {/* Información de contacto */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase mb-1">Nombre</p>
                <p className="text-base font-medium text-text-primary">{contactInfo.nombre}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase mb-1">Email</p>
                <p className="text-sm text-text-primary">{contactInfo.email}</p>
              </div>
              {contactInfo.carrera && (
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase mb-1">Carrera</p>
                  <p className="text-sm text-text-primary">{contactInfo.carrera}</p>
                </div>
              )}
            </div>

            {/* Botón de WhatsApp */}
            <a
              href={`https://wa.me/${contactInfo.telefono.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-500 px-4 py-3 text-base font-semibold text-white hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <MessageCircle className="h-5 w-5" />
              Contactar por WhatsApp
            </a>

            <p className="text-xs text-text-muted text-center mt-4">
              Se abrirá WhatsApp para que puedas coordinar directamente
            </p>
          </div>
        </div>
      )}

      {/* Modal para confirmar finalización */}
      <CompletarFavorModal
        isOpen={showCompletarModal}
        onClose={() => setShowCompletarModal(false)}
        favor={favor}
        onConfirmacionExitosa={() => {
          cargarEstadoConfirmacion();
          window.location.reload(); // Recargar para actualizar el estado
        }}
      />

      {/* Modal para calificar usuario */}
      <CalificarUsuarioModal
        isOpen={showCalificarModal}
        onClose={() => setShowCalificarModal(false)}
        favor={favor}
        onCalificacionExitosa={() => {
          alert('Calificación enviada exitosamente');
          setShowCalificarModal(false);
        }}
      />
    </article>
  );
};

export default FavorCard;
