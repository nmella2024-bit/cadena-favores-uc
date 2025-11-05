import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  Timestamp,
  writeBatch,
  limit
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Tipos de notificación soportados
 */
export const NOTIFICATION_TYPES = {
  OFFER_HELP: 'offer_help',           // Alguien ofreció ayuda en tu favor
  HELP_ACCEPTED: 'help_accepted',     // Aceptaron tu oferta de ayuda
  FAVOR_COMPLETED: 'favor_completed', // El favor fue marcado como completado
  NEW_RATING: 'new_rating',           // Recibiste una nueva calificación
  NEW_ANUNCIO: 'new_anuncio',         // Nuevo anuncio relevante
  NEW_MATERIAL: 'new_material',       // Nuevo material de tu carrera
};

/**
 * Crea una notificación en Firestore
 * @param {Object} notificationData - Datos de la notificación
 * @param {string} notificationData.userId - ID del usuario que recibirá la notificación
 * @param {string} notificationData.type - Tipo de notificación (usar NOTIFICATION_TYPES)
 * @param {string} notificationData.title - Título de la notificación
 * @param {string} notificationData.message - Mensaje de la notificación
 * @param {Object} notificationData.data - Datos adicionales (ej: favorId, userId, etc)
 * @returns {Promise<string>} ID de la notificación creada
 */
export const crearNotificacion = async ({
  userId,
  type,
  title,
  message,
  data = {}
}) => {
  try {
    const notificationRef = collection(db, 'notificaciones');
    const notification = {
      userId,
      type,
      title,
      message,
      data,
      leida: false,
      fechaCreacion: Timestamp.now(),
    };

    const docRef = await addDoc(notificationRef, notification);
    console.log('✅ Notificación creada:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error al crear notificación:', error);
    throw error;
  }
};

/**
 * Obtiene las notificaciones de un usuario
 * @param {string} userId - ID del usuario
 * @param {number} limitCount - Número máximo de notificaciones a obtener (default: 50)
 * @returns {Promise<Array>} Array de notificaciones
 */
export const obtenerNotificaciones = async (userId, limitCount = 50) => {
  try {
    const notificacionesRef = collection(db, 'notificaciones');
    const q = query(
      notificacionesRef,
      where('userId', '==', userId),
      orderBy('fechaCreacion', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const notificaciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return notificaciones;
  } catch (error) {
    console.error('❌ Error al obtener notificaciones:', error);
    throw error;
  }
};

/**
 * Suscribe a las notificaciones de un usuario en tiempo real
 * @param {string} userId - ID del usuario
 * @param {Function} callback - Función que se ejecuta cuando hay cambios
 * @param {number} limitCount - Número máximo de notificaciones (default: 50)
 * @returns {Function} Función para desuscribirse
 */
export const suscribirseANotificaciones = (userId, callback, limitCount = 50) => {
  const notificacionesRef = collection(db, 'notificaciones');
  const q = query(
    notificacionesRef,
    where('userId', '==', userId),
    orderBy('fechaCreacion', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const notificaciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(notificaciones);
  });
};

/**
 * Marca una notificación como leída
 * @param {string} notificationId - ID de la notificación
 */
export const marcarComoLeida = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notificaciones', notificationId);
    await updateDoc(notificationRef, {
      leida: true,
    });
    console.log('✅ Notificación marcada como leída');
  } catch (error) {
    console.error('❌ Error al marcar notificación como leída:', error);
    throw error;
  }
};

/**
 * Marca todas las notificaciones de un usuario como leídas
 * @param {string} userId - ID del usuario
 */
export const marcarTodasComoLeidas = async (userId) => {
  try {
    const notificacionesRef = collection(db, 'notificaciones');
    const q = query(
      notificacionesRef,
      where('userId', '==', userId),
      where('leida', '==', false)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No hay notificaciones no leídas');
      return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { leida: true });
    });

    await batch.commit();
    console.log('✅ Todas las notificaciones marcadas como leídas');
  } catch (error) {
    console.error('❌ Error al marcar todas las notificaciones como leídas:', error);
    throw error;
  }
};

