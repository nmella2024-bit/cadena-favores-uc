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
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Tarjeta principal de perfil */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-8 animate-fade-in">
          {/* Header con fondo colorido */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-24 sm:h-32"></div>

          {/* Información del usuario */}
          <div className="px-6 sm:px-8 pb-8">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-16 mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-5xl sm:text-6xl mb-4 sm:mb-0">
                👤
              </div>
              <div className="sm:ml-6 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{currentUser.nombre}</h1>
                <p className="text-gray-600 text-sm sm:text-base">{currentUser.correo}</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">
                    {currentUser.carrera}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">
                    {currentUser.año}° año
                  </span>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {currentUser.descripcion && (
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Sobre mí</h3>
                <p className="text-gray-600 text-sm sm:text-base">{currentUser.descripcion}</p>
              </div>
            )}

            {/* Intereses */}
            {currentUser.intereses && currentUser.intereses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Intereses</h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser.intereses.map((interes, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs sm:text-sm font-medium"
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
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow duration-200">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{userFavors.length}</div>
            <div className="text-gray-600 text-sm">Favores Publicados</div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow duration-200">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{completedFavors.length}</div>
            <div className="text-gray-600 text-sm">Favores Completados</div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow duration-200">
            <div className="text-4xl mb-2">🤝</div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
              {currentUser.favoresRespondidos?.length || 0}
            </div>
            <div className="text-gray-600 text-sm">Favores Respondidos</div>
          </div>
        </div>

        {/* Favores publicados */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Mis Favores</h2>
            <button
              onClick={() => navigate('/publicar')}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              + Publicar Nuevo
            </button>
          </div>

          {/* Favores activos */}
          {activeFavors.length > 0 ? (
            <div className="space-y-4 mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Activos</h3>
              {activeFavors.map(favor => (
                <div
                  key={favor.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                        {favor.titulo}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {favor.descripcion}
                      </p>
                      <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500">
                        <span>📅 {favor.fecha}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          Activo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl sm:text-5xl mb-3">📭</div>
              <p className="text-sm sm:text-base">No tienes favores activos</p>
            </div>
          )}

          {/* Favores completados */}
          {completedFavors.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Completados</h3>
              {completedFavors.map(favor => (
                <div
                  key={favor.id}
                  className="border border-gray-200 rounded-lg p-4 opacity-60"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                        {favor.titulo}
                      </h4>
                      <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500">
                        <span>📅 {favor.fecha}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
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
            className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Ver Todos los Favores
          </button>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
