/**
 * Utilidades para normalizar búsquedas de archivos
 * Maneja errores de escritura, equivalencias numéricas y variaciones de formato
 */

/**
 * Mapa de equivalencias entre números arábigos y romanos
 */
const ROMAN_TO_ARABIC = {
  'I': '1',
  'II': '2',
  'III': '3',
  'IV': '4',
  'V': '5',
  'VI': '6',
  'VII': '7',
  'VIII': '8',
  'IX': '9',
  'X': '10',
};

const ARABIC_TO_ROMAN = {
  '1': 'I',
  '2': 'II',
  '3': 'III',
  '4': 'IV',
  '5': 'V',
  '6': 'VI',
  '7': 'VII',
  '8': 'VIII',
  '9': 'IX',
  '10': 'X',
};

/**
 * Errores comunes de teclado y ortográficos
 */
const KEYBOARD_CORRECTIONS = {
  'ano': 'año',
  'nino': 'niño',
  'espanol': 'español',
  'ayudanta': 'ayudantia',
  'solucin': 'solucion',
  'ejecicio': 'ejercicio',
  'ejecicios': 'ejercicios',
  'prueva': 'prueba',
  'pruevas': 'pruebas',
};

/**
 * Normaliza un texto removiendo acentos, mayúsculas y caracteres especiales
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
export const normalizeText = (text) => {
  if (!text) return '';

  return text
    .toLowerCase()
    .normalize('NFD') // Descomponer caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (tildes)
    .replace(/[^\w\s]/g, ' ') // Reemplazar caracteres especiales por espacios
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
    .trim();
};

/**
 * Remueve duplicación accidental de caracteres
 * @param {string} text - Texto con posibles duplicaciones
 * @returns {string} Texto sin duplicaciones
 */
export const removeDuplicateChars = (text) => {
  return text.replace(/(.)\1{2,}/g, '$1$1'); // Mantener máximo 2 repeticiones
};

/**
 * Corrige errores comunes de teclado
 * @param {string} text - Texto a corregir
 * @returns {string} Texto corregido
 */
export const correctKeyboardErrors = (text) => {
  let corrected = text;
  Object.entries(KEYBOARD_CORRECTIONS).forEach(([error, correction]) => {
    const regex = new RegExp(error, 'gi');
    corrected = corrected.replace(regex, correction);
  });
  return corrected;
};

/**
 * Convierte números romanos a arábigos en un texto
 * @param {string} text - Texto con posibles números romanos
 * @returns {string} Texto con números arábigos
 */
export const romanToArabic = (text) => {
  let result = text;

  // Buscar patrones de números romanos (con o sin separadores)
  Object.entries(ROMAN_TO_ARABIC).forEach(([roman, arabic]) => {
    const patterns = [
      new RegExp(`\\b${roman}\\b`, 'gi'),           // "II"
      new RegExp(`[-_\\.\\s]${roman}\\b`, 'gi'),   // "-II", "_II", ".II", " II"
      new RegExp(`\\b${roman}[-_\\.\\s]`, 'gi'),   // "II-", "II_", "II.", "II "
    ];

    patterns.forEach(pattern => {
      result = result.replace(pattern, (match) => {
        // Preservar el separador si existe
        const prefix = match.match(/^[-_\.\s]/)?.[0] || '';
        const suffix = match.match(/[-_\.\s]$/)?.[0] || '';
        return prefix + arabic + suffix;
      });
    });
  });

  return result;
};

/**
 * Convierte números arábigos a romanos en un texto
 * @param {string} text - Texto con números arábigos
 * @returns {string} Texto con números romanos
 */
export const arabicToRoman = (text) => {
  let result = text;

  Object.entries(ARABIC_TO_ROMAN).forEach(([arabic, roman]) => {
    const patterns = [
      new RegExp(`\\b${arabic}\\b`, 'g'),         // "2"
      new RegExp(`[-_\\.\\s]${arabic}\\b`, 'g'), // "-2", "_2", ".2", " 2"
      new RegExp(`\\b${arabic}[-_\\.\\s]`, 'g'), // "2-", "2_", "2.", "2 "
    ];

    patterns.forEach(pattern => {
      result = result.replace(pattern, (match) => {
        const prefix = match.match(/^[-_\.\s]/)?.[0] || '';
        const suffix = match.match(/[-_\.\s]$/)?.[0] || '';
        return prefix + roman + suffix;
      });
    });
  });

  return result;
};

