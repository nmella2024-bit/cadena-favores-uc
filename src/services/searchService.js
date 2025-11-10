import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
  normalizeSearchTerm,
  generateSearchVariations,
  calculateRelevance,
  matchesAllTokens,
  normalizeText
} from '../utils/searchNormalizer';

/**
 * Verifica si un texto coincide con el término de búsqueda usando variaciones normalizadas
 * @param {string} text - Texto donde buscar
 * @param {Object} searchData - Datos normalizados de búsqueda
 * @returns {boolean} True si hay coincidencia
 */
const matchesSearch = (text, searchData) => {
  if (!text || !searchData || !searchData.variations) return false;

  const normalizedText = normalizeText(text);

  // Verificar con cada variación
  for (const variation of searchData.variations) {
    if (matchesAllTokens(variation, normalizedText)) {
      return true;
    }
  }

  return false;
};

/**
 * Calcula score de relevancia para un resultado
 * @param {string} text - Texto a evaluar
 * @param {Object} searchData - Datos de búsqueda
 * @param {Object} metadata - Metadata adicional
 * @returns {number} Score de relevancia
 */
const calculateScore = (text, searchData, metadata = {}) => {
  if (!text || !searchData || !searchData.variations) return 0;

  let maxScore = 0;

  // Calcular score contra cada variación y tomar el máximo
  for (const variation of searchData.variations) {
    const score = calculateRelevance(variation, text, metadata);
    if (score > maxScore) {
      maxScore = score;
    }
  }

  return maxScore;
};

/**
 * Busca en múltiples colecciones de Firestore
 * @param {string} searchTerm - Término de búsqueda
 * @param {Object} options - Opciones de búsqueda
 * @param {Array<string>} options.collections - Colecciones donde buscar (default: todas)
 * @param {number} options.limitPerCollection - Límite de resultados por colección (default: 10)
 * @returns {Promise<Object>} Resultados agrupados por tipo
 */
