import { useRef, useEffect } from 'react';
import { Search, X, HandHeart, Megaphone, ShoppingBag, BookOpen, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch } from '../hooks/useGlobalSearch';

const SearchResultItem = ({ item, onClick, icon: Icon }) => (
  <button
    onClick={() => onClick(item)}
    className="w-full flex items-start gap-2 md:gap-3 p-2 md:p-3 hover:bg-card rounded-lg transition-colors text-left active:bg-card/80"
  >
    <div className="flex-shrink-0 mt-0.5">
      <Icon className={`w-4 h-4 ${getIconColor(item.type)}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm md:text-base font-medium text-text-primary truncate">
        {item.titulo || item.nombre}
      </p>
      <p className="text-xs md:text-sm text-text-muted line-clamp-1 mt-0.5 md:mt-1">
        {getDescription(item)}
      </p>
    </div>
  </button>
);

const getIconColor = (type) => {
  switch (type) {
    case 'favor': return 'text-blue-500';
    case 'anuncio': return 'text-purple-500';
    case 'marketplace': return 'text-green-500';
    case 'material': return 'text-yellow-600';
    case 'usuario': return 'text-gray-500';
    default: return 'text-text-muted';
  }
};

const getDescription = (item) => {
  if (item.type === 'marketplace' && item.precio) return `$${item.precio.toLocaleString('es-CL')}`;
  if (item.type === 'material') return item.carpetaInfo ? `📁 ${item.carpetaInfo.rutaCompleta}` : (item.carrera && item.ramo ? `${item.carrera} • ${item.ramo}` : 'Sin categoría');
  if (item.type === 'usuario') return item.carrera;
  return item.descripcion;
};

const GlobalSearch = () => {
  const { searchTerm, setSearchTerm, isOpen, setIsOpen, isLoading, results, clearSearch } = useGlobalSearch();
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar al hacer clic fuera (solo desktop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile && searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  const handleItemClick = (item) => {
    switch (item.type) {
      case 'favor': navigate(`/favor/${item.id}`); break;
      case 'anuncio': navigate('/anuncios'); break;
      case 'marketplace': navigate('/marketplace'); break;
      case 'material':
        if (item.carpetaId) navigate(`/material?folder=${item.carpetaId}`);
        else navigate('/material');
        break;
      case 'usuario': navigate(`/perfil/${item.id}`); break;
    }
    clearSearch();
  };

  const renderSection = (title, items, icon) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="p-3 md:p-4 border-t first:border-t-0 border-border">
        <p className="text-xs md:text-sm font-semibold text-text-muted uppercase tracking-wide mb-2 md:mb-3 px-1">
          {title} ({items.length})
        </p>
        <div className="space-y-1">
          {items.map(item => (
            <SearchResultItem key={item.id} item={item} onClick={handleItemClick} icon={icon} />
          ))}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!results || results.total === 0) return null;

    return (
      <>
        {renderSection('Favores', results.favores, HandHeart)}
        {renderSection('Anuncios', results.anuncios, Megaphone)}
        {renderSection('Marketplace', results.marketplace, ShoppingBag)}
        {renderSection('Material', results.material, BookOpen)}
        {renderSection('Usuarios', results.usuarios, User)}

        <div className="p-3 md:p-4 bg-card/50 text-center border-t border-border sticky bottom-0">
          <p className="text-xs text-text-muted">
            {results.total} {results.total === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </p>
        </div>
      </>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full md:w-auto flex-shrink-0">
      {/* Input Desktop */}
      <div className="hidden md:block relative w-20 lg:w-24">
        <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar..."
          className="w-full pl-6 pr-7 py-1.5 bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-xs"
        />
        {searchTerm && (
          <button onClick={clearSearch} className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 hover:bg-canvas rounded transition-colors">
            <X className="w-3 h-3 text-text-muted" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <Loader2 className="w-3 h-3 text-brand animate-spin" />
          </div>
        )}
      </div>

      {/* Botón Móvil */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="md:hidden p-1.5 sm:p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-canvas border border-border bg-card/70 flex-shrink-0"
        aria-label="Buscar"
      >
        <Search className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      {/* Dropdown Desktop */}
      {isOpen && searchTerm.trim().length >= 2 && (
        <div className="hidden md:block absolute top-full mt-2 left-0 right-0 md:left-auto md:right-auto bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn md:w-[700px] max-w-[95vw]">
          {isLoading && !results ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto mb-2" />
              <p className="text-sm text-text-muted">Buscando...</p>
            </div>
          ) : renderResults()}
        </div>
      )}

      {/* Modal Móvil */}
      {isOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={clearSearch} />
          <div className="md:hidden fixed inset-x-0 top-0 bottom-0 z-[70] flex flex-col bg-canvas">
            <div className="flex-shrink-0 border-b border-border bg-card shadow-sm">
              <div className="flex items-center gap-2 p-3">
                <button onClick={clearSearch} className="p-2 -ml-2 text-text-muted hover:text-text-primary transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar en NexU+..."
                    autoFocus
                    className="w-full pl-10 pr-10 py-2.5 bg-canvas border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {isLoading ? <Loader2 className="w-4 h-4 text-brand animate-spin" /> : searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-border rounded-full transition-colors">
                        <X className="w-4 h-4 text-text-muted" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {searchTerm.trim().length < 2 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-brand" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Buscar en NexU+</h3>
                  <p className="text-sm text-text-muted max-w-xs">Encuentra favores, anuncios, material de estudio, productos del marketplace y más...</p>
                </div>
              ) : isLoading && !results ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="w-12 h-12 text-brand animate-spin mb-4" />
                  <p className="text-sm text-text-muted">Buscando...</p>
                </div>
              ) : results && results.total === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-text-muted/10 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-text-muted/40" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">No se encontraron resultados</h3>
                  <p className="text-sm text-text-muted">No hay resultados para "{searchTerm}"</p>
                </div>
              ) : (
                <div className="divide-y divide-border">{renderResults()}</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalSearch;
