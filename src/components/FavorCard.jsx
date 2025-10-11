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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
      {/* Header con título y categoría */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-900 flex-grow">{favor.titulo}</h3>
        {favor.estado === 'completado' && (
          <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            ✓ Completado
          </span>
        )}
      </div>

      {/* Categoría */}
      {category && (
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </span>
        </div>
      )}

      {/* Descripción */}
      <p className="text-gray-600 mb-4 line-clamp-3 text-base">{favor.descripcion}</p>

      {/* Disponibilidad */}
      {favor.disponibilidad && (
        <p className="text-sm text-gray-600 mb-4">
          <span className="font-semibold">Disponibilidad:</span> {favor.disponibilidad}
        </p>
      )}

      {/* Footer con solicitante y acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-200 gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">👤</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{favor.solicitante}</p>
            <p className="text-xs text-gray-500">{favor.fecha}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-2">
          {canRespond && (
            <button
              onClick={handleRespond}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              Ofrecer Ayuda
            </button>
          )}
          {isOwnFavor && favor.estado === 'activo' && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
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
