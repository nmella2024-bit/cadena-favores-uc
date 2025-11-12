import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { deleteUser } from 'firebase/auth';
import { db, storage, auth } from '../firebaseConfig';

/**
 * Crea un documento de usuario en Firestore
 * @param {string} userId - ID del usuario (uid de Firebase Auth)
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<void>}
 */
export const createUserDocument = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'usuarios', userId), {
      nombre: userData.nombre,
      email: userData.email,
      carrera: userData.carrera || '',
      año: userData.año || 1,
      telefono: userData.telefono || '',
      intereses: userData.intereses || [],
      descripcion: userData.descripcion || '',
      rol: userData.rol || 'normal', // Por defecto, rol normal (debe coincidir con firestore.rules)
      reputacion: 5.0,
      favoresPublicados: [],
      favoresCompletados: [],
      fechaRegistro: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al crear documento de usuario:', error);
    throw error;
  }
};

/**
 * Obtiene los datos de un usuario desde Firestore
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} Datos del usuario o null si no existe
 */
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'usuarios', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Asegurar que el campo rol existe, por defecto 'normal'
      if (!userData.rol) {
        console.warn(`Usuario ${userId} no tiene campo 'rol', asignando 'normal' por defecto`);
        // Actualizar el documento con el rol por defecto
        await updateDoc(doc(db, 'usuarios', userId), { rol: 'normal' });
        userData.rol = 'normal';
      }
      return { id: userDoc.id, uid: userId, ...userData };
    } else {
      console.error(`No se encontró el documento del usuario con ID: ${userId}`);
      console.error('Por favor verifica que:');
      console.error('1. El usuario existe en la colección "usuarios" de Firestore');
      console.error('2. El ID del usuario coincide con el UID de Firebase Auth');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    throw error;
  }
};

/**
 * Actualiza los datos de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<void>}
 */