export const buscarGlobal = async (searchTerm, options = {}) => {
  try {
    console.log('[buscarGlobal] Función llamada con término:', searchTerm);

    const {
      collections = ['favores', 'anuncios', 'marketplace', 'material', 'usuarios'],
      limitPerCollection = 10
    } = options;

    console.log('[buscarGlobal] Colecciones a buscar:', collections);
    console.log('[buscarGlobal] Límite por colección:', limitPerCollection);

    if (!searchTerm || searchTerm.trim().length < 2) {
      console.log('[buscarGlobal] Término muy corto, retornando vacío');
      return {
        favores: [],
        anuncios: [],
        marketplace: [],
        material: [],
        usuarios: [],
        total: 0
      };
    }

    // Normalizar término de búsqueda
    const searchData = normalizeSearchTerm(searchTerm);
    console.log('[buscarGlobal] Búsqueda normalizada:', searchData);

    const results = {
      favores: [],
      anuncios: [],
      marketplace: [],
      material: [],
      usuarios: [],
      total: 0
    };

    // Búsqueda en Favores
    if (collections.includes('favores')) {
      try {
        const favoresRef = collection(db, 'favores');
        const favoresSnapshot = await getDocs(query(favoresRef, limit(100)));

        favoresSnapshot.forEach(doc => {
          const data = doc.data();
          const searchableText = `${data.titulo} ${data.descripcion} ${data.categoria} ${data.nombreUsuario}`;

          if (matchesSearch(searchableText, searchData)) {
            const score = calculateScore(searchableText, searchData);
            results.favores.push({
              id: doc.id,
              type: 'favor',
              ...data,
              _searchScore: score
            });
          }
        });

        // Ordenar por relevancia y limitar
        results.favores.sort((a, b) => b._searchScore - a._searchScore);
        results.favores = results.favores.slice(0, limitPerCollection);
      } catch (error) {
        console.error('Error buscando en favores:', error);
      }
    }

    // Búsqueda en Anuncios
    if (collections.includes('anuncios')) {
      try {
        const anunciosRef = collection(db, 'anuncios');
        const anunciosSnapshot = await getDocs(query(anunciosRef, limit(100)));

        anunciosSnapshot.forEach(doc => {
          const data = doc.data();
          const searchableText = `${data.titulo} ${data.descripcion} ${data.autorNombre}`;

          if (matchesSearch(searchableText, searchData)) {
            const score = calculateScore(searchableText, searchData);
            results.anuncios.push({
              id: doc.id,
              type: 'anuncio',
              ...data,
              _searchScore: score
            });
          }
        });

        results.anuncios.sort((a, b) => b._searchScore - a._searchScore);
        results.anuncios = results.anuncios.slice(0, limitPerCollection);
      } catch (error) {
        console.error('Error buscando en anuncios:', error);
      }
    }

    // Búsqueda en Marketplace
    if (collections.includes('marketplace')) {
      try {
        const marketplaceRef = collection(db, 'marketplace');
        const marketplaceSnapshot = await getDocs(query(marketplaceRef, limit(100)));

        marketplaceSnapshot.forEach(doc => {
          const data = doc.data();
          const searchableText = `${data.titulo} ${data.descripcion} ${data.autorNombre}`;

          if (matchesSearch(searchableText, searchData)) {
            const score = calculateScore(searchableText, searchData);
            results.marketplace.push({
              id: doc.id,
              type: 'marketplace',
              ...data,
              _searchScore: score
            });
          }
        });

        results.marketplace.sort((a, b) => b._searchScore - a._searchScore);
        results.marketplace = results.marketplace.slice(0, limitPerCollection);
      } catch (error) {
        console.error('Error buscando en marketplace:', error);
      }
    }

    // Búsqueda en Material (incluye búsqueda por carpetas)
    if (collections.includes('material')) {
      try {
        console.log('[Search] Iniciando búsqueda en materiales...');

        // 1. Cargar materiales primero (más rápido)
        const materialRef = collection(db, 'material');
        const materialSnapshot = await getDocs(query(materialRef, limit(300)));
        console.log(`[Search] Materiales cargados: ${materialSnapshot.size}`);

        if (materialSnapshot.empty) {
          console.log('[Search] No hay materiales en la base de datos');
          results.material = [];
        } else {

        // 2. Cargar solo las carpetas necesarias
        const foldersRef = collection(db, 'folders');
        const foldersSnapshot = await getDocs(foldersRef);
        console.log(`[Search] Carpetas cargadas: ${foldersSnapshot.size}`);

        const folderMap = new Map();

        // Crear mapa de carpetas
        foldersSnapshot.forEach(doc => {
          const folderData = doc.data();
          folderMap.set(doc.id, {
            id: doc.id,
            nombre: folderData.nombre || '',
            carpetaPadreId: folderData.carpetaPadreId || null,
            ...folderData
          });
        });

        // Función para construir la ruta completa de una carpeta
        const buildFolderPath = (folderId) => {
          if (!folderId) return '';

          const path = [];
          let currentId = folderId;
          let depth = 0;
          const maxDepth = 20; // Prevenir loops infinitos

          while (currentId && depth < maxDepth) {
            const folder = folderMap.get(currentId);
            if (!folder) break;
            path.unshift(folder.nombre);
            currentId = folder.carpetaPadreId;
            depth++;
          }

          return path.join(' / ');
        };

        // 3. Buscar en materiales
        const materialesEncontrados = [];

        materialSnapshot.forEach(doc => {
          const data = doc.data();

          const titulo = data.titulo || '';
          const descripcion = data.descripcion || '';
          const carrera = data.carrera || '';
          const ramo = data.ramo || '';
          const autorNombre = data.autorNombre || '';
          const tags = Array.isArray(data.tags) ? data.tags.join(' ') : '';

          // Texto de búsqueda del material
          const searchableText = `${titulo} ${descripcion} ${carrera} ${ramo} ${autorNombre} ${tags}`;

          // Construir ruta de carpeta
          let folderPath = '';
          if (data.carpetaId && folderMap.has(data.carpetaId)) {
            folderPath = buildFolderPath(data.carpetaId);
          }

          // Verificar coincidencia
          const matchesMaterial = matchesSearch(searchableText, searchData);
          const matchesFolder = folderPath && matchesSearch(folderPath, searchData);

          if (matchesMaterial || matchesFolder) {
            // Calcular score
            let score = 0;
            if (matchesMaterial) {
              score = calculateScore(searchableText, searchData, { isFileName: true });
            }
            if (matchesFolder) {
              const folderScore = calculateScore(folderPath, searchData) * 0.7; // Carpetas tienen menos peso
              score = Math.max(score, folderScore);
            }

            // Obtener información de la carpeta
            let folderInfo = null;
            if (data.carpetaId && folderMap.has(data.carpetaId)) {
              const folder = folderMap.get(data.carpetaId);
              folderInfo = {
                nombre: folder.nombre,
                rutaCompleta: folderPath
              };
            }

            materialesEncontrados.push({
              id: doc.id,
              type: 'material',
              ...data,
              carpetaInfo: folderInfo,
              matchType: matchesMaterial ? 'material' : 'folder',
              _searchScore: score
            });
          }
        });

        console.log(`[Search] Materiales encontrados: ${materialesEncontrados.length}`);

        // Ordenar por score (fijados primero, luego por relevancia)
        materialesEncontrados.sort((a, b) => {
          if (a.fijado && !b.fijado) return -1;
          if (!a.fijado && b.fijado) return 1;
          return b._searchScore - a._searchScore;
        });

        results.material = materialesEncontrados.slice(0, limitPerCollection);
        console.log(`[Search] Resultados finales: ${results.material.length}`);
        }
      } catch (error) {
        console.error('[Search] Error buscando en material:', error);
        results.material = [];
      }
    }

    // Búsqueda en Usuarios
    if (collections.includes('usuarios')) {
      try {
        const usuariosRef = collection(db, 'usuarios');
        const usuariosSnapshot = await getDocs(query(usuariosRef, limit(100)));

        usuariosSnapshot.forEach(doc => {
          const data = doc.data();
          const searchableText = `${data.nombre} ${data.email} ${data.carrera}`;

          if (matchesSearch(searchableText, searchData)) {
            const score = calculateScore(searchableText, searchData);
            results.usuarios.push({
              id: doc.id,
              type: 'usuario',
              ...data,
              _searchScore: score
            });
          }
        });

        results.usuarios.sort((a, b) => b._searchScore - a._searchScore);
        results.usuarios = results.usuarios.slice(0, limitPerCollection);
      } catch (error) {
        console.error('Error buscando en usuarios:', error);
      }
    }

    // Calcular total
    results.total =
      results.favores.length +
      results.anuncios.length +
      results.marketplace.length +
      results.material.length +
      results.usuarios.length;

    console.log('[buscarGlobal] Resultados finales:', {
      favores: results.favores.length,
      anuncios: results.anuncios.length,
      marketplace: results.marketplace.length,
      material: results.material.length,
      usuarios: results.usuarios.length,
      total: results.total
    });

    return results;

  } catch (error) {
    console.error('[buscarGlobal] Error en búsqueda global:', error);
    throw error;
  }
};

