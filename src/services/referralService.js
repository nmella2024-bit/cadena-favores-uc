import {
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Genera un código de referido único basado en el userId
 * Usa los primeros 6 caracteres del UID en mayúsculas
 * @param {string} userId - ID del usuario
 * @returns {string} Código de referido (6 caracteres)
 */
export const generateReferralCode = (userId) => {
  return userId.substring(0, 6).toUpperCase();
};

/**
 * Obtiene el código de referido de un usuario
 * Si no existe, lo genera y lo guarda
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} Código de referido
 */
export const getUserReferralCode = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'usuarios', userId));

    if (!userDoc.exists()) {
      throw new Error('Usuario no encontrado');
    }

    const userData = userDoc.data();

    // Si ya tiene código, devolverlo
    if (userData.codigoReferido) {
      return userData.codigoReferido;
    }

    // Si no tiene código, generarlo y guardarlo
    const newCode = generateReferralCode(userId);
    await updateDoc(doc(db, 'usuarios', userId), {
      codigoReferido: newCode,
      fechaGeneracionCodigo: serverTimestamp(),
      totalReferidos: 0,
    });

    return newCode;
  } catch (error) {
    console.error('Error al obtener código de referido:', error);
    throw error;
  }
};

/**
 * Valida si un código de referido existe y retorna el usuario
 * @param {string} codigo - Código de referido a validar
 * @returns {Promise<Object|null>} Usuario que tiene ese código o null
 */
export const validateReferralCode = async (codigo) => {
  try {
    if (!codigo || codigo.trim().length === 0) {
      return null;
    }

    // Normalizar el código (mayúsculas, sin espacios)
    const normalizedCode = codigo.trim().toUpperCase();

    // Buscar usuario con ese código
    const q = query(
      collection(db, 'usuarios'),
      where('codigoReferido', '==', normalizedCode),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data(),
    };
  } catch (error) {
    console.error('Error al validar código de referido:', error);
    throw error;
  }
};

/**
 * Extrae el código de referido de un link completo
 * Soporta formatos: nexuc.com/ref/ABC123, /ref/ABC123, o solo ABC123
 * @param {string} input - Link o código de referido
 * @returns {string} Código extraído
 */
export const extractReferralCode = (input) => {
  if (!input) return '';

  // Si contiene /ref/, extraer el código después
  if (input.includes('/ref/')) {
    const parts = input.split('/ref/');
    return parts[1].split(/[?&#]/)[0].trim().toUpperCase();
  }

  // Si no, asumir que es solo el código
  return input.trim().toUpperCase();
};

/**
 * Registra un nuevo referido en el sistema
 * @param {string} referredUserId - ID del usuario nuevo (referido)
 * @param {string} referrerCode - Código del usuario que refiere
 * @param {string} referredEmail - Email del usuario referido
 * @returns {Promise<string>} ID del documento de referido creado
 */
export const registerReferral = async (referredUserId, referrerCode, referredEmail) => {
  try {
    // Validar que el código exista
    const referrer = await validateReferralCode(referrerCode);

    if (!referrer) {
      throw new Error('Código de referido inválido');
    }

    // Validar que no sea auto-referido
    if (referrer.id === referredUserId) {
      throw new Error('No puedes usar tu propio código de referido');
    }

    // Verificar que el usuario no haya sido referido antes
    const existingReferralQuery = query(
      collection(db, 'referidos'),
      where('referido', '==', referredUserId),
      limit(1)
    );
    const existingReferral = await getDocs(existingReferralQuery);

    if (!existingReferral.empty) {
      console.warn('El usuario ya fue referido anteriormente');
      // No lanzar error, solo registrar warning
      // Retornar el ID del referido existente
      return existingReferral.docs[0].id;
    }

    // Crear documento de referido
    const referralDoc = await addDoc(collection(db, 'referidos'), {
      referidoPor: referrer.id,
      referido: referredUserId,
      codigoReferido: referrerCode.toUpperCase(),
      fechaRegistro: serverTimestamp(),
      estado: 'completado',
      emailReferido: referredEmail,
    });

    // Incrementar contador de referidos del usuario que refiere
    await updateDoc(doc(db, 'usuarios', referrer.id), {
      totalReferidos: increment(1),
    });

    console.log('Referido registrado exitosamente:', referralDoc.id);
    return referralDoc.id;
  } catch (error) {
    console.error('Error al registrar referido:', error);
    throw error;
  }
};

/**
 * Obtiene todos los referidos de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de referidos
 */
export const getUserReferrals = async (userId) => {
  try {
    const q = query(
      collection(db, 'referidos'),
      where('referidoPor', '==', userId),
      orderBy('fechaRegistro', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const referrals = [];

    for (const docSnapshot of querySnapshot.docs) {
      const referralData = docSnapshot.data();

      // Obtener datos del usuario referido (nombre, email, etc.)
      let referredUserData = null;
      try {
        const referredUserDoc = await getDoc(doc(db, 'usuarios', referralData.referido));
        if (referredUserDoc.exists()) {
          referredUserData = {
            id: referredUserDoc.id,
            nombre: referredUserDoc.data().nombre,
            email: referredUserDoc.data().email,
            fotoPerfil: referredUserDoc.data().fotoPerfil,
          };
        }
      } catch (error) {
        console.warn('Error al obtener datos del usuario referido:', error);
      }

      referrals.push({
        id: docSnapshot.id,
        ...referralData,
        usuarioReferido: referredUserData,
      });
    }

    return referrals;
  } catch (error) {
    console.error('Error al obtener referidos:', error);
    throw error;
  }
};

/**
 * Obtiene el total de referidos de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<number>} Número de referidos
 */
export const getUserReferralCount = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'usuarios', userId));

    if (!userDoc.exists()) {
      return 0;
    }

    return userDoc.data().totalReferidos || 0;
  } catch (error) {
    console.error('Error al obtener contador de referidos:', error);
    return 0;
  }
};

