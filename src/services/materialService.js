import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { eliminarReportesDeContenido } from './reportService';
import { puedeEliminar, esAdmin } from '../utils/adminUtils';
import { getUserData } from './userService';

/**
 * Sube un archivo de material a Firebase Storage y crea un documento en Firestore
 * @param {Object} materialData - Datos del material (titulo, descripcion, carrera, anio, ramo, tags, carpetaId)
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
      fijado: false,
      carpetaId: materialData.carpetaId || null, // ID de la carpeta padre
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
 * Obtiene materiales de una carpeta específica
 * @param {string|null} carpetaId - ID de la carpeta (null para raíz)
 * @returns {Promise<Array>} Lista de materiales
 */
export const obtenerMaterialesPorCarpeta = async (carpetaId = null) => {
  try {
    // Consulta simple sin orderBy para evitar necesidad de índice compuesto
    const q = query(
      collection(db, 'material'),
      where('carpetaId', '==', carpetaId)
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

    // Ordenar en el cliente por fecha descendente
    materiales.sort((a, b) => new Date(b.fechaSubida) - new Date(a.fechaSubida));

    return materiales;
  } catch (error) {
    console.error('Error al obtener materiales por carpeta:', error);
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
 * Elimina un material permanentemente de Firestore y Storage
 * IMPORTANTE: Esta función elimina el material, su archivo de Storage y reportes asociados
 * Los administradores pueden eliminar cualquier material
 * @param {string} materialId - ID del material
 * @param {string} userId - ID del usuario que elimina (para validación)
 * @param {Object} usuario - Objeto completo del usuario (opcional, para verificar rol de admin)
 * @returns {Promise<void>}
 */
export const eliminarMaterial = async (materialId, userId, usuario = null) => {
  try {
    // Obtener el material para validar permisos y obtener la URL del archivo
    const materialRef = doc(db, 'material', materialId);
    const materialDoc = await getDoc(materialRef);

    if (!materialDoc.exists()) {
      throw new Error('El material no existe');
    }

    const materialData = materialDoc.data();

    // Obtener datos del usuario si no se proporcionaron
    let usuarioCompleto = usuario;
    if (!usuarioCompleto && userId) {
      usuarioCompleto = await getUserData(userId);
    }

    // Validar permisos: admin puede eliminar cualquier material, usuarios normales solo los suyos
    const tienePermiso = usuarioCompleto
      ? puedeEliminar(usuarioCompleto, materialData.autorId)
      : materialData.autorId === userId;

    if (!tienePermiso) {
      throw new Error('No tienes permisos para eliminar este material');
    }

    // Log para admins
    if (usuarioCompleto && esAdmin(usuarioCompleto) && materialData.autorId !== userId) {
      console.log(`[ADMIN] Usuario ${userId} eliminó material ${materialId} del usuario ${materialData.autorId}`);
    }

    // Eliminar archivo de Storage si existe y es un archivo subido (no un enlace externo)
    if (materialData.archivoUrl && materialData.archivoUrl.includes('firebase')) {
      try {
        // Extraer la ruta del archivo desde la URL
        const storageUrl = materialData.archivoUrl;
        const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';

        if (storageUrl.startsWith(baseUrl)) {
          // Extraer el path después de /o/
          const pathStart = storageUrl.indexOf('/o/') + 3;
          const pathEnd = storageUrl.indexOf('?');
          const filePath = decodeURIComponent(storageUrl.substring(pathStart, pathEnd));

          const fileRef = ref(storage, filePath);
          await deleteObject(fileRef);
          console.log('Archivo eliminado de Storage:', filePath);
        }
      } catch (storageError) {
        console.warn('Error al eliminar archivo de Storage (puede que ya no exista):', storageError);
        // No lanzar error si el archivo ya fue eliminado
      }
    }

    // Eliminar reportes asociados al material (en cascada)
    try {
      await eliminarReportesDeContenido('material', materialId);
    } catch (reportError) {
      console.warn('Error al eliminar reportes del material:', reportError);
      // No detener la eliminación si falla la eliminación de reportes
    }

    // Eliminar el documento de Firestore
    await deleteDoc(materialRef);

    console.log('Material, archivo y reportes asociados eliminados exitosamente');
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

/**
 * Fija o desfija un material
 * NOTA: Esta función debe ser llamada solo por usuarios con rol 'exclusivo'
 * La validación del rol debe hacerse en el componente antes de llamar esta función
 * @param {string} materialId - ID del material
 * @param {boolean} fijado - Estado de fijado
 * @param {Object} usuario - Usuario que realiza la acción (opcional, para validación)
 * @returns {Promise<void>}
 */
export const fijarMaterial = async (materialId, fijado, usuario = null) => {
  try {
    // Validación adicional: solo usuarios con rol 'exclusivo' pueden fijar materiales
    if (usuario && usuario.rol !== 'exclusivo') {
      throw new Error('Solo los usuarios con rol exclusivo pueden fijar materiales');
    }

    const docRef = doc(db, 'material', materialId);
    await updateDoc(docRef, { fijado });
  } catch (error) {
    console.error('Error al fijar/desfijar material:', error);
    throw error;
  }
};

/**
 * Verifica si un material es nuevo (subido en las últimas 24 horas)
 * @param {Date|string} fecha - Fecha del material
 * @returns {boolean}
 */
export const esMaterialNuevo = (fecha) => {
  const fechaMaterial = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const ahora = new Date();
  const diferencia = ahora - fechaMaterial;
  const unDiaEnMs = 24 * 60 * 60 * 1000;
  return diferencia < unDiaEnMs;
};
