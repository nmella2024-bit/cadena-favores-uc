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
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

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
      telefono: userData.telefono || '', // Número de WhatsApp privado
      intereses: userData.intereses || [],
      descripcion: userData.descripcion || '',
      reputacion: 5.0,
      favoresPublicados: [],
      favoresCompletados: [],
      fechaRegistro: serverTimestamp(),
    });
    console.log('Documento de usuario creado exitosamente');
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
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      console.log('No se encontró el documento del usuario');
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
    await updateDoc(doc(db, 'usuarios', userId), updates);
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
