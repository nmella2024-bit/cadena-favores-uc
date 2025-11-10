/**
 * Servicio de búsqueda inteligente para archivos y materiales
 * Utiliza normalización avanzada para encontrar coincidencias incluso con errores
 */

import {
  normalizeSearchTerm,
  calculateRelevance,
  matchesAllTokens,
  extractVersionInfo
} from '../utils/searchNormalizer';

/**
 * Busca materiales/archivos con normalización inteligente
 * @param {string} searchTerm - Término de búsqueda del usuario
 * @param {Array} items - Array de items donde buscar
 * @param {Object} options - Opciones de búsqueda
 * @returns {Object} Resultados de búsqueda con metadata
 */
export const smartSearch = (searchTerm, items, options = {}) => {
  const {
    searchFields = ['titulo', 'descripcion', 'ramo', 'carrera', 'tags'],
    minRelevance = 10,
    maxResults = 50,
    includeMetadata = true
  } = options;

  if (!searchTerm || searchTerm.trim().length === 0) {
    return {
      query: '',
      normalized: '',
      results: items.slice(0, maxResults),
      total: items.length,
      suggestions: []
    };
  }

  // Normalizar término de búsqueda
  const normalized = normalizeSearchTerm(searchTerm);

  // Buscar coincidencias
  const matches = [];

  items.forEach(item => {
    let maxScore = 0;
    let bestField = null;
    const fieldScores = {};

    // Evaluar cada campo de búsqueda
    searchFields.forEach(field => {
      if (!item[field]) return;

      const fieldValue = String(item[field]);

      // Calcular relevancia para cada variación del término
      let fieldMaxScore = 0;

      normalized.variations.forEach(variation => {
        // Verificar coincidencia de todos los tokens
        if (matchesAllTokens(variation, fieldValue)) {
          const metadata = {
            isFileName: field === 'titulo' || field === 'archivoUrl',
            extension: item.tipo === 'PDF' ? '.pdf' : item.tipo === 'Enlace' ? null : '.docx'
          };

          const score = calculateRelevance(variation, fieldValue, metadata);

          if (score > fieldMaxScore) {
            fieldMaxScore = score;
          }
        }
      });

      fieldScores[field] = fieldMaxScore;

      if (fieldMaxScore > maxScore) {
        maxScore = fieldMaxScore;
        bestField = field;
      }
    });

    // Si hay coincidencia significativa, agregar a resultados
    if (maxScore >= minRelevance) {
      // Extraer información de versión si es un archivo
      const versionInfo = item.titulo ? extractVersionInfo(item.titulo) : null;

      matches.push({
        item,
        score: maxScore,
        bestField,
        fieldScores,
        versionInfo,
        metadata: includeMetadata ? {
          matchedVariation: normalized.variations.find(v =>
            matchesAllTokens(v, item[bestField])
          ),
          searchTokens: normalized.tokens,
          hasExactMatch: maxScore >= 100
        } : null
      });
    }
  });

  // Ordenar por relevancia (mayor a menor)
  matches.sort((a, b) => {
    // Primero por score
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // Luego por versión (más reciente primero)
    if (a.versionInfo && b.versionInfo) {
      if (a.versionInfo.year && b.versionInfo.year && a.versionInfo.year !== b.versionInfo.year) {
        return b.versionInfo.year - a.versionInfo.year;
      }
      if (a.versionInfo.version && b.versionInfo.version) {
        return b.versionInfo.version - a.versionInfo.version;
      }
      if (a.versionInfo.isFinal !== b.versionInfo.isFinal) {
        return a.versionInfo.isFinal ? -1 : 1;
      }
    }

    // Finalmente por fecha de creación (si existe)
    if (a.item.createdAt && b.item.createdAt) {
      return b.item.createdAt - a.item.createdAt;
    }

    return 0;
  });

  // Limitar resultados
  const results = matches.slice(0, maxResults);

  // Generar sugerencias si hay pocos resultados
  const suggestions = results.length < 3
    ? generateSuggestions(normalized, items, searchFields)
    : [];

  return {
    query: searchTerm,
    normalized: normalized.normalized,
    variations: normalized.variations,
    results: results.map(m => ({
      ...m.item,
      _searchMeta: m.metadata,
      _score: m.score,
      _bestField: m.bestField
    })),
    total: results.length,
    totalScanned: items.length,
    suggestions,
    hasExactMatch: results.some(r => r.score >= 100)
  };
};

/**
 * Genera sugerencias de búsqueda cuando hay pocos resultados
 * @param {Object} normalized - Objeto normalizado de búsqueda
 * @param {Array} items - Todos los items disponibles
 * @param {Array} searchFields - Campos donde buscar
 * @returns {Array} Sugerencias de búsqueda
 */
