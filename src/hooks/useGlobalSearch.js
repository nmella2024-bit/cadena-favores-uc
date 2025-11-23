import { useState, useEffect, useCallback } from 'react';
import { buscarGlobal } from '../services/searchService';

/**
 * Hook personalizado para manejar la lógica de búsqueda global.
 * @returns {object} - Estado y funciones de búsqueda.
 */
export const useGlobalSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);

    // Función de búsqueda con manejo de errores
    const performSearch = useCallback(async (term) => {
        if (!term || term.trim().length < 2) {
            setResults(null);
            return;
        }

        setIsLoading(true);
        try {
            const searchResults = await buscarGlobal(term, {
                collections: ['favores', 'anuncios', 'marketplace', 'material', 'usuarios'],
                limitPerCollection: 5
            });
            setResults(searchResults);
        } catch (error) {
            console.error('Error en búsqueda global:', error);
            setResults(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounce effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim().length >= 2) {
                performSearch(searchTerm);
            } else {
                setResults(null);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, performSearch]);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setResults(null);
        setIsOpen(false);
    }, []);

    return {
        searchTerm,
        setSearchTerm,
        isOpen,
        setIsOpen,
        isLoading,
        results,
        clearSearch
    };
};
