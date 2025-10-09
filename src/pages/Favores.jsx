import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FavorCard from '../components/FavorCard';
import { categories } from '../data/mockData';

const Favores = () => {
  const { favors, currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar favores
  const filteredFavors = favors.filter(favor => {
    // Filtro por categoría
    const categoryMatch = selectedCategory === 'all' || favor.categoria === selectedCategory;

    // Filtro por búsqueda
    const searchMatch =
      searchQuery === '' ||
      favor.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favor.descripcion.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  // Separar favores activos y completados
  const activeFavors = filteredFavors.filter(f => f.estado === 'activo');
  const completedFavors = filteredFavors.filter(f => f.estado === 'completado');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con título y botón de publicar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-uc-blue mb-2">Favores Publicados</h1>
            <p className="text-gray-600">
              {activeFavors.length} {activeFavors.length === 1 ? 'favor activo' : 'favores activos'}
            </p>
          </div>
          {currentUser && (
            <Link
              to="/publicar"
              className="px-6 py-3 bg-mint text-white rounded-lg font-semibold hover:bg-mint-light transition-smooth shadow-md"
            >
              + Publicar Favor
            </Link>
          )}
        </div>

        {/* Barra de filtros */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Buscador */}
            <div className="flex-grow">
              <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar por palabra clave
              </label>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en título o descripción..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uc-blue focus:border-transparent transition-smooth"
              />
            </div>

            {/* Filtro por categoría */}
            <div className="lg:w-64">
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uc-blue focus:border-transparent transition-smooth"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags de categorías (alternativa visual) */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-semibold transition-smooth ${
                selectedCategory === 'all'
                  ? 'bg-uc-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-semibold transition-smooth ${
                  selectedCategory === cat.id
                    ? 'bg-uc-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de favores activos */}
        {!currentUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-center">
              <Link to="/login" className="font-semibold underline">
                Inicia sesión
              </Link>{' '}
              para poder responder a los favores publicados
            </p>
          </div>
        )}

        {activeFavors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {activeFavors.map(favor => (
              <FavorCard key={favor.id} favor={favor} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center mb-8">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No se encontraron favores
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : '¡Sé el primero en publicar un favor!'}
            </p>
            {currentUser && (
              <Link
                to="/publicar"
                className="inline-block px-6 py-3 bg-mint text-white rounded-lg font-semibold hover:bg-mint-light transition-smooth"
              >
                Publicar Favor
              </Link>
            )}
          </div>
        )}

        {/* Favores completados (opcional, colapsable) */}
        {completedFavors.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              Favores Completados ({completedFavors.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {completedFavors.map(favor => (
                <FavorCard key={favor.id} favor={favor} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favores;
