import React from 'react';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/mockData';

const FavorCard = ({ favor }) => {
  const { currentUser, respondToFavor, deleteFavor } = useAuth();

  const category = categories.find(c => c.id === favor.categoria);
  const isOwnFavor = currentUser && favor.solicitanteId === currentUser.id;
  const canRespond = currentUser && !isOwnFavor && favor.estado === 'activo';

  const handleRespond = () => {
    if (window.confirm('¿Deseas ofrecer ayuda con este favor?')) {
      respondToFavor(favor.id);
      alert('¡Gracias por tu ayuda! El solicitante fue notificado.');
    }
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de eliminar este favor?')) {
      deleteFavor(favor.id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-smooth p-6 border-l-4 border-uc-blue">
      {/* Header con título y categoría */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-uc-blue flex-grow">{favor.titulo}</h3>
        {favor.estado === 'completado' && (
          <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            ✓ Completado
          </span>
        )}
      </div>

      {/* Categoría */}
      {category && (
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </span>
        </div>
      )}

      {/* Descripción */}
      <p className="text-gray-600 mb-4 line-clamp-3">{favor.descripcion}</p>

      {/* Disponibilidad */}
      {favor.disponibilidad && (
        <p className="text-sm text-gray-500 mb-4">
          <span className="font-semibold">Disponibilidad:</span> {favor.disponibilidad}
        </p>
      )}

      {/* Footer con solicitante y acciones */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">👤</span>
          <div>
            <p className="text-sm font-semibold text-gray-700">{favor.solicitante}</p>
            <p className="text-xs text-gray-500">{favor.fecha}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-2">
          {canRespond && (
            <button
              onClick={handleRespond}
              className="px-4 py-2 bg-mint text-white rounded-lg font-semibold hover:bg-mint-light transition-smooth"
            >
              Ofrecer Ayuda
            </button>
          )}
          {isOwnFavor && favor.estado === 'activo' && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-smooth"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavorCard;
