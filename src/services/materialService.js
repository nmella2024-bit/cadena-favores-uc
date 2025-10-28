import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

/**
 * Sube un archivo de material a Firebase Storage y crea un documento en Firestore
 * @param {Object} materialData - Datos del material (titulo, descripcion, carrera, anio, ramo, tags)
 * @param {Object} usuario - Usuario que sube el material
 * @param {File} archivo - Archivo PDF/DOCX
 * @returns {Promise<string>} ID del documento creado
 */
export const subirMaterial = async (materialData, usuario, archivo) => {
  try {
    let archivoUrl = '';
    let tipo = 'Enlace';

    // Si hay archivo, subirlo a Firebase Storage
    if (archivo) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const extension = archivo.name.split('.').pop();
      const archivoRef = ref(
        storage,
        `material/${usuario.uid}/${timestamp}_${random}.${extension}`
      );
      const snapshot = await uploadBytes(archivoRef, archivo);
      archivoUrl = await getDownloadURL(snapshot.ref);

      // Determinar tipo de archivo
      tipo = archivo.type.includes('pdf') ? 'PDF' :
             archivo.type.includes('word') || archivo.name.endsWith('.docx') ? 'DOCX' :
             'Otro';
    }

    // Si hay enlace externo, usarlo como URL
    if (materialData.enlaceExterno) {
      archivoUrl = materialData.enlaceExterno;
      // Si solo hay enlace y no archivo, mantener tipo como 'Enlace'
      // Si hay ambos, el archivo toma prioridad en el tipo
    }

    // Crear el documento en Firestore
    const docRef = await addDoc(collection(db, 'material'), {
      titulo: materialData.titulo,
      descripcion: materialData.descripcion,
      carrera: materialData.carrera,
      anio: parseInt(materialData.anio),
      ramo: materialData.ramo,
      archivoUrl: archivoUrl,
      enlaceExterno: materialData.enlaceExterno || null,
      autorId: usuario.uid,
      autorNombre: usuario.nombre || usuario.displayName || 'Usuario',
      fechaSubida: serverTimestamp(),
      tags: materialData.tags || [],
      tipo: tipo,
    });

    return docRef.id;
  } catch (error) {
    console.error('Error al subir material:', error);
    throw error;
  }
};

/**
 * Obtiene todos los materiales
 * @returns {Promise<Array>} Lista de materiales
 */
export const obtenerMateriales = async () => {
  try {
    const q = query(collection(db, 'material'), orderBy('fechaSubida', 'desc'));
    const querySnapshot = await getDocs(q);

    const materiales = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      materiales.push({
        id: doc.id,
        ...data,
        fechaSubida: data.fechaSubida?.toDate ? data.fechaSubida.toDate().toISOString() : new Date().toISOString(),
      });
    });

    return materiales;
  } catch (error) {
    console.error('Error al obtener materiales:', error);
    throw error;
  }
};

/**
 * Obtiene materiales filtrados
 * @param {Object} filtros - Filtros (carrera, anio, ramo)
 * @returns {Promise<Array>} Lista de materiales filtrados
 */
export const obtenerMaterialesFiltrados = async (filtros) => {
  try {
    let q = query(collection(db, 'material'));

    if (filtros.carrera) {
      q = query(q, where('carrera', '==', filtros.carrera));
    }
    if (filtros.anio) {
      q = query(q, where('anio', '==', parseInt(filtros.anio)));
    }
    if (filtros.ramo) {
      q = query(q, where('ramo', '==', filtros.ramo));
    }

    q = query(q, orderBy('fechaSubida', 'desc'));

    const querySnapshot = await getDocs(q);
    const materiales = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      materiales.push({
        id: doc.id,
        ...data,
        fechaSubida: data.fechaSubida?.toDate ? data.fechaSubida.toDate().toISOString() : new Date().toISOString(),
      });
    });

    return materiales;
  } catch (error) {
    console.error('Error al obtener materiales filtrados:', error);
    throw error;
  }
};

/**
 * Elimina un material
 * @param {string} materialId - ID del material
 * @returns {Promise<void>}
 */
export const eliminarMaterial = async (materialId) => {
  try {
    await deleteDoc(doc(db, 'material', materialId));
  } catch (error) {
    console.error('Error al eliminar material:', error);
    throw error;
  }
};

/**
 * Obtiene materiales de un usuario específico
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de materiales del usuario
 */
export const obtenerMaterialesUsuario = async (userId) => {
  try {
    const q = query(
      collection(db, 'material'),
      where('autorId', '==', userId),
      orderBy('fechaSubida', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const materiales = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      materiales.push({
        id: doc.id,
        ...data,
        fechaSubida: data.fechaSubida?.toDate ? data.fechaSubida.toDate().toISOString() : new Date().toISOString(),
      });
    });

    return materiales;
  } catch (error) {
    console.error('Error al obtener materiales del usuario:', error);
    throw error;
  }
};