/**
 * Remueve ceros a la izquierda de códigos (ej: MAT001 -> MAT1)
 * @param {string} text - Texto con posibles ceros a la izquierda
 * @returns {string} Texto sin ceros a la izquierda
 */
export const removeLeadingZeros = (text) => {
  return text.replace(/(\D)0+(\d+)/g, '$1$2');
};

/**
 * Genera variaciones de un término de búsqueda
 * @param {string} searchTerm - Término de búsqueda original
 * @returns {Array<string>} Array de variaciones normalizadas
 */
export const generateSearchVariations = (searchTerm) => {
  if (!searchTerm) return [];

  const variations = new Set();

  // Original
  variations.add(searchTerm);

  // Normalizado básico
  const normalized = normalizeText(searchTerm);
  variations.add(normalized);

  // Sin duplicaciones
  variations.add(removeDuplicateChars(normalized));

  // Con correcciones de teclado
  const corrected = correctKeyboardErrors(normalized);
  variations.add(corrected);

  // Romano a arábigo
  const withArabic = romanToArabic(corrected);
  variations.add(withArabic);

  // Arábigo a romano
  const withRoman = arabicToRoman(corrected);
  variations.add(withRoman);

  // Sin ceros a la izquierda
  variations.add(removeLeadingZeros(withArabic));

  // Sin espacios (para búsquedas como "algebralineal")
  variations.add(corrected.replace(/\s+/g, ''));

  // Con espacios adicionales entre palabras y números
  variations.add(corrected.replace(/(\d)([a-z])/gi, '$1 $2'));
  variations.add(corrected.replace(/([a-z])(\d)/gi, '$1 $2'));

  // Variaciones de formato común
  const spacedVersion = corrected.replace(/[-_\.]/g, ' ');
  variations.add(spacedVersion);
  variations.add(spacedVersion.replace(/\s+/g, ''));

  // Filtrar strings vacíos y convertir a array
  return Array.from(variations).filter(v => v && v.length > 0);
};

/**
 * Calcula similitud entre dos strings usando distancia de Levenshtein simplificada
 * @param {string} str1 - Primer string
 * @param {string} str2 - Segundo string
 * @returns {number} Puntuación de similitud (0-1)
 */
export const calculateSimilarity = (str1, str2) => {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Coincidencia exacta de palabras
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const matchingWords = words1.filter(w => words2.includes(w)).length;
  const wordSimilarity = matchingWords / Math.max(words1.length, words2.length);

  // Coincidencia de substring
  const substringMatch = s2.includes(s1) || s1.includes(s2) ? 0.5 : 0;

  // Coincidencia de caracteres comunes
  const chars1 = new Set(s1.split(''));
  const chars2 = new Set(s2.split(''));
  const commonChars = [...chars1].filter(c => chars2.has(c)).length;
  const charSimilarity = commonChars / Math.max(chars1.size, chars2.size);

  // Ponderación: palabras > substring > caracteres
  return (wordSimilarity * 0.6) + (substringMatch * 0.3) + (charSimilarity * 0.1);
};

/**
 * Tokeniza un término de búsqueda en palabras y números
 * @param {string} text - Texto a tokenizar
 * @returns {Array<string>} Tokens normalizados
 */
export const tokenize = (text) => {
  const normalized = normalizeText(text);
  return normalized.split(/\s+/).filter(token => token.length > 0);
};

/**
 * Verifica si todos los tokens de búsqueda están presentes en el texto objetivo
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} targetText - Texto donde buscar
 * @returns {boolean} true si todos los tokens coinciden
 */