/**
 * Busca solo en una colección específica
 * @param {string} collection - Nombre de la colección
 * @param {string} searchTerm - Término de búsqueda
 * @param {number} limitResults - Límite de resultados (default: 20)
 * @returns {Promise<Array>} Resultados de la búsqueda
 */
export const buscarEnColeccion = async (collection, searchTerm, limitResults = 20) => {
  try {
    const results = await buscarGlobal(searchTerm, {
      collections: [collection],
      limitPerCollection: limitResults
    });

    return results[collection] || [];
  } catch (error) {
    console.error(`Error buscando en ${collection}:`, error);
    throw error;
  }
};

/**
 * Extrae información de año, semestre y evaluación del título
 * @param {string} titulo - Título del material
 * @returns {Object} Información extraída
 */
const extraerInfoOrdenamiento = (titulo) => {
  const tituloLower = (titulo || '').toLowerCase();

  // Extraer año (2024, 2023, etc.)
  const matchAnio = titulo.match(/\b(20\d{2})\b/);
  const anio = matchAnio ? parseInt(matchAnio[1]) : 0;

  // Extraer semestre (C1, C2, TAV)
  let semestreOrden = 0;
  if (/\bc1\b|primer\s*semestre|semestre\s*1/i.test(tituloLower)) {
    semestreOrden = 1;
  } else if (/\bc2\b|segundo\s*semestre|semestre\s*2/i.test(tituloLower)) {
    semestreOrden = 2;
  } else if (/\btav\b|verano/i.test(tituloLower)) {
    semestreOrden = 3;
  }

  // Extraer número de evaluación (I1, I2, I3, C1, C2, etc.)
  let numeroEvaluacion = 0;
  const matchEval = titulo.match(/\b[IiCc](\d+)\b/);
  if (matchEval) {
    numeroEvaluacion = parseInt(matchEval[1]);
  }

  // Tipo de evaluación (prioridad para ordenar)
  let tipoEvaluacion = 0;
  if (/\bexamen\b|\bfinal\b/i.test(tituloLower)) {
    tipoEvaluacion = 100;
  } else if (/\bi\d+\b/i.test(tituloLower)) { // I1, I2, I3
    tipoEvaluacion = 90;
  } else if (/\bc\d+\b/i.test(tituloLower)) { // C1, C2, C3
    tipoEvaluacion = 80;
  } else if (/\bpauta\b|\bsolucion\b/i.test(tituloLower)) {
    tipoEvaluacion = 70;
  }

  return {
    anio,
    semestreOrden,
    numeroEvaluacion,
    tipoEvaluacion
  };
};

