import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

/**
 * Publica un nuevo anuncio
 * @param {Object} anuncioData - Datos del anuncio
 * @param {Object} usuario - Usuario que publica
 * @param {File} imagen - Archivo de imagen (opcional)
 * @returns {Promise<string>} ID del anuncio creado
 */
export const publicarAnuncio = async (anuncioData, usuario, imagen = null) => {
  try {
    let imagenURL = '';

    // Si hay imagen, subirla a Firebase Storage
    if (imagen) {
      const timestamp = Date.now();
      const imagenRef = ref(storage, `anuncios/${usuario.uid}/${timestamp}_${imagen.name}`);
      const snapshot = await uploadBytes(imagenRef, imagen);
      imagenURL = await getDownloadURL(snapshot.ref);
    }

    // Crear el anuncio en Firestore
    const docRef = await addDoc(collection(db, 'anuncios'), {
      titulo: anuncioData.titulo,
      descripcion: anuncioData.descripcion,
      autor: usuario.uid,
      autorNombre: usuario.nombre || usuario.displayName || 'Usuario',
      fecha: serverTimestamp(),
      imagenURL: imagenURL,
      fijado: false,
    });

    return docRef.id;
  } catch (error) {
    console.error('Error al publicar anuncio:', error);
    throw error;
  }
};

/**
 * Obtiene todos los anuncios ordenados por fecha
 * @returns {Promise<Array>} Lista de anuncios
 */
export const obtenerAnuncios = async () => {
  try {
    const q = query(collection(db, 'anuncios'), orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);

    const anuncios = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      anuncios.push({
        id: doc.id,
        ...data,
        // Convertir timestamp a objeto Date si existe
        fecha: data.fecha?.toDate ? data.fecha.toDate() : new Date(),
      });
    });

    return anuncios;
  } catch (error) {
    console.error('Error al obtener anuncios:', error);
    throw error;
  }
};

/**
 * Obtiene un anuncio por ID
 * @param {string} anuncioId - ID del anuncio
 * @returns {Promise<Object>} Datos del anuncio
 */
export const obtenerAnuncio = async (anuncioId) => {
  try {
    const docRef = doc(db, 'anuncios', anuncioId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        fecha: data.fecha?.toDate ? data.fecha.toDate() : new Date(),
      };
    } else {
      throw new Error('Anuncio no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener anuncio:', error);
    throw error;
  }
};

/**
 * Actualiza un anuncio
 * @param {string} anuncioId - ID del anuncio
 * @param {Object} datosActualizados - Datos a actualizar
 * @param {File} nuevaImagen - Nueva imagen (opcional)
 * @param {Object} usuario - Usuario que actualiza
 * @returns {Promise<void>}
 */
export const actualizarAnuncio = async (anuncioId, datosActualizados, nuevaImagen = null, usuario) => {
  try {
    const docRef = doc(db, 'anuncios', anuncioId);
    const updates = { ...datosActualizados };

    // Si hay nueva imagen, subirla
    if (nuevaImagen) {
      const timestamp = Date.now();
      const imagenRef = ref(storage, `anuncios/${usuario.uid}/${timestamp}_${nuevaImagen.name}`);
      const snapshot = await uploadBytes(imagenRef, nuevaImagen);
      updates.imagenURL = await getDownloadURL(snapshot.ref);
    }

    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error al actualizar anuncio:', error);
    throw error;
  }
};

/**
 * Elimina un anuncio
 * @param {string} anuncioId - ID del anuncio
 * @returns {Promise<void>}
 */
export const eliminarAnuncio = async (anuncioId) => {
  try {
    await deleteDoc(doc(db, 'anuncios', anuncioId));
  } catch (error) {
    console.error('Error al eliminar anuncio:', error);
    throw error;
  }
};

/**
 * Fija o desfija un anuncio
 * NOTA: Esta función debe ser llamada solo por usuarios con rol 'exclusivo'
 * La validación del rol debe hacerse en el componente antes de llamar esta función
 * @param {string} anuncioId - ID del anuncio
 * @param {boolean} fijado - Estado de fijado
 * @param {Object} usuario - Usuario que realiza la acción (opcional, para validación)
 * @returns {Promise<void>}
 */
export const fijarAnuncio = async (anuncioId, fijado, usuario = null) => {
  try {
    // Validación adicional: solo usuarios con rol 'exclusivo' pueden fijar anuncios
    if (usuario && usuario.rol !== 'exclusivo') {
      throw new Error('Solo los usuarios con rol exclusivo pueden fijar anuncios');
    }

    const docRef = doc(db, 'anuncios', anuncioId);
    await updateDoc(docRef, { fijado });
  } catch (error) {
    console.error('Error al fijar/desfijar anuncio:', error);
    throw error;
  }
};

/**
 * Verifica si un anuncio es nuevo (publicado en las últimas 24 horas)
 * @param {Date} fecha - Fecha del anuncio
 * @returns {boolean}
 */
export const esAnuncioNuevo = (fecha) => {
  const ahora = new Date();
  const diferencia = ahora - fecha;
  const unDiaEnMs = 24 * 60 * 60 * 1000;
  return diferencia < unDiaEnMs;
};
