import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { createUserDocument, getUserData } from './userService';

/**
 * Registra un nuevo usuario con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @param {Object} userData - Datos adicionales del usuario (nombre, carrera, etc.)
 * @returns {Promise<Object>} Usuario creado
 */
export const registerUser = async (email, password, userData) => {
  let createdUser = null;

  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    createdUser = userCredential.user;

    // Actualizar el perfil con el nombre
    await updateProfile(createdUser, {
      displayName: userData.nombre,
    });

    // Enviar correo de verificación
    await sendEmailVerification(createdUser);

    // Esperar a que el token de autenticación se sincronice con Firestore
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Crear documento del usuario en Firestore
    await createUserDocument(createdUser.uid, {
      nombre: userData.nombre,
      email: email,
      carrera: userData.carrera || '',
      año: userData.año || 1,
      telefono: userData.telefono || '',
      intereses: userData.intereses || [],
      descripcion: userData.descripcion || '',
    });

    return createdUser;
  } catch (error) {
    // Si el usuario fue creado en Auth pero falló Firestore, eliminarlo
    if (createdUser) {
      try {
        await deleteUser(createdUser);
      } catch (deleteError) {
        console.error('No se pudo eliminar el usuario de Auth:', deleteError);
      }
    }

    // Mensajes de error
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Ya existe una cuenta con este correo.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('El correo electrónico no es válido.');
    }

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
    // Primero intentar autenticar con Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verificar que el usuario exista en Firestore (fue registrado en la app)
    const userData = await getUserData(user.uid);

    if (!userData) {
      // Si no existe en Firestore, cerrar sesión y lanzar error
      await signOut(auth);
      throw new Error('Esta cuenta no está registrada en Red UC. Por favor regístrate primero.');
    }

    return user;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);

    // Si es el error personalizado, lanzarlo tal cual
    if (error.message.includes('no está registrada')) {
      throw error;
    }

    // Para otros errores de Firebase, mostrar mensaje apropiado
    if (error.code === 'auth/user-not-found') {
      throw new Error('No existe una cuenta con este correo.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Contraseña incorrecta.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('El correo electrónico no es válido.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('Esta cuenta ha sido deshabilitada.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos fallidos. Intenta más tarde.');
    }

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

/**
 * Reenvía el correo de verificación al usuario actual
 * @returns {Promise<void>}
 */
export const resendVerificationEmail = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No hay un usuario autenticado');
  }

  if (user.emailVerified) {
    throw new Error('El correo ya está verificado');
  }

  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error('Error al reenviar correo de verificación:', error);

    if (error.code === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos. Por favor espera unos minutos antes de volver a intentar.');
    }

    throw new Error('Error al enviar el correo de verificación. Por favor intenta más tarde.');
  }
};

/**
 * Envía un correo electrónico para restablecer la contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<void>}
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error al enviar correo de restablecimiento:', error);

    if (error.code === 'auth/user-not-found') {
      throw new Error('No existe una cuenta con este correo.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('El correo electrónico no es válido.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos. Por favor espera unos minutos antes de volver a intentar.');
    }

    throw new Error('Error al enviar el correo de restablecimiento. Por favor intenta más tarde.');
  }
};