/**
 * Cuenta las notificaciones no leídas de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<number>} Cantidad de notificaciones no leídas
 */
export const contarNoLeidas = async (userId) => {
  try {
    const notificacionesRef = collection(db, 'notificaciones');
    const q = query(
      notificacionesRef,
      where('userId', '==', userId),
      where('leida', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('❌ Error al contar notificaciones no leídas:', error);
    return 0;
  }
};

// ============================================
// FUNCIONES AUXILIARES PARA CREAR NOTIFICACIONES ESPECÍFICAS
// ============================================

/**
 * Crea notificación cuando alguien ofrece ayuda en un favor
 * @param {string} solicitanteId - ID del usuario que publicó el favor
 * @param {string} ayudanteNombre - Nombre del usuario que ofreció ayuda
 * @param {string} favorId - ID del favor
 * @param {string} favorTitulo - Título del favor
 */
export const notificarOfertaAyuda = async (
  solicitanteId,
  ayudanteNombre,
  favorId,
  favorTitulo
) => {
  return crearNotificacion({
    userId: solicitanteId,
    type: NOTIFICATION_TYPES.OFFER_HELP,
    title: '¡Nueva oferta de ayuda!',
    message: `${ayudanteNombre} ofreció ayuda en tu favor "${favorTitulo}"`,
    data: { favorId, ayudanteNombre }
  });
};

/**
 * Crea notificación cuando aceptan tu oferta de ayuda
 * @param {string} ayudanteId - ID del usuario que ofreció ayuda
 * @param {string} solicitanteNombre - Nombre del solicitante
 * @param {string} favorId - ID del favor
 * @param {string} favorTitulo - Título del favor
 */
export const notificarAyudaAceptada = async (
  ayudanteId,
  solicitanteNombre,
  favorId,
  favorTitulo
) => {
  return crearNotificacion({
    userId: ayudanteId,
    type: NOTIFICATION_TYPES.HELP_ACCEPTED,
    title: '¡Aceptaron tu ayuda!',
    message: `${solicitanteNombre} aceptó tu oferta de ayuda para "${favorTitulo}"`,
    data: { favorId, solicitanteNombre }
  });
};

/**
 * Crea notificación cuando te califican
 * @param {string} calificadoId - ID del usuario calificado
 * @param {string} calificadorNombre - Nombre del calificador
 * @param {number} estrellas - Calificación (1-5)
 * @param {string} favorId - ID del favor
 */
export const notificarNuevaCalificacion = async (
  calificadoId,
  calificadorNombre,
  estrellas,
  favorId
) => {
  return crearNotificacion({
    userId: calificadoId,
    type: NOTIFICATION_TYPES.NEW_RATING,
    title: '¡Te han calificado!',
    message: `${calificadorNombre} te calificó con ${estrellas} ${estrellas === 1 ? 'estrella' : 'estrellas'}`,
    data: { favorId, calificadorNombre, estrellas }
  });
};

/**
 * Crea notificación cuando un favor es finalizado
 * @param {string} ayudanteId - ID del ayudante
 * @param {string} solicitanteNombre - Nombre del solicitante
 * @param {string} favorId - ID del favor
 * @param {string} favorTitulo - Título del favor
 */
export const notificarFavorFinalizado = async (
  ayudanteId,
  solicitanteNombre,
  favorId,
  favorTitulo
) => {
  return crearNotificacion({
    userId: ayudanteId,
    type: NOTIFICATION_TYPES.FAVOR_COMPLETED,
    title: 'Favor finalizado',
    message: `${solicitanteNombre} marcó como completado el favor "${favorTitulo}"`,
    data: { favorId, solicitanteNombre }
  });
};
