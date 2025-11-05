import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Obtiene contenido agregado para el feed principal
 * Combina favores, anuncios, marketplace y material académico
 * @param {Object} options - Opciones de filtrado
 * @param {string} options.carrera - Carrera del usuario (opcional)
 * @param {number} options.limitPerType - Límite de items por tipo (default: 10)
 * @returns {Promise<Array>} Array de items del feed ordenados por fecha
 */
export const obtenerFeed = async (options = {}) => {
  try {
    const { carrera = null, limitPerType = 10 } = options;

    const feedItems = [];

    // 1. Obtener favores activos recientes
    try {
      const favoresRef = collection(db, 'favores');
      const favoresQuery = query(
        favoresRef,
        where('estado', '==', 'activo'),
        orderBy('fecha', 'desc'),
        limit(limitPerType)
      );

      const favoresSnapshot = await getDocs(favoresQuery);
      favoresSnapshot.forEach(doc => {
        const data = doc.data();
        feedItems.push({
          id: doc.id,
          type: 'favor',
          ...data,
          timestamp: data.fecha,
        });
      });
    } catch (error) {
      console.error('Error al obtener favores para feed:', error);
    }

    // 2. Obtener anuncios recientes
    try {
      const anunciosRef = collection(db, 'anuncios');
      const anunciosQuery = query(
        anunciosRef,
        orderBy('fecha', 'desc'),
        limit(limitPerType)
      );

      const anunciosSnapshot = await getDocs(anunciosQuery);
      anunciosSnapshot.forEach(doc => {
        const data = doc.data();
        feedItems.push({
          id: doc.id,
          type: 'anuncio',
          ...data,
          timestamp: data.fecha,
        });
      });
    } catch (error) {
      console.error('Error al obtener anuncios para feed:', error);
    }

    // 3. Obtener productos de marketplace recientes
    try {
      const marketplaceRef = collection(db, 'marketplace');
      const marketplaceQuery = query(
        marketplaceRef,
        where('estado', '==', 'disponible'),
        orderBy('fecha', 'desc'),
        limit(limitPerType)
      );

      const marketplaceSnapshot = await getDocs(marketplaceQuery);
      marketplaceSnapshot.forEach(doc => {
        const data = doc.data();
        feedItems.push({
          id: doc.id,
          type: 'marketplace',
          ...data,
          timestamp: data.fecha,
        });
      });
    } catch (error) {
      console.error('Error al obtener marketplace para feed:', error);
    }

    // 4. Obtener material académico reciente (filtrar por carrera si está disponible)
    try {
      const materialRef = collection(db, 'material');
      let materialQuery;

      if (carrera) {
        materialQuery = query(
          materialRef,
          where('carrera', '==', carrera),
          orderBy('fechaSubida', 'desc'),
          limit(limitPerType)
        );
      } else {
        materialQuery = query(
          materialRef,
          orderBy('fechaSubida', 'desc'),
          limit(limitPerType)
        );
      }

      const materialSnapshot = await getDocs(materialQuery);
      materialSnapshot.forEach(doc => {
        const data = doc.data();
        feedItems.push({
          id: doc.id,
          type: 'material',
          ...data,
          timestamp: data.fechaSubida,
        });
      });
    } catch (error) {
      console.error('Error al obtener material para feed:', error);
    }

    // Ordenar todos los items por timestamp (más recientes primero)
    feedItems.sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || 0;
      return timeB - timeA;
    });

    // Limitar el total de items (opcional, para no saturar)
    const maxTotalItems = limitPerType * 4; // 4 tipos de contenido
    return feedItems.slice(0, maxTotalItems);

  } catch (error) {
    console.error('Error al obtener feed:', error);
    throw error;
  }
};

/**
 * Formatea un item del feed para mostrar en UI
 * @param {Object} item - Item del feed
 * @returns {Object} Item formateado con campos estándar
 */
export const formatearItemFeed = (item) => {
  const baseItem = {
    id: item.id,
    type: item.type,
    timestamp: item.timestamp,
  };

  switch (item.type) {
    case 'favor':
      return {
        ...baseItem,
        titulo: item.titulo,
        descripcion: item.descripcion,
        categoria: item.categoria,
        autor: item.nombreUsuario,
        autorId: item.usuarioId,
        badge: 'Favor',
        badgeColor: 'blue',
        link: `/favor/${item.id}`,
      };

    case 'anuncio':
      return {
        ...baseItem,
        titulo: item.titulo,
        descripcion: item.descripcion,
        autor: item.autorNombre,
        autorId: item.autor,
        imagenURL: item.imagenURL,
        fijado: item.fijado,
        badge: 'Anuncio',
        badgeColor: 'purple',
        link: `/anuncios`,
      };

    case 'marketplace':
      return {
        ...baseItem,
        titulo: item.titulo,
        descripcion: item.descripcion,
        precio: item.precio,
        autor: item.autorNombre,
        autorId: item.autor,
        imagenesURL: item.imagenesURL,
        badge: 'Marketplace',
        badgeColor: 'green',
        link: `/marketplace`,
      };

    case 'material':
      return {
        ...baseItem,
        titulo: item.titulo,
        descripcion: item.descripcion,
        carrera: item.carrera,
        ramo: item.ramo,
        autor: item.autorNombre,
        autorId: item.autorId,
        tipo: item.tipo,
        badge: 'Material',
        badgeColor: 'yellow',
        link: `/material`,
      };

    default:
      return baseItem;
  }
};

/**
 * Obtiene feed filtrado por tipo de contenido
 * @param {string} type - Tipo de contenido ('favor', 'anuncio', 'marketplace', 'material', 'all')
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Array>} Array de items del feed
 */
export const obtenerFeedPorTipo = async (type, options = {}) => {
  try {
    if (type === 'all') {
      return obtenerFeed(options);
    }

    const feedItems = await obtenerFeed(options);
    return feedItems.filter(item => item.type === type);
  } catch (error) {
    console.error('Error al obtener feed por tipo:', error);
    throw error;
  }
};
