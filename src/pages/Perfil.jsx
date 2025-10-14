import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Perfil = () => {
  const navigate = useNavigate();
  const { currentUser, favors } = useAuth();

  // Redirigir si no está autenticado
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  // Obtener favores del usuario
  const userFavors = favors.filter(f => f.solicitanteId === currentUser.id);
  const activeFavors = userFavors.filter(f => f.estado === 'activo');
  const completedFavors = userFavors.filter(f => f.estado === 'completado');

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
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand sm:text-sm">
                    {currentUser.carrera}
                  </span>
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand sm:text-sm">
                    {currentUser.año}° año
                  </span>
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

        {/* Estadísticas */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-card rounded-lg dark:bg-card/80 shadow-md border border-border p-6 text-center hover:shadow-lg transition-shadow duration-200">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">{userFavors.length}</div>
            <div className="text-text-muted text-sm">Favores Publicados</div>
          </div>

          <div className="bg-card rounded-lg dark:bg-card/80 shadow-md border border-border p-6 text-center hover:shadow-lg transition-shadow duration-200">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1">{completedFavors.length}</div>
            <div className="text-text-muted text-sm">Favores Completados</div>
          </div>

          <div className="bg-card rounded-lg dark:bg-card/80 shadow-md border border-border p-6 text-center hover:shadow-lg transition-shadow duration-200">
            <div className="text-4xl mb-2">🤝</div>
            <div className="text-2xl sm:text-3xl font-bold text-brand mb-1">
              {currentUser.favoresRespondidos?.length || 0}
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
        </div>

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
    </div>
  );
};

export default Perfil;
