import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, BookOpen, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buscarEnMateriales } from '../services/searchService';

const MaterialSearch = ({ carpetaActualId = null, onNavigarACarpeta = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({ carpetas: [], materiales: [] });
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
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      realizarBusqueda(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm, carpetaActualId]);

  const realizarBusqueda = async (term) => {
    try {
      setIsLoading(true);
      // Buscar en todas las carpetas ('all') o en la carpeta actual si está definida
      const carpetaIdParaBusqueda = carpetaActualId || 'all';
      const searchResults = await buscarEnMateriales(term, carpetaIdParaBusqueda, 50);

      // Validar que los resultados tengan la estructura correcta
      if (searchResults && typeof searchResults === 'object') {
        setResults({
          carpetas: searchResults.carpetas || [],
          materiales: searchResults.materiales || []
        });
      } else {
        setResults({ carpetas: [], materiales: [] });
      }
    } catch (error) {
      console.error('[MaterialSearch] Error en búsqueda:', error);
      setResults({ carpetas: [], materiales: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (!isOpen && newValue.length > 0) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setResults({ carpetas: [], materiales: [] });
    inputRef.current?.focus();
  };

  const handleMaterialClick = (material) => {
    // Navegar a la carpeta del material si tiene una
    if (material.carpetaId) {
      navigate(`/material?folder=${material.carpetaId}`);
    } else {
      navigate('/material');
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCarpetaClick = (carpeta) => {
    // Navegar a la carpeta
    if (onNavigarACarpeta) {
      onNavigarACarpeta(carpeta.id);
    } else {
      navigate(`/material?folder=${carpeta.id}`);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const renderResults = () => {
    if (searchTerm.trim().length < 2) {
      return (
        <div className="p-8 text-center">
          <Search className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            Escribe al menos 2 caracteres para buscar
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto mb-2" />
          <p className="text-sm text-text-muted">Buscando...</p>
        </div>
      );
    }

    if (results.carpetas.length === 0 && results.materiales.length === 0) {
      return (
        <div className="p-8 text-center">
          <Search className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            No se encontraron resultados para "{searchTerm}"
          </p>
        </div>
      );
    }

    const totalResultados = results.carpetas.length + results.materiales.length;

    return (
      <div className="divide-y divide-border overflow-y-auto" style={{ maxHeight: '500px' }}>
        {/* Carpetas */}
        {results.carpetas.length > 0 && (
          <div className="p-4">
            <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
              Carpetas ({results.carpetas.length})
            </p>
            {results.carpetas.map(carpeta => (
              <button
                key={carpeta.id}
                onClick={() => handleCarpetaClick(carpeta)}
                className="w-full flex items-start gap-3 p-3 hover:bg-canvas rounded-lg transition-colors text-left mb-1"
              >
                <Folder className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-text-primary truncate">
                    {carpeta.nombre}
                  </p>
                  {carpeta.rutaCompleta && (
                    <p className="text-sm text-text-muted truncate mt-1">
                      📂 {carpeta.rutaCompleta}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Materiales */}
        {results.materiales.length > 0 && (
          <div className="p-4">
            <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
              Materiales ({results.materiales.length})
            </p>
            {results.materiales.map(material => (
              <button
                key={material.id}
                onClick={() => handleMaterialClick(material)}
                className="w-full flex items-start gap-3 p-3 hover:bg-canvas rounded-lg transition-colors text-left mb-1"
              >
                <BookOpen className="w-4 h-4 text-yellow-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-text-primary truncate">
                    {material.titulo}
                  </p>
                  {material.carpetaInfo ? (
                    <p className="text-sm text-text-muted truncate mt-1">
                      📁 {material.carpetaInfo.rutaCompleta}
                    </p>
                  ) : (
                    <p className="text-sm text-text-muted truncate mt-1">
                      {material.carrera && material.ramo ? `${material.carrera} • ${material.ramo}` : 'Sin categoría'}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer con total */}
        <div className="p-3 bg-canvas text-center">
          <p className="text-xs text-text-muted">
            {totalResultados} {totalResultados === 1 ? 'resultado' : 'resultados'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      {/* Input de búsqueda */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchTerm.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder="Buscar por nombre, carpeta, ramo, profesor..."
          className="w-full pl-12 pr-12 py-3 bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
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
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-brand animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && searchTerm.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
          {renderResults()}
        </div>
      )}
    </div>
  );
};

export default MaterialSearch;