/**
 * Obtiene IDs de carpeta actual y todas sus subcarpetas recursivamente
 * @param {string} carpetaId - ID de la carpeta padre
 * @param {Map} folderMap - Mapa de carpetas
 * @returns {Set} Set con IDs de carpeta y subcarpetas
 */
const obtenerCarpetasYSubcarpetas = (carpetaId, folderMap) => {
  const carpetasIds = new Set();

  if (!carpetaId) return carpetasIds;

  carpetasIds.add(carpetaId);

  // Buscar subcarpetas recursivamente
  const buscarSubcarpetas = (padreId) => {
    for (const [id, folder] of folderMap.entries()) {
      if (folder.carpetaPadreId === padreId && !carpetasIds.has(id)) {
        carpetasIds.add(id);
        buscarSubcarpetas(id); // Recursivo
      }
    }
  };

  buscarSubcarpetas(carpetaId);

  return carpetasIds;
};

/**
 * Busca en materiales y carpetas (para la página Material.jsx)
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} carpetaId - ID de la carpeta actual (null para raíz o 'all' para buscar en todas)
 * @param {number} limitResults - Límite de resultados (default: 100)
 * @returns {Promise<Object>} Objeto con carpetas y materiales encontrados
 */
export const buscarEnMateriales = async (searchTerm, carpetaId = null, limitResults = 100) => {
  try {
    console.log('[buscarEnMateriales] Iniciando búsqueda...');
    console.log('[buscarEnMateriales] Término:', searchTerm);
    console.log('[buscarEnMateriales] CarpetaId:', carpetaId);

    if (!searchTerm || searchTerm.trim().length < 2) {
      console.log('[buscarEnMateriales] Término muy corto');
      return { carpetas: [], materiales: [] };
    }

    // Normalizar término de búsqueda
    const searchData = normalizeSearchTerm(searchTerm);
    console.log('[buscarEnMateriales] Búsqueda normalizada:', searchData);

    // 1. Cargar todas las carpetas primero (para obtener subcarpetas)
    const foldersRef = collection(db, 'folders');
    const foldersSnapshot = await getDocs(foldersRef);
    console.log(`[buscarEnMateriales] Carpetas cargadas: ${foldersSnapshot.size}`);

    const folderMap = new Map();

    // Crear mapa de carpetas
    foldersSnapshot.forEach(doc => {
      const folderData = doc.data();
      folderMap.set(doc.id, {
        id: doc.id,
        nombre: folderData.nombre || '',
        carpetaPadreId: folderData.carpetaPadreId || null,
        ...folderData
      });
    });

    // 2. Obtener IDs de carpeta actual y subcarpetas
    let carpetasPermitidas = null;
    if (carpetaId && carpetaId !== 'all') {
      carpetasPermitidas = obtenerCarpetasYSubcarpetas(carpetaId, folderMap);
      console.log(`[buscarEnMateriales] Buscando en carpeta y ${carpetasPermitidas.size - 1} subcarpetas`);
    }

    // 3. Cargar materiales (sin filtro de carpeta en query para no necesitar índice)
    const materialRef = collection(db, 'material');
    const materialSnapshot = await getDocs(query(materialRef, limit(300)));
    console.log(`[buscarEnMateriales] Materiales cargados: ${materialSnapshot.size}`);

    if (materialSnapshot.empty) {
      console.log('[buscarEnMateriales] No hay materiales');
    }

    // 4. Función para construir la ruta completa de una carpeta
    const buildFolderPath = (folderId) => {
      if (!folderId) return '';

      const path = [];
      let currentId = folderId;
      let depth = 0;
      const maxDepth = 20;

      while (currentId && depth < maxDepth) {
        const folder = folderMap.get(currentId);
        if (!folder) break;
        path.unshift(folder.nombre);
        currentId = folder.carpetaPadreId;
        depth++;
      }

      return path.join(' / ');
    };

    // 5. Buscar carpetas que coincidan
    const carpetasEncontradas = [];

    folderMap.forEach((folder, folderId) => {
      // Filtrar por carpeta padre si es necesario
      if (carpetasPermitidas && !carpetasPermitidas.has(folderId)) {
        return; // Skip carpetas que no están en el contexto actual
      }

      const nombreCarpeta = folder.nombre || '';
      const rutaCarpeta = buildFolderPath(folderId);

      // Verificar coincidencia
      const matchesNombre = matchesSearch(nombreCarpeta, searchData);
      const matchesRuta = matchesSearch(rutaCarpeta, searchData);

      if (matchesNombre || matchesRuta) {
        let score = 0;
        if (matchesNombre) {
          score = calculateScore(nombreCarpeta, searchData, { isFileName: false });
        }
        if (matchesRuta) {
          const rutaScore = calculateScore(rutaCarpeta, searchData) * 0.5;
          score = Math.max(score, rutaScore);
        }

        carpetasEncontradas.push({
          id: folderId,
          type: 'carpeta',
          nombre: nombreCarpeta,
          carpetaPadreId: folder.carpetaPadreId,
          rutaCompleta: rutaCarpeta,
          _searchScore: score
        });
      }
    });

    console.log(`[buscarEnMateriales] Carpetas encontradas: ${carpetasEncontradas.length}`);

    // 6. Buscar en materiales
    const materialesEncontrados = [];

    materialSnapshot.forEach(doc => {
      const data = doc.data();

      // Filtrar por carpeta si es necesario
      if (carpetasPermitidas && data.carpetaId) {
        if (!carpetasPermitidas.has(data.carpetaId)) {
          return; // Skip este material, no está en la carpeta actual ni subcarpetas
        }
      } else if (carpetasPermitidas && !data.carpetaId) {
        return; // Skip materiales sin carpeta si estamos filtrando por carpeta
      }

      // Búsqueda en campos del material
      const titulo = data.titulo || '';
      const descripcion = data.descripcion || '';
      const carrera = data.carrera || '';
      const ramo = data.ramo || '';
      const autorNombre = data.autorNombre || '';
      const tags = Array.isArray(data.tags) ? data.tags.join(' ') : '';

      // Texto de búsqueda del material
      const searchableText = `${titulo} ${descripcion} ${carrera} ${ramo} ${autorNombre} ${tags}`;

      // Ruta de carpeta
      let folderPath = '';
      if (data.carpetaId && folderMap.has(data.carpetaId)) {
        folderPath = buildFolderPath(data.carpetaId);
      }

      // Verificar coincidencia
      const matchesMaterial = matchesSearch(searchableText, searchData);
      const matchesFolder = folderPath && matchesSearch(folderPath, searchData);

      if (matchesMaterial || matchesFolder) {
        // Calcular score
        let score = 0;
        if (matchesMaterial) {
          score = calculateScore(searchableText, searchData, { isFileName: true });
        }
        if (matchesFolder) {
          const folderScore = calculateScore(folderPath, searchData) * 0.7;
          score = Math.max(score, folderScore);
        }

        // Obtener información de la carpeta
        let folderInfo = null;
        if (data.carpetaId && folderMap.has(data.carpetaId)) {
          const folder = folderMap.get(data.carpetaId);
          folderInfo = {
            nombre: folder.nombre,
            rutaCompleta: folderPath
          };
        }

        materialesEncontrados.push({
          id: doc.id,
          ...data,
          carpetaInfo: folderInfo,
          matchType: matchesMaterial ? 'material' : 'folder',
          _searchScore: score
        });
      }
    });

    console.log(`[buscarEnMateriales] Materiales encontrados: ${materialesEncontrados.length}`);

    // Ordenar carpetas por score
    carpetasEncontradas.sort((a, b) => b._searchScore - a._searchScore);

    // Ordenar materiales por múltiples criterios
    materialesEncontrados.sort((a, b) => {
      // 1. Fijados primero
      if (a.fijado && !b.fijado) return -1;
      if (!a.fijado && b.fijado) return 1;

      // Extraer información de ordenamiento
      const infoA = extraerInfoOrdenamiento(a.titulo);
      const infoB = extraerInfoOrdenamiento(b.titulo);

      // 2. Por año (descendente - más reciente primero)
      if (infoA.anio !== infoB.anio) {
        return infoB.anio - infoA.anio;
      }

      // 3. Por semestre (C1=1, C2=2, TAV=3)
      if (infoA.semestreOrden !== infoB.semestreOrden) {
        return infoA.semestreOrden - infoB.semestreOrden;
      }

      // 4. Por tipo de evaluación (examen > I > C > pauta)
      if (infoA.tipoEvaluacion !== infoB.tipoEvaluacion) {
        return infoB.tipoEvaluacion - infoA.tipoEvaluacion;
      }

      // 5. Por número de evaluación (I1, I2, I3)
      if (infoA.numeroEvaluacion !== infoB.numeroEvaluacion) {
        return infoA.numeroEvaluacion - infoB.numeroEvaluacion;
      }

      // 6. Por score de búsqueda
      if (a._searchScore !== b._searchScore) {
        return b._searchScore - a._searchScore;
      }

      // 7. Por fecha de subida como último criterio
      return new Date(b.fechaSubida) - new Date(a.fechaSubida);
    });

    const resultadosCarpetas = carpetasEncontradas.slice(0, Math.min(10, limitResults));
    const resultadosMateriales = materialesEncontrados.slice(0, limitResults);

    console.log(`[buscarEnMateriales] Resultados finales: ${resultadosCarpetas.length} carpetas, ${resultadosMateriales.length} materiales`);

    return {
      carpetas: resultadosCarpetas,
      materiales: resultadosMateriales
    };
  } catch (error) {
    console.error('[buscarEnMateriales] Error en búsqueda:', error);
    // Siempre devolver estructura válida en caso de error
    return {
      carpetas: [],
      materiales: []
    };
  }
};

