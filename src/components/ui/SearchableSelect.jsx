import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

/**
 * Componente de select con búsqueda para facilitar la selección en listas largas
 */
const SearchableSelect = ({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Buscar...',
  required = false,
  disabled = false,
  hint = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar opciones basándose en la búsqueda
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option) => {
    // Simular un evento como si fuera un select nativo
    const event = {
      target: {
        name: name,
        value: option,
      },
    };
    onChange(event);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    const event = {
      target: {
        name: name,
        value: '',
      },
    };
    onChange(event);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        // Enfocar el input de búsqueda cuando se abre
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  return (
    <div className="w-full" ref={wrapperRef}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="ml-1 text-brand">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Campo de selección */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`w-full px-4 py-2.5 bg-background border rounded-lg text-left flex items-center justify-between transition-colors ${
            disabled
              ? 'border-border/50 text-text-muted/50 cursor-not-allowed'
              : 'border-border text-text-primary hover:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'
          }`}
        >
          <span className={value ? 'text-text-primary' : 'text-text-muted'}>
            {value || placeholder}
          </span>
          <div className="flex items-center gap-2">
            {value && !disabled && (
              <X
                className="h-4 w-4 text-text-muted hover:text-text-primary transition-colors"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              className={`h-4 w-4 text-text-muted transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Dropdown con búsqueda */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-card dark:bg-[rgb(var(--bg-canvas))] border border-border rounded-lg shadow-lg overflow-hidden animate-fade-in">
            {/* Input de búsqueda */}
            <div className="p-3 border-b border-border bg-background/50 dark:bg-background/80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2 bg-background dark:bg-card border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                />
              </div>
            </div>

            {/* Lista de opciones */}
            <div className="max-h-60 overflow-y-auto bg-card dark:bg-[rgb(var(--bg-canvas))]">
              {filteredOptions.length > 0 ? (
                <ul className="py-1">
                  {filteredOptions.map((option, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => handleSelect(option)}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          value === option
                            ? 'bg-brand/10 text-brand font-medium'
                            : 'text-text-primary hover:bg-background dark:hover:bg-card'
                        }`}
                      >
                        {option}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-text-muted">
                  No se encontraron resultados para "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {hint && <p className="mt-2 text-xs text-text-muted">{hint}</p>}
    </div>
  );
};

export default SearchableSelect;
