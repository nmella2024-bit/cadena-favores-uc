import { useState, useEffect, useRef } from 'react';
import { Search, X, HandHeart, Megaphone, ShoppingBag, BookOpen, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buscarGlobal } from '../services/searchService';

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
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

  // Debounce de búsqueda
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      realizarBusqueda(searchTerm);
    }, 300); // 300ms de debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const realizarBusqueda = async (term) => {
    try {
      setIsLoading(true);
      const searchResults = await buscarGlobal(term, {
        collections: ['favores', 'anuncios', 'marketplace', 'material', 'usuarios'],
        limitPerCollection: 5
      });
      setResults(searchResults);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleClear = () => {
    setSearchTerm('');
    setResults(null);
    inputRef.current?.focus();
  };

  const handleItemClick = (item) => {
    // Navegar según el tipo de item
    switch (item.type) {
      case 'favor':
        navigate(`/favor/${item.id}`);
        break;
      case 'anuncio':
        navigate('/anuncios');
        break;
      case 'marketplace':
        navigate('/marketplace');
        break;
      case 'material':
        navigate('/material');
        break;
      case 'usuario':
        navigate(`/perfil/${item.id}`);
        break;
      default:
        break;
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'favor':
        return <HandHeart className="w-4 h-4 text-blue-500" />;
      case 'anuncio':
        return <Megaphone className="w-4 h-4 text-purple-500" />;
      case 'marketplace':
        return <ShoppingBag className="w-4 h-4 text-green-500" />;
      case 'material':
        return <BookOpen className="w-4 h-4 text-yellow-600" />;
      case 'usuario':
        return <User className="w-4 h-4 text-gray-500" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'favor':
        return 'Favor';
      case 'anuncio':
        return 'Anuncio';
      case 'marketplace':
        return 'Marketplace';
      case 'material':
        return 'Material';
      case 'usuario':
        return 'Usuario';
      default:
        return '';
    }
  };

  const renderResults = () => {
    if (!results) return null;

    const hasResults = results.total > 0;

    if (!hasResults) {
      return (
        <div className="p-8 text-center">
          <Search className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            No se encontraron resultados para "{searchTerm}"
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-border overflow-y-auto" style={{ maxHeight: '700px' }}>
        {/* Favores */}
        {results.favores.length > 0 && (
          <div className="p-4">
            <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
              Favores ({results.favores.length})
            </p>
            {results.favores.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-start gap-3 p-3 hover:bg-canvas rounded-lg transition-colors text-left mb-1"
              >
                {getIconForType(item.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-text-primary truncate">
                    {item.titulo}
                  </p>
                  <p className="text-sm text-text-muted truncate mt-1">
                    {item.descripcion}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Anuncios */}
        {results.anuncios.length > 0 && (
          <div className="p-4">
            <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
              Anuncios ({results.anuncios.length})
            </p>
            {results.anuncios.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-start gap-3 p-3 hover:bg-canvas rounded-lg transition-colors text-left mb-1"
              >
                {getIconForType(item.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-text-primary truncate">
                    {item.titulo}
                  </p>
                  <p className="text-sm text-text-muted truncate mt-1">
                    {item.descripcion}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Marketplace */}
        {results.marketplace.length > 0 && (
          <div className="p-4">
            <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
              Marketplace ({results.marketplace.length})
            </p>
            {results.marketplace.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-start gap-3 p-3 hover:bg-canvas rounded-lg transition-colors text-left mb-1"
              >
                {getIconForType(item.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-text-primary truncate">
                    {item.titulo}
                  </p>
                  {item.precio && (
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      ${item.precio.toLocaleString('es-CL')}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Material */}
        {results.material.length > 0 && (
          <div className="p-4">
            <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
              Material ({results.material.length})
            </p>
            {results.material.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-start gap-3 p-3 hover:bg-canvas rounded-lg transition-colors text-left mb-1"
              >
                {getIconForType(item.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-text-primary truncate">
                    {item.titulo}
                  </p>
                  <p className="text-sm text-text-muted truncate mt-1">
                    {item.carrera} • {item.ramo}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Usuarios */}
        {results.usuarios.length > 0 && (
          <div className="p-4">
            <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
              Usuarios ({results.usuarios.length})
            </p>
            {results.usuarios.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-start gap-3 p-3 hover:bg-canvas rounded-lg transition-colors text-left mb-1"
              >
                {getIconForType(item.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-text-primary truncate">
                    {item.nombre}
                  </p>
                  <p className="text-sm text-text-muted truncate mt-1">
                    {item.carrera}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer con total */}
        <div className="p-3 bg-canvas text-center">
          <p className="text-xs text-text-muted">
            {results.total} {results.total === 1 ? 'resultado' : 'resultados'} encontrados
          </p>
        </div>
      </div>
    );
  };

  return (
    <div ref={searchRef} className="relative transition-all duration-300" style={{ width: isOpen ? '700px' : '117px' }}>
      {/* Input de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={isOpen ? "Buscar favores, anuncios, productos..." : "Buscar..."}
          className="w-full pl-10 pr-10 py-2 bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-canvas rounded transition-colors"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-brand animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && searchTerm.trim().length >= 2 && (
        <div className="absolute top-full mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn" style={{ width: '700px' }}>
          {isLoading && !results ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto mb-2" />
              <p className="text-sm text-text-muted">Buscando...</p>
            </div>
          ) : (
            renderResults()
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
