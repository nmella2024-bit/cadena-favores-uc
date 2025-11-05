import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const FOLDERS_COLLECTION = 'folders';

/**
 * Crea una nueva carpeta
 * @param {Object} folderData - Datos de la carpeta
 * @param {string} folderData.nombre - Nombre de la carpeta
 * @param {string|null} folderData.carpetaPadreId - ID de la carpeta padre (null para raíz)
 * @param {string} folderData.autorId - ID del usuario que crea la carpeta
 * @param {string} folderData.autorNombre - Nombre del autor
 * @returns {Promise<string>} ID de la carpeta creada
 */
export const crearCarpeta = async (folderData) => {
  try {
    const nuevaCarpeta = {
      nombre: folderData.nombre,
      carpetaPadreId: folderData.carpetaPadreId || null,
      autorId: folderData.autorId,
      autorNombre: folderData.autorNombre,
      fechaCreacion: serverTimestamp(),
      tipo: 'carpeta'
    };

    const docRef = await addDoc(collection(db, FOLDERS_COLLECTION), nuevaCarpeta);
    console.log('Carpeta creada con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear carpeta:', error);
    throw new Error('No se pudo crear la carpeta: ' + error.message);
  }
};

/**
 * Obtiene todas las carpetas de un nivel específico
 * @param {string|null} carpetaPadreId - ID de la carpeta padre (null para raíz)
 * @returns {Promise<Array>} Array de carpetas
 */
export const obtenerCarpetasPorNivel = async (carpetaPadreId = null) => {
  try {
    // Consulta simple sin orderBy para evitar necesidad de índice compuesto
    const q = query(
      collection(db, FOLDERS_COLLECTION),
      where('carpetaPadreId', '==', carpetaPadreId)
    );

    const querySnapshot = await getDocs(q);
    const carpetas = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      carpetas.push({
        id: doc.id,
        ...data,
        fechaCreacion: data.fechaCreacion?.toDate?.() || new Date()
      });
    });

    // Ordenar en el cliente por fecha de creación descendente
    carpetas.sort((a, b) => b.fechaCreacion - a.fechaCreacion);

    return carpetas;
  } catch (error) {
    console.error('Error al obtener carpetas:', error);
    throw new Error('No se pudieron obtener las carpetas: ' + error.message);
  }
};

/**
 * Obtiene todas las carpetas (sin filtrar por nivel)
 * @returns {Promise<Array>} Array de todas las carpetas
 */
export const obtenerTodasLasCarpetas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, FOLDERS_COLLECTION));
    const carpetas = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      carpetas.push({
        id: doc.id,
        ...data,
        fechaCreacion: data.fechaCreacion?.toDate?.() || new Date()
      });
    });

    return carpetas;
  } catch (error) {
    console.error('Error al obtener todas las carpetas:', error);
    throw new Error('No se pudieron obtener las carpetas: ' + error.message);
  }
};

/**
 * Obtiene una carpeta por su ID
 * @param {string} carpetaId - ID de la carpeta
 * @returns {Promise<Object|null>} Datos de la carpeta o null
 */
export const obtenerCarpetaPorId = async (carpetaId) => {
  try {
    if (!carpetaId) return null;

    const docRef = doc(db, FOLDERS_COLLECTION, carpetaId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        fechaCreacion: data.fechaCreacion?.toDate?.() || new Date()
      };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener carpeta por ID:', error);
    return null;
  }
};

/**
 * Construye la ruta completa (breadcrumb) de una carpeta
 * @param {string} carpetaId - ID de la carpeta
 * @returns {Promise<Array>} Array con la ruta [raíz, ..., carpetaActual]
 */
export const obtenerRutaCarpeta = async (carpetaId) => {
  try {
    if (!carpetaId) return [];

    const ruta = [];
    let carpetaActual = await obtenerCarpetaPorId(carpetaId);

    while (carpetaActual) {
      ruta.unshift(carpetaActual);
      if (carpetaActual.carpetaPadreId) {
        carpetaActual = await obtenerCarpetaPorId(carpetaActual.carpetaPadreId);
      } else {
        break;
      }
    }

    return ruta;
  } catch (error) {
    console.error('Error al obtener ruta de carpeta:', error);
    return [];
  }
};

/**
 * Renombra una carpeta
 * @param {string} carpetaId - ID de la carpeta
 * @param {string} nuevoNombre - Nuevo nombre
 * @param {string} userId - ID del usuario (para validación)
 * @returns {Promise<void>}
 */