export const matchesAllTokens = (searchTerm, targetText) => {
  const searchTokens = tokenize(searchTerm);
  const targetNormalized = normalizeText(targetText);

  return searchTokens.every(token => targetNormalized.includes(token));
};

/**
 * Calcula puntuación de relevancia de una coincidencia
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} targetText - Texto objetivo
 * @param {Object} metadata - Metadata adicional (ruta, tipo de archivo, etc)
 * @returns {number} Puntuación de relevancia (mayor = más relevante)
 */
export const calculateRelevance = (searchTerm, targetText, metadata = {}) => {
  let score = 0;

  const searchNormalized = normalizeText(searchTerm);
  const targetNormalized = normalizeText(targetText);

  // Coincidencia exacta (máxima prioridad)
  if (targetNormalized === searchNormalized) {
    score += 100;
  }

  // Coincidencia exacta de palabras completas
  const searchWords = searchNormalized.split(/\s+/);
  const targetWords = targetNormalized.split(/\s+/);
  const exactWordMatches = searchWords.filter(w => targetWords.includes(w)).length;
  score += exactWordMatches * 20;

  // Coincidencia de substring
  if (targetNormalized.includes(searchNormalized)) {
    score += 50;
  }

  // Similitud general
  score += calculateSimilarity(searchNormalized, targetNormalized) * 30;

  // Bonus por coincidencia en nombre de archivo vs carpeta
  if (metadata.isFileName) {
    score += 10;
  }

  // Bonus por extensión común
  if (metadata.extension && ['.pdf', '.docx', '.xlsx'].includes(metadata.extension)) {
    score += 5;
  }

  // Penalización por archivos muy genéricos
  if (/^(scan|imagen|foto|archivo|documento)\d+/i.test(targetText)) {
    score -= 20;
  }

  return score;
};

/**
 * Función principal de normalización para búsqueda
 * @param {string} searchTerm - Término de búsqueda del usuario
 * @returns {Object} Objeto con término normalizado y variaciones
 */
export const normalizeSearchTerm = (searchTerm) => {
  if (!searchTerm) {
    return {
      original: '',
      normalized: '',
      variations: [],
      tokens: []
    };
  }

  // Aplicar todas las normalizaciones en orden
  let normalized = searchTerm;
  normalized = correctKeyboardErrors(normalized);
  normalized = removeDuplicateChars(normalized);
  normalized = normalizeText(normalized);
  normalized = romanToArabic(normalized);
  normalized = removeLeadingZeros(normalized);

  return {
    original: searchTerm,
    normalized: normalized,
    variations: generateSearchVariations(searchTerm),
    tokens: tokenize(normalized)
  };
};

/**
 * Extrae información de versión de un nombre de archivo
 * @param {string} filename - Nombre del archivo
 * @returns {Object} Información de versión
 */
export const extractVersionInfo = (filename) => {
  const versionPatterns = {
    v: /v(\d+)/i,
    version: /version\s*(\d+)/i,
    final: /final/i,
    definitivo: /definitivo/i,
    revision: /revision\s*(\d+)/i,
    semestre: /(C[12])\s*(\d{4})/i,
  };

  const info = {
    hasVersion: false,
    version: null,
    isFinal: false,
    semester: null,
    year: null
  };

  Object.entries(versionPatterns).forEach(([key, pattern]) => {
    const match = filename.match(pattern);
    if (match) {
      info.hasVersion = true;

      if (key === 'v' || key === 'version' || key === 'revision') {
        info.version = parseInt(match[1]);
      } else if (key === 'final' || key === 'definitivo') {
        info.isFinal = true;
      } else if (key === 'semestre') {
        info.semester = match[1];
        info.year = parseInt(match[2]);
      }
    }
  });

  return info;
};

export default {
  normalizeText,
  normalizeSearchTerm,
  generateSearchVariations,
  calculateSimilarity,
  calculateRelevance,
  matchesAllTokens,
  tokenize,
  extractVersionInfo,
  romanToArabic,
  arabicToRoman,
  removeLeadingZeros,
  correctKeyboardErrors,
  removeDuplicateChars
};
