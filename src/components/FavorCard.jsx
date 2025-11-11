import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Link2, Tag, UserRound, MessageCircle, X, CheckCircle, Star, Flag, Pin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/mockData';
import { eliminarFavor, ofrecerAyuda, finalizarFavor } from '../services/favorService';
import { getUserData } from '../services/userService';
import PrimaryButton from './ui/PrimaryButton';
import GhostButton from './ui/GhostButton';
import CalificarUsuarioModal from './CalificarUsuarioModal';
import StarRating from './StarRating';
import { cn } from '../utils/cn';
import ReportModal from './ReportModal';
import { CONTENT_TYPES } from '../services/reportService';
import { puedeEliminar } from '../utils/adminUtils';
import VerifiedBadge from './VerifiedBadge';

const FavorCard = ({ favor, className }) => {
  const { currentUser, firebaseUser } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [showCalificarModal, setShowCalificarModal] = useState(false);
  const [solicitanteData, setSolicitanteData] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const category = categories.find((c) => c.id === favor.categoria);
  const isOwnFavor = currentUser && favor.usuarioId === currentUser.uid;
  const canDelete = currentUser && puedeEliminar(currentUser, favor.usuarioId);
  const canRespond = currentUser && !isOwnFavor && favor.estado === 'activo';
  const isCompleted = favor.estado === 'completado';
  const isConfirmado = favor.estado === 'confirmado';
  const isFinalizado = favor.estado === 'finalizado';

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

    if (window.confirm('¿Deseas ofrecer ayuda con este favor? El solicitante podrá ver tu oferta y aceptarte.')) {
      try {
        setLoadingContact(true);

        // Registrar oferta de ayuda usando el nuevo sistema
        await ofrecerAyuda(favor.id, currentUser);

        alert('¡Gracias por tu ayuda! El solicitante podrá ver tu oferta.');
        window.location.reload(); // Recargar para ver los cambios
      } catch (error) {
        console.error('Error al ofrecer ayuda:', error);
        alert(error.message || 'Error al ofrecer ayuda. Intenta nuevamente.');
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
        await eliminarFavor(favor.id, currentUser.uid);
        alert('Favor eliminado exitosamente');
        // Recargar la página para ver los cambios
        window.location.reload();
      } catch (error) {
        console.error('Error al eliminar favor:', error);
        alert(error.message || 'Error al eliminar el favor. Intenta nuevamente.');
      }
    }
  };

  const handleFinalizar = async () => {
    if (!firebaseUser) {
      alert('Debes iniciar sesión para finalizar este favor');
      return;
    }

    const mensaje = favor.ayudanteId
      ? '¿Confirmas que este favor se ha completado? Después podrás calificar al ayudante.'
      : '¿Confirmas que este favor se ha completado?';

    if (window.confirm(mensaje)) {
      try {
        await finalizarFavor(favor.id, currentUser.uid);
        alert('✅ Favor marcado como finalizado.');
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
        'rounded-xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md dark:bg-card/80 relative',
        className,
      )}
    >
      {/* Badge de favor fijado */}
      {favor.fijado && (
        <div className="absolute top-0 left-0">
          <div className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-br-lg flex items-center gap-1">
            <Pin className="h-3 w-3" />
            FIJADO
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 min-w-0">
        <h3 className="line-clamp-2 text-base sm:text-lg md:text-xl font-semibold tracking-tight min-w-0 flex-1" data-testid="favor-title">
          {favor.titulo}
        </h3>
        {isFinalizado && (
          <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-emerald-500">
            Finalizado
          </span>
        )}
        {isCompleted && !isFinalizado && (
          <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-emerald-500">
            Completado
          </span>
        )}
      </div>

      <div className="mt-2 sm:mt-3 md:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 text-xs sm:text-sm text-text-muted">
        {category && (
          <span
            data-testid="favor-category"
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-border bg-card/70 px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-text-muted dark:bg-card/50"
          >
            <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{category.name}</span>
          </span>
        )}
        <span className="inline-flex items-center gap-1 sm:gap-1.5 min-w-0">
          <UserRound className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{favor.solicitante || favor.nombreUsuario}</span>
          {solicitanteData?.rol && <VerifiedBadge userRole={solicitanteData.rol} size="sm" />}
        </span>
        {solicitanteData && solicitanteData.reputacion && (
          <span className="inline-flex items-center gap-0.5 sm:gap-1">
            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" aria-hidden="true" />
            <span className="font-medium">{solicitanteData.reputacion.toFixed(1)}</span>
            {solicitanteData.totalCalificaciones > 0 && (
              <span className="text-[10px] sm:text-xs">({solicitanteData.totalCalificaciones})</span>
            )}
          </span>
        )}
        <span className="inline-flex items-center gap-1 sm:gap-1.5 min-w-0">
          <CalendarDays className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" aria-hidden="true" />
          <time dateTime={favor.fecha} className="truncate">{favor.fecha}</time>
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-text-muted">{favor.descripcion}</p>

      {favor.disponibilidad && (
        <p className="mt-3 text-sm text-text-muted">
          <span className="font-medium text-text-primary">Disponibilidad:</span> {favor.disponibilidad}
        </p>
      )}

      <div className="mt-3 sm:mt-4 md:mt-6 flex flex-col gap-2 sm:gap-3 border-t border-border pt-2 sm:pt-3 md:pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs sm:text-sm text-text-muted">
          <span className="font-medium text-text-primary">Estado:</span>{' '}
          {isFinalizado ? 'Finalizado' : isConfirmado ? 'Confirmado' : isCompleted ? 'Completado' : 'Disponible'}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-1.5 sm:gap-2">
          {/* Botón ofrecer ayuda - solo si no es propio y está activo */}
          {canRespond && (
            <PrimaryButton
              data-testid="cta-offer"
              type="button"
              onClick={handleRespond}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2 text-xs sm:text-sm whitespace-nowrap"
              disabled={favor.ayudantes?.some(a => a.idUsuario === currentUser.uid) || loadingContact}
            >
              {favor.ayudantes?.some(a => a.idUsuario === currentUser.uid) ? 'Ya ofreciste' : loadingContact ? 'Registrando...' : 'Ofrecer ayuda'}
            </PrimaryButton>
          )}

          {/* Botón FINALIZAR para el solicitante (Usuario A) - cuando está activo */}
          {isOwnFavor && favor.estado === 'activo' && (
            <PrimaryButton
              type="button"
              onClick={handleFinalizar}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
            >
              <CheckCircle className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-1 sm:mr-1.5 inline flex-shrink-0" />
              Finalizar
            </PrimaryButton>
          )}

          {/* Botón CALIFICAR para el solicitante - después de finalizar y si hay ayudante */}
          {isOwnFavor && isFinalizado && favor.ayudanteId && (
            <PrimaryButton
              type="button"
              onClick={() => setShowCalificarModal(true)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2 text-xs sm:text-sm bg-yellow-600 hover:bg-yellow-700 whitespace-nowrap"
            >
              <Star className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-1 sm:mr-1.5 inline flex-shrink-0" />
              Calificar
            </PrimaryButton>
          )}

          {/* Botón CALIFICAR para el ayudante - después de que el solicitante finalizó */}
          {!isOwnFavor && favor.ayudanteId === currentUser?.uid && isFinalizado && (
            <PrimaryButton
              type="button"
              onClick={() => setShowCalificarModal(true)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2 text-xs sm:text-sm bg-yellow-600 hover:bg-yellow-700 whitespace-nowrap"
            >
              <Star className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-1 sm:mr-1.5 inline flex-shrink-0" />
              Calificar
            </PrimaryButton>
          )}

          {/* Botón eliminar - solo si es propio, admin y está activo */}
          {canDelete && favor.estado === 'activo' && (
            <GhostButton
              type="button"
              onClick={handleDelete}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2 text-xs sm:text-sm text-red-500 hover:bg-red-500/10 hover:text-red-400 focus-visible:ring-red-500/40 whitespace-nowrap"
            >
              Eliminar
            </GhostButton>
          )}

          {/* Botón ver detalles - siempre visible */}
          <GhostButton as={Link} to={`/favores?id=${favor.id}`} className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2 text-xs sm:text-sm whitespace-nowrap">
            <span className="inline-flex items-center gap-1 sm:gap-1.5">
              <Link2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Detalles</span>
              <span className="inline sm:hidden">Ver más</span>
            </span>
          </GhostButton>

          {/* Botón reportar - visible solo para usuarios logueados que no son el autor */}
          {currentUser && !isOwnFavor && (
            <GhostButton
              type="button"
              onClick={() => setShowReportModal(true)}
              className="w-full sm:w-auto px-2.5 sm:px-3 py-2 sm:py-2 text-xs sm:text-sm text-text-muted hover:text-red-500 hover:bg-red-500/10 focus-visible:ring-red-500/40"
              title="Reportar favor"
            >
              <Flag className="h-3.5 sm:h-4 w-3.5 sm:w-4 mx-auto sm:mx-0 flex-shrink-0" aria-hidden="true" />
            </GhostButton>
          )}
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

      {/* Modal para calificar usuario */}
      <CalificarUsuarioModal
        isOpen={showCalificarModal}
        onClose={() => setShowCalificarModal(false)}
        favor={favor}
        onCalificacionExitosa={() => {
          alert('✅ Favor finalizado y calificación enviada exitosamente');
          window.location.reload(); // Recargar para ver los cambios
        }}
      />

      {/* Modal para reportar favor */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType={CONTENT_TYPES.FAVOR}
        contentId={favor.id}
        contentTitle={favor.titulo}
        contentAuthorId={favor.usuarioId}
      />
    </article>
  );
};

export default FavorCard;