export const renombrarCarpeta = async (carpetaId, nuevoNombre, userId) => {
  try {
    const carpeta = await obtenerCarpetaPorId(carpetaId);

    if (!carpeta) {
      throw new Error('Carpeta no encontrada');
    }

    // Solo el autor puede renombrar (puedes ajustar esta lógica)
    if (carpeta.autorId !== userId) {
      throw new Error('No tienes permisos para renombrar esta carpeta');
    }

    const docRef = doc(db, FOLDERS_COLLECTION, carpetaId);
    await updateDoc(docRef, {
      nombre: nuevoNombre
    });

    console.log('Carpeta renombrada exitosamente');
  } catch (error) {
    console.error('Error al renombrar carpeta:', error);
    throw new Error('No se pudo renombrar la carpeta: ' + error.message);
  }
};

/**
 * Elimina una carpeta y todo su contenido (subcarpetas y archivos)
 * @param {string} carpetaId - ID de la carpeta
 * @param {string} userId - ID del usuario (para validación)
 * @returns {Promise<void>}
 */
export const eliminarCarpeta = async (carpetaId, userId) => {
  try {
    const carpeta = await obtenerCarpetaPorId(carpetaId);

    if (!carpeta) {
      throw new Error('Carpeta no encontrada');
    }

    // Solo el autor puede eliminar (puedes ajustar esta lógica)
    if (carpeta.autorId !== userId) {
      throw new Error('No tienes permisos para eliminar esta carpeta');
    }

    // Obtener todas las subcarpetas
    const subcarpetas = await obtenerCarpetasPorNivel(carpetaId);

    // Eliminar recursivamente todas las subcarpetas
    for (const subcarpeta of subcarpetas) {
      await eliminarCarpeta(subcarpeta.id, userId);
    }

    // Eliminar los materiales dentro de esta carpeta
    // (esto se manejará desde materialService cuando se actualice)

    // Finalmente, eliminar la carpeta
    const docRef = doc(db, FOLDERS_COLLECTION, carpetaId);
    await deleteDoc(docRef);

    console.log('Carpeta eliminada exitosamente');
  } catch (error) {
    console.error('Error al eliminar carpeta:', error);
    throw new Error('No se pudo eliminar la carpeta: ' + error.message);
  }
};

/**
 * Mueve una carpeta a otra ubicación
 * @param {string} carpetaId - ID de la carpeta a mover
 * @param {string|null} nuevaCarpetaPadreId - ID de la nueva carpeta padre
 * @param {string} userId - ID del usuario (para validación)
 * @returns {Promise<void>}
 */
export const moverCarpeta = async (carpetaId, nuevaCarpetaPadreId, userId) => {
  try {
    const carpeta = await obtenerCarpetaPorId(carpetaId);

    if (!carpeta) {
      throw new Error('Carpeta no encontrada');
    }

    // Solo el autor puede mover
    if (carpeta.autorId !== userId) {
      throw new Error('No tienes permisos para mover esta carpeta');
    }

    // Validar que no se mueva a sí misma o a una subcarpeta propia
    if (carpetaId === nuevaCarpetaPadreId) {
      throw new Error('No puedes mover una carpeta dentro de sí misma');
    }

    // Validar que la carpeta destino existe (si no es null)
    if (nuevaCarpetaPadreId) {
      const carpetaDestino = await obtenerCarpetaPorId(nuevaCarpetaPadreId);
      if (!carpetaDestino) {
        throw new Error('Carpeta destino no encontrada');
      }
    }

    const docRef = doc(db, FOLDERS_COLLECTION, carpetaId);
    await updateDoc(docRef, {
      carpetaPadreId: nuevaCarpetaPadreId
    });

    console.log('Carpeta movida exitosamente');
  } catch (error) {
    console.error('Error al mover carpeta:', error);
    throw new Error('No se pudo mover la carpeta: ' + error.message);
  }
};

/**
 * Busca carpetas por nombre
 * @param {string} nombreBusqueda - Texto a buscar
 * @returns {Promise<Array>} Array de carpetas que coinciden
 */
export const buscarCarpetas = async (nombreBusqueda) => {
  try {
    const todasLasCarpetas = await obtenerTodasLasCarpetas();

    const carpetasFiltradas = todasLasCarpetas.filter(carpeta =>
      carpeta.nombre.toLowerCase().includes(nombreBusqueda.toLowerCase())
    );

    return carpetasFiltradas;
  } catch (error) {
    console.error('Error al buscar carpetas:', error);
    return [];
  }
};
