/*
 * TEMPORALMENTE DESHABILITADO: UCloseMeal
 * Este componente está deshabilitado pero se mantiene para una posible implementación futura.
 * Para reactivar: descomentar rutas en App.jsx y entrada en Navbar.jsx
 */
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Store, Clock, MapPin, ChevronRight } from 'lucide-react';
import { restaurants, getCategories } from '../data/restaurants';
import TextField from '../components/ui/TextField';

const CompradorRestaurantes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => getCategories(), []);

  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants;

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((r) => r.categoria === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.nombre.toLowerCase().includes(query) ||
          r.descripcion.toLowerCase().includes(query) ||
          r.categoria.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Restaurantes Disponibles
          </h1>
          <p className="text-text-muted">
            Elige un restaurante y explora su menú
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <TextField
            placeholder="Buscar restaurantes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-brand text-white'
                  : 'bg-card border border-border text-text-muted hover:text-text-primary'
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-brand text-white'
                    : 'bg-card border border-border text-text-muted hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurants Grid */}
        {filteredRestaurants.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Store className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">No se encontraron restaurantes</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/uclosemeal/comprador/restaurante/${restaurant.id}`}
                className="bg-card border border-border rounded-xl p-6 hover:border-brand transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-brand/10 p-3 rounded-full group-hover:bg-brand/20 transition-colors">
                    <Store className="h-6 w-6 text-brand" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-brand transition-colors" />
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-2">
                  {restaurant.nombre}
                </h3>

                <p className="text-sm text-text-muted mb-4 line-clamp-2">
                  {restaurant.descripcion}
                </p>

                <div className="space-y-2 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{restaurant.horario}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{restaurant.ubicacion}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <span className="inline-block px-3 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full">
                    {restaurant.categoria}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompradorRestaurantes;
