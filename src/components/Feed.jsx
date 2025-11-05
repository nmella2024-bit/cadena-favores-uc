import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HandHeart, Megaphone, ShoppingBag, BookOpen, Clock, User } from 'lucide-react';
import { obtenerFeed, formatearItemFeed } from '../services/feedService';
import { useAuth } from '../context/AuthContext';

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

  const filtrarItems = () => {
    if (filtroTipo === 'all') return feedItems;
    return feedItems.filter(item => item.type === filtroTipo);
  };

  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case 'favor':
        return <HandHeart className="w-5 h-5" />;
      case 'anuncio':
        return <Megaphone className="w-5 h-5" />;
      case 'marketplace':
        return <ShoppingBag className="w-5 h-5" />;
      case 'material':
        return <BookOpen className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getColorBadge = (tipo) => {
    switch (tipo) {
      case 'favor':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'anuncio':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'marketplace':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'material':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
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

  const renderFeedItem = (item) => {
    const formattedItem = formatearItemFeed(item);

    return (
      <Link
        key={item.id}
        to={formattedItem.link}
        className="block bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-brand/30 transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${getColorBadge(item.type)}`}>
              {getIconoTipo(item.type)}
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-semibold uppercase tracking-wide ${getColorBadge(item.type)}`}>
                {formattedItem.badge}
              </span>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatearFecha(item.timestamp)}
              </span>
            </div>
          </div>
          {formattedItem.fijado && (
            <span className="text-xs font-semibold text-brand bg-brand/10 px-2 py-1 rounded">
              Fijado
            </span>
          )}
        </div>

        {/* Contenido */}
        <div className="space-y-2">
          <h3 className="font-semibold text-text-primary line-clamp-2">
            {formattedItem.titulo}
          </h3>
          <p className="text-sm text-text-muted line-clamp-2">
            {formattedItem.descripcion}
          </p>

          {/* Info adicional según tipo */}
          {item.type === 'marketplace' && formattedItem.precio && (
            <p className="text-lg font-bold text-brand">
              ${formattedItem.precio.toLocaleString('es-CL')}
            </p>
          )}

          {item.type === 'material' && (
            <div className="flex flex-wrap gap-2">
              {formattedItem.carrera && (
                <span className="text-xs bg-canvas px-2 py-1 rounded">
                  {formattedItem.carrera}
                </span>
              )}
              {formattedItem.ramo && (
                <span className="text-xs bg-canvas px-2 py-1 rounded">
                  {formattedItem.ramo}
                </span>
              )}
            </div>
          )}

          {item.type === 'favor' && formattedItem.categoria && (
            <span className="inline-block text-xs bg-canvas px-2 py-1 rounded">
              {formattedItem.categoria}
            </span>
          )}
        </div>

        {/* Footer - Autor */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <User className="w-4 h-4 text-text-muted" />
          <span className="text-sm text-text-muted">
            {formattedItem.autor || 'Usuario'}
          </span>
        </div>
      </Link>
    );
  };

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

  const itemsFiltrados = filtrarItems();

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroTipo('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filtroTipo === 'all'
              ? 'bg-brand text-white'
              : 'bg-card border border-border text-text-muted hover:text-text-primary hover:border-brand/30'
          }`}
        >
          Todo
        </button>
        <button
          onClick={() => setFiltroTipo('favor')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filtroTipo === 'favor'
              ? 'bg-blue-500 text-white'
              : 'bg-card border border-border text-text-muted hover:text-text-primary hover:border-brand/30'
          }`}
        >
          <HandHeart className="w-4 h-4" />
          Favores
        </button>
        <button
          onClick={() => setFiltroTipo('anuncio')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filtroTipo === 'anuncio'
              ? 'bg-purple-500 text-white'
              : 'bg-card border border-border text-text-muted hover:text-text-primary hover:border-brand/30'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Anuncios
        </button>
        <button
          onClick={() => setFiltroTipo('marketplace')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filtroTipo === 'marketplace'
              ? 'bg-green-500 text-white'
              : 'bg-card border border-border text-text-muted hover:text-text-primary hover:border-brand/30'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Marketplace
        </button>
        <button
          onClick={() => setFiltroTipo('material')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filtroTipo === 'material'
              ? 'bg-yellow-500 text-white'
              : 'bg-card border border-border text-text-muted hover:text-text-primary hover:border-brand/30'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Material
        </button>
      </div>

      {/* Feed items */}
      {itemsFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted">No hay contenido disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itemsFiltrados.map(item => renderFeedItem(item))}
        </div>
      )}
    </div>
  );
};

export default Feed;
