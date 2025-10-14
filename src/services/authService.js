import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { createUserDocument } from './userService';

/**
 * Registra un nuevo usuario con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @param {Object} userData - Datos adicionales del usuario (nombre, carrera, etc.)
 * @returns {Promise<Object>} Usuario creado
 */
export const registerUser = async (email, password, userData) => {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Actualizar el perfil con el nombre
    await updateProfile(user, {
      displayName: userData.nombre,
    });

    // Crear documento del usuario en Firestore
    await createUserDocument(user.uid, {
      nombre: userData.nombre,
      email: email,
      carrera: userData.carrera || '',
      año: userData.año || 1,
      intereses: userData.intereses || [],
      descripcion: userData.descripcion || '',
    });

    return user;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
};

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Usuario autenticado
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
};

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

/**
 * Escucha los cambios en el estado de autenticación
 * @param {Function} callback - Función que se ejecuta cuando cambia el estado
 * @returns {Function} Función para desuscribirse del listener
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Obtiene el usuario actual
 * @returns {Object|null} Usuario actual o null si no hay sesión
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
