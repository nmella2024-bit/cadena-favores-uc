import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  deleteUser,
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
  let userCreated = null;

  try {
    console.log('Iniciando registro de usuario...');

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    userCreated = userCredential.user;
    console.log('Usuario creado en Firebase Auth:', userCreated.uid);

    // Actualizar el perfil con el nombre
    await updateProfile(userCreated, {
      displayName: userData.nombre,
    });
    console.log('Perfil actualizado');

    // Esperar un momento para asegurar que el token se haya sincronizado
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Forzar actualización del token
    await userCreated.reload();
    const token = await userCreated.getIdToken(true);
    console.log('Token obtenido y actualizado, creando documento en Firestore...');

    // Crear documento del usuario en Firestore
    await createUserDocument(userCreated.uid, {
      nombre: userData.nombre,
      email: email,
      carrera: userData.carrera || '',
      año: userData.año || 1,
      telefono: userData.telefono || '',
      intereses: userData.intereses || [],
      descripcion: userData.descripcion || '',
    });

    console.log('Registro completado exitosamente');
    return userCreated;
  } catch (error) {
    console.error('Error al registrar usuario:', error);

    // Si el usuario fue creado en Auth pero falló algo después, eliminarlo
    if (userCreated) {
      console.log('Eliminando usuario de Firebase Auth debido al error...');
      try {
        await deleteUser(userCreated);
        console.log('Usuario eliminado de Firebase Auth');
      } catch (deleteError) {
        console.error('Error al eliminar usuario de Auth:', deleteError);
        // Si no se puede eliminar automáticamente, informar al usuario
        throw new Error('Error al crear tu cuenta. El correo ' + email + ' quedó registrado parcialmente. Por favor, contacta al administrador o intenta con otro correo.');
      }
    }

    // Mensajes de error más claros
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Ya existe una cuenta con este correo. Si no puedes ingresar, contacta al administrador para limpiar la cuenta.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('El correo electrónico no es válido.');
    } else if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      throw new Error('Error de permisos al crear tu perfil en Firestore. Verifica que las reglas de seguridad estén correctamente configuradas.');
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
