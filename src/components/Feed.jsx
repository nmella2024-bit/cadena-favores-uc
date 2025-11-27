import { useState, useEffect, useMemo, useCallback } from 'react';
import { HandHeart, Megaphone, ShoppingBag, BookOpen } from 'lucide-react';
import { obtenerFeed } from '../services/feedService';
import { useAuth } from '../context/AuthContext';
import FeedItem from './FeedItem';

const Feed = () => {
  const { currentUser } = useAuth();
  const [feedItems, setFeedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('all');

  useEffect(() => {
    cargarFeed();
  }, [currentUser]);

  const cargarFeed = async () => {
    try {
      setIsLoading(true);
      const items = await obtenerFeed({
        carrera: currentUser?.carrera,
        limitPerType: 8,
      });
      setFeedItems(items);
    } catch (error) {
      console.error('Error al cargar feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const itemsFiltrados = useMemo(() => {
    if (filtroTipo === 'all') return feedItems;
    return feedItems.filter(item => item.type === filtroTipo);
  }, [feedItems, filtroTipo]);

  const handleFilterChange = useCallback((tipo) => {
    setFiltroTipo(tipo);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 w-24 bg-card border border-border rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${filtroTipo === 'all'
              ? 'bg-brand text-white'
              : 'bg-card border border-border text-text-muted hover:text-text-primary hover:border-brand/30'
            }`}
        >
          Todo
        </button>
        <button
          onClick={() => handleFilterChange('favor')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${filtroTipo === 'favor'
              ? 'bg-blue-500 text-white'
              : 'bg-card border border-border text-text-muted hover:text-text-primary hover:border-brand/30'
            }`}
        >
          <HandHeart className="w-3 sm:w-4 h-3 sm:h-4" />
          <span className="hidden xs:inline">Favores</span>
        </button>
        <button
          onClick={() => handleFilterChange('anuncio')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${filtroTipo === 'anuncio'
              ? 'bg-purple-500 text-white'
              : 'bg-card border border-border text-text-muted hover:text-text-primary hover:border-brand/30'
            }`}
        >
          <Megaphone className="w-3 sm:w-4 h-3 sm:h-4" />
          <span className="hidden xs:inline">Anuncios</span>
        </button>
        <button
          onClick={() => handleFilterChange('marketplace')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${filtroTipo === 'marketplace'
              ? 'bg-green-500 text-white'
              : 'bg-card border border-border text-text-muted hover:text-text-primary hover:border-brand/30'
            }`}
        >
          <ShoppingBag className="w-3 sm:w-4 h-3 sm:h-4" />
          <span className="hidden xs:inline">Marketplace</span>
        </button>
        <button
          onClick={() => handleFilterChange('material')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${filtroTipo === 'material'
              ? 'bg-yellow-500 text-white'
              : 'bg-card border border-border text-text-muted hover:text-text-primary hover:border-brand/30'
            }`}
        >
          <BookOpen className="w-3 sm:w-4 h-3 sm:h-4" />
          <span className="hidden xs:inline">Material</span>
        </button>
      </div>

      {/* Feed items */}
      {itemsFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted">No hay contenido disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itemsFiltrados.map(item => (
            <FeedItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
