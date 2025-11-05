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
 * Busca en múltiples colecciones de Firestore
 * @param {string} searchTerm - Término de búsqueda
 * @param {Object} options - Opciones de búsqueda
 * @param {Array<string>} options.collections - Colecciones donde buscar (default: todas)
 * @param {number} options.limitPerCollection - Límite de resultados por colección (default: 10)
 * @returns {Promise<Object>} Resultados agrupados por tipo
 */
export const buscarGlobal = async (searchTerm, options = {}) => {
  try {
    const {
      collections = ['favores', 'anuncios', 'marketplace', 'material', 'usuarios'],
      limitPerCollection = 10
    } = options;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return {
        favores: [],
        anuncios: [],
        marketplace: [],
        material: [],
        usuarios: [],
        total: 0
      };
    }

    const searchLower = searchTerm.toLowerCase().trim();
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
          const searchableText = `${data.titulo} ${data.descripcion} ${data.categoria} ${data.nombreUsuario}`.toLowerCase();

          if (searchableText.includes(searchLower)) {
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
          const searchableText = `${data.titulo} ${data.descripcion} ${data.autorNombre}`.toLowerCase();

          if (searchableText.includes(searchLower)) {
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
          const searchableText = `${data.titulo} ${data.descripcion} ${data.autorNombre}`.toLowerCase();

          if (searchableText.includes(searchLower)) {
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

    // Búsqueda en Material
    if (collections.includes('material')) {
      try {
        const materialRef = collection(db, 'material');
        const materialSnapshot = await getDocs(query(materialRef, limit(100)));

        materialSnapshot.forEach(doc => {
          const data = doc.data();
          const searchableText = `${data.titulo} ${data.descripcion} ${data.carrera} ${data.ramo} ${data.autorNombre}`.toLowerCase();

          if (searchableText.includes(searchLower)) {
            results.material.push({
              id: doc.id,
              type: 'material',
              ...data
            });
          }
        });

        results.material = results.material.slice(0, limitPerCollection);
      } catch (error) {
        console.error('Error buscando en material:', error);
      }
    }

    // Búsqueda en Usuarios
    if (collections.includes('usuarios')) {
      try {
        const usuariosRef = collection(db, 'usuarios');
        const usuariosSnapshot = await getDocs(query(usuariosRef, limit(100)));

        usuariosSnapshot.forEach(doc => {
          const data = doc.data();
          const searchableText = `${data.nombre} ${data.email} ${data.carrera}`.toLowerCase();

          if (searchableText.includes(searchLower)) {
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

    return results;

  } catch (error) {
    console.error('Error en búsqueda global:', error);
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