/**
 * Obtiene sugerencias de búsqueda basadas en el término
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Array de sugerencias
 */
export const obtenerSugerencias = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    // Buscar en todas las colecciones con límite reducido
    const results = await buscarGlobal(searchTerm, {
      collections: ['favores', 'anuncios', 'marketplace', 'material'],
      limitPerCollection: 3
    });

    // Crear sugerencias únicas
    const sugerencias = [];

    // Agregar títulos de resultados encontrados
    results.favores.forEach(item => {
      if (sugerencias.length < 10) {
        sugerencias.push({
          texto: item.titulo,
          tipo: 'favor',
          id: item.id
        });
      }
    });

    results.anuncios.forEach(item => {
      if (sugerencias.length < 10) {
        sugerencias.push({
          texto: item.titulo,
          tipo: 'anuncio',
          id: item.id
        });
      }
    });

    results.marketplace.forEach(item => {
      if (sugerencias.length < 10) {
        sugerencias.push({
          texto: item.titulo,
          tipo: 'marketplace',
          id: item.id
        });
      }
    });

    results.material.forEach(item => {
      if (sugerencias.length < 10) {
        sugerencias.push({
          texto: item.titulo,
          tipo: 'material',
          id: item.id
        });
      }
    });

    return sugerencias;
  } catch (error) {
    console.error('Error obteniendo sugerencias:', error);
    return [];
  }
};
