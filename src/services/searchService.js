import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Normaliza un texto: elimina tildes y convierte a minúsculas
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres con tildes
    .replace(/[\u0300-\u036f]/g, ''); // Elimina las marcas diacríticas (tildes)
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

    const searchNormalized = normalizeText(searchTerm.trim());
    console.log('[buscarGlobal] Término procesado:', searchNormalized);
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
          const searchableText = normalizeText(`${data.titulo} ${data.descripcion} ${data.categoria} ${data.nombreUsuario}`);

          if (searchableText.includes(searchNormalized)) {
            results.favores.push({
              id: doc.id,
              type: 'favor',
              ...data
            });
          }
        });

        // Limitar resultados
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
          const searchableText = normalizeText(`${data.titulo} ${data.descripcion} ${data.autorNombre}`);

          if (searchableText.includes(searchNormalized)) {
            results.anuncios.push({
              id: doc.id,
              type: 'anuncio',
              ...data
            });
          }
        });

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
          const searchableText = normalizeText(`${data.titulo} ${data.descripcion} ${data.autorNombre}`);

          if (searchableText.includes(searchNormalized)) {
            results.marketplace.push({
              id: doc.id,
              type: 'marketplace',
              ...data
            });
          }
        });

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

          // Búsqueda en campos del material
          const titulo = data.titulo || '';
          const descripcion = data.descripcion || '';
          const carrera = data.carrera || '';
          const ramo = data.ramo || '';
          const autorNombre = data.autorNombre || '';

          const searchableText = normalizeText(`${titulo} ${descripcion} ${carrera} ${ramo} ${autorNombre}`);
          const matchesMaterial = searchableText.includes(searchNormalized);

          // Búsqueda por ruta de carpeta
          let matchesFolder = false;
          let folderPath = '';

          if (data.carpetaId && folderMap.has(data.carpetaId)) {
            folderPath = buildFolderPath(data.carpetaId);
            matchesFolder = normalizeText(folderPath).includes(searchNormalized);
          }

          if (matchesMaterial || matchesFolder) {
            // Obtener información de la carpeta
            let folderInfo = null;
            if (data.carpetaId && folderMap.has(data.carpetaId)) {
              const folder = folderMap.get(data.carpetaId);
              folderInfo = {
                nombre: folder.nombre,
                rutaCompleta: folderPath || buildFolderPath(data.carpetaId)
              };
            }

            materialesEncontrados.push({
              id: doc.id,
              type: 'material',
              titulo: titulo,
              descripcion: descripcion,
              carrera: carrera,
              ramo: ramo,
              carpetaId: data.carpetaId,
              archivoUrl: data.archivoUrl,
              ...data,
              carpetaInfo: folderInfo,
              matchType: matchesMaterial ? 'material' : 'folder'
            });
          }
        });

        console.log(`[Search] Materiales encontrados: ${materialesEncontrados.length}`);

        // Ordenar: primero los que coinciden directamente, luego por carpeta
        materialesEncontrados.sort((a, b) => {
          if (a.matchType === 'material' && b.matchType === 'folder') return -1;
          if (a.matchType === 'folder' && b.matchType === 'material') return 1;
          return 0;
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
          const searchableText = normalizeText(`${data.nombre} ${data.email} ${data.carrera}`);

          if (searchableText.includes(searchNormalized)) {
            results.usuarios.push({
              id: doc.id,
              type: 'usuario',
              ...data
            });
          }
        });

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
 * Busca SOLO en materiales (para la página Material.jsx)
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} carpetaId - ID de la carpeta actual (null para raíz o 'all' para buscar en todas)
 * @param {number} limitResults - Límite de resultados (default: 100)
 * @returns {Promise<Array>} Array de materiales encontrados
 */
export const buscarEnMateriales = async (searchTerm, carpetaId = null, limitResults = 100) => {
  try {
    console.log('[buscarEnMateriales] Iniciando búsqueda...');
    console.log('[buscarEnMateriales] Término:', searchTerm);
    console.log('[buscarEnMateriales] CarpetaId:', carpetaId);

    if (!searchTerm || searchTerm.trim().length < 2) {
      console.log('[buscarEnMateriales] Término muy corto');
      return [];
    }

    const searchNormalized = normalizeText(searchTerm.trim());
    console.log('[buscarEnMateriales] Término procesado:', searchNormalized);

    // 1. Cargar materiales
    const materialRef = collection(db, 'material');
    let q = query(materialRef, limit(300));

    // Si hay carpetaId específica (no 'all'), filtrar por carpeta
    if (carpetaId && carpetaId !== 'all') {
      q = query(materialRef, where('carpetaId', '==', carpetaId), limit(300));
    }

    const materialSnapshot = await getDocs(q);
    console.log(`[buscarEnMateriales] Materiales cargados: ${materialSnapshot.size}`);

    if (materialSnapshot.empty) {
      console.log('[buscarEnMateriales] No hay materiales');
      return [];
    }

    // 2. Cargar carpetas para construir rutas
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

    // Función para construir la ruta completa de una carpeta
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

    // 3. Buscar en materiales
    const materialesEncontrados = [];

    materialSnapshot.forEach(doc => {
      const data = doc.data();

      // Búsqueda en campos del material
      const titulo = data.titulo || '';
      const descripcion = data.descripcion || '';
      const carrera = data.carrera || '';
      const ramo = data.ramo || '';
      const autorNombre = data.autorNombre || '';
      const tags = Array.isArray(data.tags) ? data.tags.join(' ') : '';

      const searchableText = normalizeText(`${titulo} ${descripcion} ${carrera} ${ramo} ${autorNombre} ${tags}`);
      const matchesMaterial = searchableText.includes(searchNormalized);

      // Búsqueda por ruta de carpeta
      let matchesFolder = false;
      let folderPath = '';

      if (data.carpetaId && folderMap.has(data.carpetaId)) {
        folderPath = buildFolderPath(data.carpetaId);
        matchesFolder = normalizeText(folderPath).includes(searchNormalized);
      }

      if (matchesMaterial || matchesFolder) {
        // Obtener información de la carpeta
        let folderInfo = null;
        if (data.carpetaId && folderMap.has(data.carpetaId)) {
          const folder = folderMap.get(data.carpetaId);
          folderInfo = {
            nombre: folder.nombre,
            rutaCompleta: folderPath || buildFolderPath(data.carpetaId)
          };
        }

        materialesEncontrados.push({
          id: doc.id,
          ...data,
          carpetaInfo: folderInfo,
          matchType: matchesMaterial ? 'material' : 'folder'
        });
      }
    });

    console.log(`[buscarEnMateriales] Materiales encontrados: ${materialesEncontrados.length}`);

    // Ordenar: primero los que coinciden directamente, luego por carpeta
    materialesEncontrados.sort((a, b) => {
      // Fijados primero
      if (a.fijado && !b.fijado) return -1;
      if (!a.fijado && b.fijado) return 1;

      // Luego por tipo de match
      if (a.matchType === 'material' && b.matchType === 'folder') return -1;
      if (a.matchType === 'folder' && b.matchType === 'material') return 1;

      // Finalmente por fecha
      return new Date(b.fechaSubida) - new Date(a.fechaSubida);
    });

    const resultados = materialesEncontrados.slice(0, limitResults);
    console.log(`[buscarEnMateriales] Resultados finales: ${resultados.length}`);

    return resultados;
  } catch (error) {
    console.error('[buscarEnMateriales] Error en búsqueda:', error);
    throw error;
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
