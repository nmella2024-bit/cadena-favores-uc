import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Envía un mensaje de feedback a Firestore
 * @param {Object} feedbackData - Datos del feedback
 * @returns {Promise<string>} ID del documento creado
 */
export const enviarFeedback = async (feedbackData) => {
  try {
    const docRef = await addDoc(collection(db, 'feedback'), {
      mensaje: feedbackData.mensaje,
      email: feedbackData.email || '',
      nombre: feedbackData.nombre || 'Anónimo',
      usuarioId: feedbackData.usuarioId || null,
      fecha: serverTimestamp(),
      leido: false,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al enviar feedback:', error);
    throw error;
  }
};

/**
 * Obtiene todos los mensajes de feedback
 * @returns {Promise<Array>} Lista de mensajes de feedback
 */
export const obtenerFeedback = async () => {
  try {
    const q = query(collection(db, 'feedback'), orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);

    const feedbacks = [];
    querySnapshot.forEach((doc) => {
      feedbacks.push({ id: doc.id, ...doc.data() });
    });

    return feedbacks;
  } catch (error) {
    console.error('Error al obtener feedback:', error);
    throw error;
  }
};
