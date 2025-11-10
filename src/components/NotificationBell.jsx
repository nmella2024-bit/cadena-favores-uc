import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  suscribirseANotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
} from '../services/notificationService';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const { currentUser } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [noLeidas, setNoLeidas] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Suscribirse a notificaciones en tiempo real
  useEffect(() => {
    if (!currentUser) {
      console.log('❌ NotificationBell: No hay usuario logueado');
      return;
    }

    console.log('🔔 NotificationBell: Suscribiéndose a notificaciones para usuario:', currentUser.uid);

    try {
      const unsubscribe = suscribirseANotificaciones(currentUser.uid, (notifs) => {
        console.log('🔔 NotificationBell: Notificaciones recibidas:', notifs.length);
        console.log('🔔 Notificaciones:', notifs);
        setNotificaciones(notifs);
        const countNoLeidas = notifs.filter(n => !n.leida).length;
        setNoLeidas(countNoLeidas);
        console.log('🔔 NotificationBell: Notificaciones no leídas:', countNoLeidas);
      });

      return () => {
        console.log('🔔 NotificationBell: Desuscribiendo...');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ NotificationBell: Error en suscripción:', error);
    }
  }, [currentUser]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    // Marcar como leída
    if (!notification.leida) {
      await marcarComoLeida(notification.id);
    }

    // Navegar según el tipo de notificación
    if (notification.data?.favorId) {
      navigate(`/favor/${notification.data.favorId}`);
    }

    setIsOpen(false);
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await marcarTodasComoLeidas(currentUser.uid);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return '';

    const fecha = timestamp.toDate();
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffMinutos = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMinutos < 1) return 'Ahora';
    if (diffMinutos < 60) return `Hace ${diffMinutos} min`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias < 7) return `Hace ${diffDias}d`;

    return fecha.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getIconoNotificacion = (tipo) => {
    switch (tipo) {
      case 'offer_help':
        return '🤝';
      case 'help_accepted':
        return '✅';
      case 'new_rating':
        return '⭐';
      case 'favor_completed':
        return '🎉';
      case 'new_anuncio':
        return '📢';
      case 'new_material':
        return '📚';
      default:
        return '🔔';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-canvas border border-border bg-card/70 flex-shrink-0"
      >
        <Bell className="w-5 h-5" />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-card">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="fixed md:absolute left-2 right-2 md:left-auto md:right-0 md:translate-x-0 top-14 md:top-auto mt-0 md:mt-2 w-auto md:w-96 max-w-md max-h-[70vh] md:max-h-[32rem] bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-canvas">
            <h3 className="text-lg font-semibold text-text-primary">
              Notificaciones
            </h3>
            <div className="flex items-center gap-2">
              {noLeidas > 0 && (
                <button
                  onClick={handleMarcarTodasLeidas}
                  className="text-xs text-brand hover:text-brand-hover transition-colors flex items-center gap-1"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-4 h-4" />
                  Marcar todas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-border rounded transition-colors"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto max-h-[28rem]">
            {notificaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-16 h-16 text-text-muted/30 mb-3" />
                <p className="text-text-muted text-sm text-center">
                  No tienes notificaciones
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notificaciones.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full px-4 py-3 text-left hover:bg-canvas transition-colors ${
                      !notif.leida ? 'bg-brand/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icono */}
                      <div className="text-2xl flex-shrink-0 mt-0.5">
                        {getIconoNotificacion(notif.type)}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm text-text-primary line-clamp-1">
                            {notif.title}
                          </p>
                          {!notif.leida && (
                            <div className="w-2 h-2 bg-brand rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-text-muted mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          {formatearFecha(notif.fechaCreacion)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificaciones.length > 0 && (
            <div className="px-4 py-2 border-t border-border bg-canvas text-center">
              <p className="text-xs text-text-muted">
                Mostrando {notificaciones.length} {notificaciones.length === 1 ? 'notificación' : 'notificaciones'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