/**
 * Obtiene el ranking de usuarios por número de referidos
 * @param {number} limitCount - Número máximo de usuarios a retornar
 * @returns {Promise<Array>} Lista de usuarios ordenados por referidos
 */
export const getReferralRanking = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'usuarios'),
      orderBy('totalReferidos', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const ranking = [];

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      // Solo incluir usuarios con al menos 1 referido
      if (userData.totalReferidos > 0) {
        ranking.push({
          id: doc.id,
          nombre: userData.nombre,
          email: userData.email,
          carrera: userData.carrera,
          totalReferidos: userData.totalReferidos || 0,
          fotoPerfil: userData.fotoPerfil,
          codigoReferido: userData.codigoReferido,
        });
      }
    });

    return ranking;
  } catch (error) {
    console.error('Error al obtener ranking de referidos:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas generales del sistema de referidos
 * @returns {Promise<Object>} Estadísticas generales
 */
export const getReferralStats = async () => {
  try {
    // Obtener todos los referidos
    const referidosSnapshot = await getDocs(collection(db, 'referidos'));
    const totalReferidos = referidosSnapshot.size;

    // Obtener usuarios con códigos de referido
    const usuariosConCodigoQuery = query(
      collection(db, 'usuarios'),
      where('codigoReferido', '!=', null)
    );
    const usuariosConCodigo = await getDocs(usuariosConCodigoQuery);
    const totalUsuariosConCodigo = usuariosConCodigo.size;

    // Obtener usuarios que han referido al menos a alguien
    const usuariosConReferidosQuery = query(
      collection(db, 'usuarios'),
      where('totalReferidos', '>', 0)
    );
    const usuariosConReferidos = await getDocs(usuariosConReferidosQuery);
    const totalUsuariosConReferidos = usuariosConReferidos.size;

    return {
      totalReferidos,
      totalUsuariosConCodigo,
      totalUsuariosConReferidos,
      promedioReferidosPorUsuario: totalUsuariosConReferidos > 0
        ? (totalReferidos / totalUsuariosConReferidos).toFixed(2)
        : 0,
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de referidos:', error);
    throw error;
  }
};

/**
 * Genera el link completo de referido para compartir
 * @param {string} code - Código de referido
 * @returns {string} Link completo
 */
export const generateReferralLink = (code) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/registro?ref=${code}`;
};