export const updateUserData = async (userId, updates) => {
  try {
    // Remover campos que no deberían actualizarse (rol, uid)
    const { rol, uid, ...updateData } = updates;

    await updateDoc(doc(db, 'usuarios', userId), updateData);
    console.log('Datos del usuario actualizados');
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

/**
 * Agrega un favor a la lista de favores publicados del usuario
 * @param {string} userId - ID del usuario
 * @param {string} favorId - ID del favor
 * @returns {Promise<void>}
 */
export const addFavorToUser = async (userId, favorId) => {
  try {
    const userRef = doc(db, 'usuarios', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const favoresPublicados = userDoc.data().favoresPublicados || [];
      favoresPublicados.push(favorId);

      await updateDoc(userRef, {
        favoresPublicados,
      });
    }
  } catch (error) {
    console.error('Error al agregar favor al usuario:', error);
    throw error;
  }
};

/**
 * Marca un favor como completado para el usuario
 * @param {string} userId - ID del usuario
 * @param {string} favorId - ID del favor
 * @returns {Promise<void>}
 */
export const markFavorAsCompleted = async (userId, favorId) => {
  try {
    const userRef = doc(db, 'usuarios', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const favoresCompletados = userDoc.data().favoresCompletados || [];
      if (!favoresCompletados.includes(favorId)) {
        favoresCompletados.push(favorId);

        await updateDoc(userRef, {
          favoresCompletados,
        });
      }
    }
  } catch (error) {
    console.error('Error al marcar favor como completado:', error);
    throw error;
  }
};

/**
 * Busca usuarios por carrera
 * @param {string} carrera - Nombre de la carrera
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getUsersByCarrera = async (carrera) => {
  try {
    const q = query(collection(db, 'usuarios'), where('carrera', '==', carrera));
    const querySnapshot = await getDocs(q);

    const usuarios = [];
    querySnapshot.forEach((doc) => {
      usuarios.push({ id: doc.id, ...doc.data() });
    });

    return usuarios;
  } catch (error) {
    console.error('Error al buscar usuarios por carrera:', error);
    throw error;
  }
};

/**
 * Sube una foto de perfil para el usuario
 * @param {string} userId - ID del usuario
 * @param {File} imageFile - Archivo de imagen
 * @returns {Promise<string>} URL de la foto subida
 */
export const uploadProfilePicture = async (userId, imageFile) => {
  try {
    // Validar que sea una imagen
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    // Validar tamaño (máximo 3MB)
    if (imageFile.size > 3 * 1024 * 1024) {
      throw new Error('La imagen no puede superar los 3MB');
    }

    // Crear referencia al archivo en Storage
    const timestamp = Date.now();
    const extension = imageFile.name.split('.').pop();
    const fileName = `profile_${timestamp}.${extension}`;
    const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);

    // Subir archivo
    const snapshot = await uploadBytes(storageRef, imageFile);

    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Actualizar documento del usuario con la URL de la foto
    await updateUserData(userId, {
      fotoPerfil: downloadURL,
    });

    return downloadURL;
  } catch (error) {
    console.error('Error al subir foto de perfil:', error);
    throw error;
  }
};

/**
 * Elimina la foto de perfil del usuario
 * @param {string} userId - ID del usuario
 * @param {string} photoURL - URL de la foto a eliminar
 * @returns {Promise<void>}
 */
export const deleteProfilePicture = async (userId, photoURL) => {
  try {
    // Extraer el path del archivo desde la URL
    // Esto es opcional, ya que Firebase Storage permite tener archivos antiguos
    // pero si quieres limpiar el storage, puedes implementar la eliminación

    // Actualizar documento del usuario para quitar la foto
    await updateUserData(userId, {
      fotoPerfil: null,
    });
  } catch (error) {
    console.error('Error al eliminar foto de perfil:', error);
    throw error;
  }
};

/**
 * Califica a un usuario después de completar un favor
 * @param {string} usuarioId - ID del usuario a calificar
 * @param {number} calificacion - Calificación de 1 a 5
 * @param {string} comentario - Comentario opcional
 * @returns {Promise<void>}
 */
export const calificarUsuario = async (usuarioId, calificacion, comentario = '') => {
  try {
    // Validar calificación
    if (calificacion < 1 || calificacion > 5) {
      throw new Error('La calificación debe estar entre 1 y 5');
    }

    // Obtener datos actuales del usuario
    const userData = await getUserData(usuarioId);

    if (!userData) {
      throw new Error('Usuario no encontrado');
    }

    // Calcular nueva reputación
    const totalCalificaciones = userData.totalCalificaciones || 0;
    const reputacionActual = userData.reputacion || 5.0;

    const nuevaReputacion = ((reputacionActual * totalCalificaciones) + calificacion) / (totalCalificaciones + 1);

    // Actualizar usuario
    await updateUserData(usuarioId, {
      reputacion: parseFloat(nuevaReputacion.toFixed(2)),
      totalCalificaciones: totalCalificaciones + 1,
    });

    console.log('Usuario calificado exitosamente');
  } catch (error) {
    console.error('Error al calificar usuario:', error);
    throw error;
  }
};

/**
 * Elimina completamente el perfil de un usuario
 * IMPORTANTE: Esta función elimina todos los datos del usuario incluyendo foto de perfil
 * @param {string} userId - ID del usuario
 * @returns {Promise<void>}
 */
export const deleteUserProfile = async (userId) => {
  try {
    // Obtener datos del usuario antes de eliminar para acceder a la foto de perfil
    const userRef = doc(db, 'usuarios', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // Eliminar foto de perfil de Storage si existe
      if (userData.fotoPerfil && userData.fotoPerfil.includes('firebase')) {
        try {
          // Extraer la ruta del archivo desde la URL
          const storageUrl = userData.fotoPerfil;
          const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';

          if (storageUrl.startsWith(baseUrl)) {
            // Extraer el path después de /o/
            const pathStart = storageUrl.indexOf('/o/') + 3;
            const pathEnd = storageUrl.indexOf('?');
            const filePath = decodeURIComponent(storageUrl.substring(pathStart, pathEnd));

            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);
            console.log('Foto de perfil eliminada de Storage:', filePath);
          }
        } catch (storageError) {
          console.warn('Error al eliminar foto de perfil de Storage (puede que ya no exista):', storageError);
          // No lanzar error si la foto ya fue eliminada
        }
      }
    }

    // Eliminar documento de Firestore
    await deleteDoc(userRef);

    // Obtener usuario actual de Firebase Auth
    const currentUser = auth.currentUser;

    // Eliminar cuenta de Firebase Auth
    if (currentUser && currentUser.uid === userId) {
      await deleteUser(currentUser);
    }

    console.log('Perfil de usuario eliminado exitosamente de Firestore, Storage y Auth');
  } catch (error) {
    console.error('Error al eliminar perfil de usuario:', error);
    throw error;
  }
};
