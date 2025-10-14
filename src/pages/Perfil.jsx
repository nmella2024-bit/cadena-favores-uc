import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerFavoresPorUsuario, obtenerFavoresConContactos } from '../services/favorService';
import { updateUserData } from '../services/userService';

const Perfil = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userFavors, setUserFavors] = useState([]);
  const [favoresConContactos, setFavoresConContactos] = useState({ publicados: [], respondidos: [] });
  const [loading, setLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Cargar favores del usuario
  useEffect(() => {
    const cargarFavores = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const favores = await obtenerFavoresPorUsuario(currentUser.uid);
        setUserFavors(favores);

        // Cargar también los favores con información de contacto
        const favoresContactos = await obtenerFavoresConContactos(currentUser.uid);
        setFavoresConContactos(favoresContactos);
      } catch (error) {
        console.error('Error al cargar favores del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarFavores();
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  // Calcular estadísticas
  const activeFavors = userFavors.filter(f => f.estado === 'activo');
  const completedFavors = userFavors.filter(f => f.estado === 'completado');

  // Función para guardar el teléfono
  const handleSavePhone = async () => {
    if (!phoneNumber.trim()) {
      alert('Por favor ingresa un número de teléfono');
      return;
    }

    try {
      await updateUserData(currentUser.uid, { telefono: phoneNumber });
      alert('Número de WhatsApp guardado exitosamente');
      setShowPhoneModal(false);
      window.location.reload(); // Recargar para actualizar los datos
    } catch (error) {
      console.error('Error al guardar teléfono:', error);
      alert('Error al guardar el número. Intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-canvas))] py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Tarjeta principal de perfil */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-fade-in dark:bg-card/80">
          {/* Header con fondo colorido */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-24 sm:h-32"></div>

          {/* Información del usuario */}
          <div className="px-6 sm:px-8 pb-8">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-16 mb-6">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-card bg-card text-5xl shadow-lg sm:mb-0 sm:h-32 sm:w-32 sm:text-6xl dark:border-border dark:bg-card/70">
                👤
              </div>
              <div className="sm:ml-6 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">{currentUser.nombre}</h1>
                <p className="text-sm text-text-muted sm:text-base">{currentUser.correo}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {currentUser.carrera && (
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand sm:text-sm">
                      {currentUser.carrera}
                    </span>
                  )}
                  {currentUser.año && (
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand sm:text-sm">
                      {currentUser.año}° año
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción */}
            {currentUser.descripcion && (
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2">Sobre mí</h3>
                <p className="text-text-muted text-sm sm:text-base">{currentUser.descripcion}</p>
              </div>
            )}

            {/* Intereses */}
            {currentUser.intereses && currentUser.intereses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2">Intereses</h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser.intereses.map((interes, index) => (
                    <span
                      key={index}
                      className="rounded-md bg-card/70 px-3 py-1 text-xs font-medium text-text-muted sm:text-sm dark:bg-card/50"
                    >
                      {interes}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alerta de WhatsApp faltante */}
        {!currentUser.telefono && (
          <div className="mb-8 rounded-xl border border-orange-500/30 bg-orange-500/10 p-6 shadow-sm dark:border-orange-500/20 dark:bg-orange-500/15">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-2">
                  Agrega tu número de WhatsApp
                </h3>
                <p className="text-sm text-text-muted mb-4">
                  Necesitas agregar un número de WhatsApp para poder responder a favores y recibir contacto de quienes ayuden con los tuyos.
                </p>
                <button
                  onClick={() => setShowPhoneModal(true)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                >
                  Agregar WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-card rounded-lg dark:bg-card/80 shadow-md border border-border p-6 text-center hover:shadow-lg transition-shadow duration-200">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
              {loading ? '...' : userFavors.length}
            </div>
            <div className="text-text-muted text-sm">Favores Publicados</div>
          </div>

          <div className="bg-card rounded-lg dark:bg-card/80 shadow-md border border-border p-6 text-center hover:shadow-lg transition-shadow duration-200">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1">
              {loading ? '...' : completedFavors.length}
            </div>
            <div className="text-text-muted text-sm">Favores Completados</div>
          </div>

          <div className="bg-card rounded-lg dark:bg-card/80 shadow-md border border-border p-6 text-center hover:shadow-lg transition-shadow duration-200">
            <div className="text-4xl mb-2">🤝</div>
            <div className="text-2xl sm:text-3xl font-bold text-brand mb-1">
              {currentUser.favoresCompletados?.length || 0}
            </div>
            <div className="text-text-muted text-sm">Favores Respondidos</div>
          </div>
        </div>

        {/* Favores publicados */}
        <div className="bg-card rounded-lg dark:bg-card/80 shadow-md border border-border p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Mis Favores</h2>
            <button
              onClick={() => navigate('/publicar')}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-[rgb(var(--brand))] rounded-md hover:bg-[rgb(var(--brand-hover))] transition-smooth shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))]"
            >
              + Publicar Nuevo
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-text-muted">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
              <p className="mt-4 text-sm">Cargando favores...</p>
            </div>
          ) : (
            <>
              {/* Favores activos */}
              {activeFavors.length > 0 ? (
                <div className="space-y-4 mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary">Activos</h3>
                  {activeFavors.map(favor => (
                    <div
                      key={favor.id}
                      className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <h4 className="text-base sm:text-lg font-semibold text-text-primary mb-1">
                            {favor.titulo}
                          </h4>
                          <p className="text-text-muted text-sm mb-2 line-clamp-2">
                            {favor.descripcion}
                          </p>
                          <div className="flex items-center gap-3 text-xs sm:text-sm text-text-muted">
                            <span>📅 {favor.fecha}</span>
                            <span className="px-2 py-1 bg-emerald-500/15 text-emerald-400 rounded text-xs font-semibold">
                              Activo
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted">
                  <div className="text-4xl sm:text-5xl mb-3">📭</div>
                  <p className="text-sm sm:text-base">No tienes favores activos</p>
                  <button
                    onClick={() => navigate('/publicar')}
                    className="mt-4 text-sm text-brand hover:underline"
                  >
                    Publica tu primer favor
                  </button>
                </div>
              )}

              {/* Favores completados */}
              {completedFavors.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-border">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary">Completados</h3>
                  {completedFavors.map(favor => (
                    <div
                      key={favor.id}
                      className="border border-border rounded-lg p-4 opacity-60"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <h4 className="text-base sm:text-lg font-semibold text-text-primary mb-1">
                            {favor.titulo}
                          </h4>
                          <div className="flex items-center gap-3 text-xs sm:text-sm text-text-muted">
                            <span>📅 {favor.fecha}</span>
                            <span className="px-2 py-1 bg-card/70 text-text-muted rounded text-xs font-semibold">
                              ✓ Completado
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Mis Contactos - Favores donde respondí */}
        {!loading && favoresConContactos.respondidos.length > 0 && (
          <div className="bg-card rounded-lg dark:bg-card/80 shadow-md border border-border p-6 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">
              Mis Contactos de WhatsApp
            </h2>
            <p className="text-sm text-text-muted mb-4">
              Favores donde ofreciste ayuda. Aquí puedes contactar a las personas que publicaron estos favores.
            </p>
            <div className="space-y-4">
              {favoresConContactos.respondidos.map((favor) => (
                <div
                  key={favor.id}
                  className="border border-border rounded-lg p-4 bg-emerald-500/5 dark:bg-emerald-500/10"
                >
                  <h4 className="text-base sm:text-lg font-semibold text-text-primary mb-2">
                    {favor.titulo}
                  </h4>
                  <p className="text-xs text-text-muted mb-3">Ofreciste ayuda el {favor.fecha}</p>

                  {favor.miContacto && favor.miContacto.solicitanteTelefono && (
                    <div className="rounded-lg bg-card/70 dark:bg-card/50 border border-border p-3">
                      <p className="text-xs font-semibold text-brand mb-2">Contacto del solicitante:</p>
                      <p className="text-sm font-medium text-text-primary mb-1">
                        {favor.miContacto.solicitanteNombre}
                      </p>
                      <p className="text-xs text-text-muted mb-3">{favor.miContacto.solicitanteEmail}</p>
                      <a
                        href={`https://wa.me/${favor.miContacto.solicitanteTelefono.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Contactar por WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón de acción */}
        <div className="text-center">
          <button
            onClick={() => navigate('/favores')}
            className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-[rgb(var(--brand))] rounded-md hover:bg-[rgb(var(--brand-hover))] transition-smooth shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))]"
          >
            Ver Todos los Favores
          </button>
        </div>
      </div>

      {/* Modal para agregar WhatsApp */}
      {showPhoneModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowPhoneModal(false)}
        >
          <div
            className="bg-card rounded-2xl border border-border shadow-2xl dark:bg-card/95 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-text-primary mb-4">
              Agregar Número de WhatsApp
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Este número solo será visible para personas con las que te conectes a través de favores.
            </p>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+56912345678"
              className="w-full px-4 py-2 rounded-lg border border-border bg-canvas text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPhoneModal(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-text-muted border border-border rounded-lg hover:bg-card/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePhone}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