const generateSuggestions = (normalized, items, searchFields) => {
  const suggestions = new Set();
  const tokens = normalized.tokens;

  if (tokens.length === 0) return [];

  // Buscar items que coincidan parcialmente
  items.forEach(item => {
    searchFields.forEach(field => {
      if (!item[field]) return;

      const fieldValue = String(item[field]);
      const fieldNormalized = normalizeSearchTerm(fieldValue).normalized;

      // Si coincide al menos un token
      const matchingTokens = tokens.filter(t => fieldNormalized.includes(t));

      if (matchingTokens.length > 0 && matchingTokens.length < tokens.length) {
        // Extraer palabras relevantes del campo
        const words = fieldNormalized.split(/\s+/).filter(w => w.length > 2);
        words.slice(0, 3).forEach(word => suggestions.add(word));
      }
    });
  });

  return Array.from(suggestions).slice(0, 5);
};

/**
 * Busca en estructura jerárquica (carreras -> ramos -> evaluaciones -> pautas)
 * @param {string} searchTerm - Término de búsqueda
 * @param {Object} structure - Estructura jerárquica de carpetas
 * @returns {Object} Resultados con ruta completa
 */
export const searchInHierarchy = (searchTerm, structure) => {
  const results = [];
  const normalized = normalizeSearchTerm(searchTerm);

  const traverse = (node, path = []) => {
    if (!node) return;

    // Buscar en el nodo actual
    const nodeName = node.nombre || node.name || '';

    let maxScore = 0;
    normalized.variations.forEach(variation => {
      if (matchesAllTokens(variation, nodeName)) {
        const score = calculateRelevance(variation, nodeName, {
          isFileName: node.tipo === 'archivo'
        });
        maxScore = Math.max(maxScore, score);
      }
    });

    if (maxScore >= 10) {
      results.push({
        path: [...path, nodeName],
        item: node,
        score: maxScore,
        type: node.tipo || 'carpeta',
        fullPath: [...path, nodeName].join(' > ')
      });
    }

    // Buscar en hijos
    if (node.hijos && Array.isArray(node.hijos)) {
      node.hijos.forEach(hijo => {
        traverse(hijo, [...path, nodeName]);
      });
    }

    // Buscar en archivos
    if (node.archivos && Array.isArray(node.archivos)) {
      node.archivos.forEach(archivo => {
        traverse(archivo, [...path, nodeName]);
      });
    }
  };

  // Iniciar búsqueda desde la raíz
  if (Array.isArray(structure)) {
    structure.forEach(root => traverse(root, []));
  } else {
    traverse(structure, []);
  }

  // Ordenar por score
  results.sort((a, b) => b.score - a.score);

  return {
    query: searchTerm,
    normalized: normalized.normalized,
    results: results.slice(0, 50),
    total: results.length
  };
};

/**
 * Formatea resultados de búsqueda para mostrar al usuario
 * @param {Object} searchResults - Resultados de smartSearch
 * @returns {string} Texto formateado para mostrar
 */
export const formatSearchResults = (searchResults) => {
  const { query, normalized, results, total, suggestions } = searchResults;

  let output = '';

  output += `BÚSQUEDA: "${query}"\n`;
  if (normalized !== query) {
    output += `NORMALIZADO: "${normalized}"\n`;
  }
  output += '\n';

  if (results.length === 0) {
    output += 'No se encontraron coincidencias.\n';

    if (suggestions.length > 0) {
      output += '\n¿Quizás buscabas?\n';
      suggestions.forEach((s, i) => {
        output += `  ${i + 1}. ${s}\n`;
      });
    }
  } else {
    output += `RESULTADOS (${total}):\n`;
    output += '─'.repeat(60) + '\n';

    results.slice(0, 10).forEach((result, index) => {
      output += `\n${index + 1}. ${result.titulo || result.nombre}\n`;

      if (result._bestField && result._bestField !== 'titulo') {
        output += `   Campo coincidente: ${result._bestField}\n`;
      }

      if (result.ramo) {
        output += `   Ramo: ${result.ramo}\n`;
      }

      if (result.carrera) {
        output += `   Carrera: ${result.carrera}\n`;
      }

      if (result.tipo) {
        output += `   Tipo: ${result.tipo}\n`;
      }

      if (result._score) {
        output += `   Relevancia: ${result._score.toFixed(0)}\n`;
      }
    });

    if (results.length > 10) {
      output += `\n... y ${results.length - 10} resultados más\n`;
    }
  }

  return output;
};

/**
 * Función de búsqueda rápida (solo verifica coincidencia, sin scoring detallado)
 * @param {string} searchTerm - Término de búsqueda
 * @param {Array} items - Items donde buscar
 * @param {Array} searchFields - Campos donde buscar
 * @returns {Array} Items que coinciden
 */
export const quickSearch = (searchTerm, items, searchFields = ['titulo']) => {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return items;
  }

  const normalized = normalizeSearchTerm(searchTerm);

  return items.filter(item => {
    return searchFields.some(field => {
      if (!item[field]) return false;

      const fieldValue = String(item[field]);

      return normalized.variations.some(variation =>
        matchesAllTokens(variation, fieldValue)
      );
    });
  });
};

export default {
  smartSearch,
  searchInHierarchy,
  formatSearchResults,
  quickSearch
};
