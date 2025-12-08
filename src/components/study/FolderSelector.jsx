import React, { useState, useEffect } from 'react';
import { Search, Folder, ChevronRight, Loader2, Check } from 'lucide-react';
import { buscarCarpetas, obtenerRutaCarpeta } from '../../services/folderService';

const FolderSelector = ({ onSelect, onCancel }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debouncedTerm, setDebouncedTerm] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const search = async () => {
            if (!debouncedTerm || debouncedTerm.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // 1. Get all folders matching the name partially
                // Note: This is a client-side filter over a fetched list in the service, 
                // or a simple query. For "Smart Search", we need to be clever.
                // The service 'buscarCarpetas' filters by name.
                // But if user types "I2 Calculo", and folder is "I2" inside "Calculo", 
                // 'buscarCarpetas' might fail if it only checks the folder name against the full string.

                // Strategy: 
                // A. Split search terms: ["I2", "Calculo"]
                // B. We need a way to search broadly. 
                // Since we don't have a full-text search engine, we'll fetch folders matching ANY term 
                // (or just the first term) and then filter by path.
                // OR, we fetch ALL folders (if dataset is small < 1000) and filter client side.
                // Let's assume 'buscarCarpetas' returns matches for the *folder name*.

                // Better approach for now: Search for the *last* term (likely the specific folder name like "I2")
                // and then verify the path contains the other terms.

                const terms = debouncedTerm.split(' ').filter(t => t.length > 0);
                if (terms.length === 0) return;

                // We search for folders matching ANY of the terms to be safe, 
                // then we'll filter strictly.
                // Actually, let's try searching for the most specific term (usually the last one?)
                // Or just search for folders matching the *input* string?
                // The user said: "I2 Calculo" -> Folder "I2" inside "Calculo".
                // The folder name is "I2". So we should search for "I2".

                // Let's try to find folders that match *any* of the terms, then build context.
                // This might be expensive if we do multiple queries.

                // Optimization: Let's fetch folders that match the *search string* directly first.
                // If that fails, or to support "I2 Calculo", we might need a smarter backend search.
                // Given the constraints, let's use 'buscarCarpetas' with the full string first.

                let initialMatches = await buscarCarpetas(debouncedTerm);

                // If no results, try searching by individual terms (e.g. "I2")
                if (initialMatches.length === 0 && terms.length > 1) {
                    // Try the last term (most specific usually, e.g. "Calculo I2" -> "I2")
                    // Or the first? "I2 Calculo" -> "I2".
                    // Let's try each term and combine results (deduplicated).
                    const promises = terms.map(t => buscarCarpetas(t));
                    const arrays = await Promise.all(promises);
                    const combined = arrays.flat();
                    // Deduplicate by ID
                    initialMatches = Array.from(new Map(combined.map(item => [item.id, item])).values());
                }

                // 2. Resolve Paths & Filter
                const resultsWithPaths = await Promise.all(initialMatches.map(async (folder) => {
                    const path = await obtenerRutaCarpeta(folder.id);
                    return { ...folder, path };
                }));

                // 3. Smart Filter: Check if ALL search terms appear somewhere in the path or folder name
                const filtered = resultsWithPaths.filter(item => {
                    const fullPathString = item.path.map(p => p.nombre).join(' ').toLowerCase();
                    const folderName = item.nombre.toLowerCase();
                    const fullContext = `${fullPathString} ${folderName}`;

                    // Check if every term in the search query exists in the full context
                    const searchTerms = debouncedTerm.toLowerCase().split(' ').filter(t => t.trim());
                    return searchTerms.every(term => fullContext.includes(term));
                });

                setResults(filtered);

            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        search();
    }, [debouncedTerm]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        autoFocus
                        placeholder='Busca tu materia (ej: "I2 Cálculo", "Resúmenes Historia")...'
                        className="flex-1 bg-transparent border-none outline-none text-lg text-gray-900 dark:text-white placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={onCancel}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p className="text-sm">Buscando en los archivos...</p>
                        </div>
                    ) : results.length > 0 ? (
                        results.map((folder) => (
                            <button
                                key={folder.id}
                                onClick={() => onSelect(folder)}
                                className="w-full text-left p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl group transition-all border border-transparent hover:border-purple-100 dark:hover:border-purple-800"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                        <Folder className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                            {folder.nombre}
                                        </h4>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                            {folder.path.map((p, i) => (
                                                <React.Fragment key={p.id}>
                                                    {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                                                    <span>{p.nombre}</span>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-600">
                                        <Check className="w-5 h-5" />
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : searchTerm.length > 1 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Folder className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No encontramos carpetas con esa ruta.</p>
                            <p className="text-xs mt-1">Prueba con palabras clave más generales.</p>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Escribe para buscar carpetas...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FolderSelector;
