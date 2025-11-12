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

  // Log cuando el componente se monta
  useEffect(() => {
    const instanceId = Math.random().toString(36).substring(7);
    console.log(`[GlobalSearch ${instanceId}] Componente montado correctamente`);
    console.log(`[GlobalSearch ${instanceId}] buscarGlobal importado:`, typeof buscarGlobal);

    // Guardar el ID en el ref para debugging
    if (searchRef.current) {
      searchRef.current.dataset.instanceId = instanceId;
    }
  }, []);

  // Cerrar al hacer clic fuera (solo desktop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Solo cerrar en desktop, no en móvil (modal tiene su propio botón de cerrar)
      const isMobile = window.innerWidth < 768;
      if (!isMobile && searchRef.current && !searchRef.current.contains(event.target)) {
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
    console.log('[GlobalSearch useEffect] searchTerm cambió:', searchTerm, 'longitud:', searchTerm.trim().length);

    if (searchTerm.trim().length < 2) {
      console.log('[GlobalSearch useEffect] Término muy corto, no buscar');
      setResults(null);
      return;
    }

    console.log('[GlobalSearch useEffect] Programando búsqueda en 300ms...');
    const timeoutId = setTimeout(() => {
      console.log('[GlobalSearch useEffect] Ejecutando búsqueda después de debounce');
      realizarBusqueda(searchTerm);
    }, 300); // 300ms de debounce

    return () => {
      console.log('[GlobalSearch useEffect] Limpiando timeout');
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  const realizarBusqueda = async (term) => {
    try {
      console.log('[GlobalSearch] Iniciando búsqueda para:', term);
      setIsLoading(true);
      const searchResults = await buscarGlobal(term, {
        collections: ['favores', 'anuncios', 'marketplace', 'material', 'usuarios'],
        limitPerCollection: 5
      });
      console.log('[GlobalSearch] Resultados recibidos:', searchResults);
      setResults(searchResults);
    } catch (error) {
      console.error('[GlobalSearch] Error en búsqueda:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    console.log('[GlobalSearch handleInputChange] Nuevo valor:', newValue);
    setSearchTerm(newValue);
    if (!isOpen) {
      console.log('[GlobalSearch handleInputChange] Abriendo dropdown');
      setIsOpen(true);
    }
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
        // Si tiene carpeta, navegar a la carpeta específica
        if (item.carpetaId) {
          navigate(`/material?folder=${item.carpetaId}`);
        } else {
          navigate('/material');
        }
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
                  {item.carpetaInfo ? (
                    <p className="text-sm text-text-muted truncate mt-1">
                      📁 {item.carpetaInfo.rutaCompleta}
                    </p>
                  ) : (
                    <p className="text-sm text-text-muted truncate mt-1">
                      {item.carrera && item.ramo ? `${item.carrera} • ${item.ramo}` : 'Sin categoría'}
                    </p>
                  )}
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
    <div ref={searchRef} className="relative w-full md:w-auto flex-shrink-0">
      {/* Input de búsqueda - Desktop */}
      <div className="hidden md:block relative w-20 lg:w-24">
        <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          data-search-type="desktop"
          onChange={(e) => {
            console.log('[GlobalSearch INPUT Desktop] onChange disparado:', e.target.value);
            handleInputChange(e);
          }}
          onFocus={() => {
            console.log('[GlobalSearch INPUT Desktop] onFocus disparado');
            setIsOpen(true);
          }}
          onKeyDown={(e) => console.log('[GlobalSearch INPUT Desktop] tecla presionada:', e.key)}
          onInput={(e) => console.log('[GlobalSearch INPUT Desktop] onInput disparado:', e.target.value)}
          placeholder="Buscar..."
          className="w-full pl-6 pr-7 py-1.5 bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-xs"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 hover:bg-canvas rounded transition-colors"
          >
            <X className="w-3 h-3 text-text-muted" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <Loader2 className="w-3 h-3 text-brand animate-spin" />
          </div>
        )}
      </div>

      {/* Icono de búsqueda - Móvil */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="md:hidden p-1 sm:p-1.5 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-canvas border border-border bg-card/70 flex-shrink-0"
        aria-label="Buscar"
      >
        <Search className="w-4 h-4 sm:w-4 sm:h-4" />
      </button>

      {/* Dropdown de resultados - Desktop */}
      {isOpen && searchTerm.trim().length >= 2 && (
        <div className="hidden md:block absolute top-full mt-2 left-0 right-0 md:left-auto md:right-auto bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn md:w-[700px] max-w-[95vw]">
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

      {/* Backdrop móvil para cerrar al hacer clic fuera */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
            setResults(null);
          }}
        />
      )}

      {/* Dropdown de resultados - Móvil */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-2 top-14 sm:top-16 bottom-2 z-50 animate-fadeIn pointer-events-none">
          <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden h-full flex flex-col pointer-events-auto">
            {/* Input de búsqueda móvil */}
            <div className="p-2 sm:p-3 border-b border-border bg-canvas flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted flex-shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  data-search-type="mobile"
                  onChange={(e) => {
                    console.log('[GlobalSearch INPUT Mobile] onChange disparado:', e.target.value);
                    handleInputChange(e);
                  }}
                  onFocus={() => console.log('[GlobalSearch INPUT Mobile] onFocus disparado')}
                  onKeyDown={(e) => console.log('[GlobalSearch INPUT Mobile] tecla presionada:', e.key)}
                  onInput={(e) => console.log('[GlobalSearch INPUT Mobile] onInput disparado:', e.target.value)}
                  placeholder="Buscar..."
                  autoFocus
                  className="w-full pl-8 sm:pl-9 pr-14 sm:pr-16 py-1.5 sm:py-2 bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors text-xs sm:text-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  {searchTerm && (
                    <button
                      onClick={handleClear}
                      className="p-1 hover:bg-canvas rounded transition-colors"
                      aria-label="Limpiar"
                    >
                      <X className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-canvas rounded transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="w-3.5 h-3.5 text-text-muted" />
                  </button>
                </div>
                {isLoading && (
                  <div className="absolute right-14 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-brand animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Resultados móvil */}
            <div className="overflow-y-auto flex-1">
              {searchTerm.trim().length >= 2 ? (
                isLoading && !results ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto mb-2" />
                    <p className="text-sm text-text-muted">Buscando...</p>
                  </div>
                ) : (
                  renderResults()
                )
              ) : (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
                  <p className="text-text-muted text-sm">
                    Escribe al menos 2 caracteres para buscar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
