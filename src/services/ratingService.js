import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Marca que un usuario confirma la finalización de un favor
 * @param {string} favorId - ID del favor
 * @param {string} userId - ID del usuario que confirma
 * @param {string} rolEnFavor - 'solicitante' o 'ayudante'
 * @returns {Promise<Object>} Estado de confirmación
 */
export const confirmarFinalizacion = async (favorId, userId, rolEnFavor) => {
  try {
    const favorRef = doc(db, 'favores', favorId);
    const favorDoc = await getDoc(favorRef);

    if (!favorDoc.exists()) {
      throw new Error('El favor no existe');
    }

    const favorData = favorDoc.data();
    const confirmaciones = favorData.confirmaciones || {};

    // Actualizar la confirmación del usuario
    confirmaciones[rolEnFavor] = {
      usuarioId: userId,
      confirmado: true,
      fecha: new Date(),
    };

    // Verificar si ambas partes confirmaron
    const ambosConfirmaron = confirmaciones.solicitante?.confirmado && confirmaciones.ayudante?.confirmado;

    await updateDoc(favorRef, {
      confirmaciones,
      estado: ambosConfirmaron ? 'confirmado' : favorData.estado,
      updatedAt: serverTimestamp(),
    });

    return {
      confirmado: true,
      ambosConfirmaron,
    };
  } catch (error) {
    console.error('Error al confirmar finalización:', error);
    throw error;
  }
};

/**
 * Califica a un usuario después de completar un favor
 * @param {Object} calificacionData - Datos de la calificación
 * @returns {Promise<string>} ID de la calificación creada
 */
export const calificarUsuario = async (calificacionData) => {
  try {
    const {
      favorId,
      calificadorId,
      calificadorNombre,
      calificadoId,
      calificadoNombre,
      estrellas,
      comentario,
      rolCalificador, // 'solicitante' o 'ayudante'
    } = calificacionData;

    // Validar que las estrellas estén entre 1 y 5
    if (estrellas < 1 || estrellas > 5) {
      throw new Error('La calificación debe estar entre 1 y 5 estrellas');
    }

    // Verificar que no exista ya una calificación de esta persona para este favor
    const calificacionesRef = collection(db, 'calificaciones');
    const q = query(
      calificacionesRef,
      where('favorId', '==', favorId),
      where('calificadorId', '==', calificadorId)
    );
    const existentes = await getDocs(q);

    if (!existentes.empty) {
      throw new Error('Ya has calificado a este usuario por este favor');
    }

    // Crear la calificación
    const calificacion = {
      favorId,
      calificadorId,
      calificadorNombre,
      calificadoId,
      calificadoNombre,
      estrellas,
      comentario: comentario || '',
      rolCalificador,
      fecha: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(calificacionesRef, calificacion);

    // Actualizar el promedio del usuario calificado
    await actualizarPromedioUsuario(calificadoId);

    return docRef.id;
  } catch (error) {
    console.error('Error al calificar usuario:', error);
    throw error;
  }
};

/**
 * Actualiza el promedio de calificaciones de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<number>} Nuevo promedio
 */
export const actualizarPromedioUsuario = async (userId) => {
  try {
    // Obtener todas las calificaciones del usuario
    const calificacionesRef = collection(db, 'calificaciones');
    const q = query(calificacionesRef, where('calificadoId', '==', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Si no tiene calificaciones, mantener 5.0 por defecto
      await updateDoc(doc(db, 'usuarios', userId), {
        reputacion: 5.0,
        totalCalificaciones: 0,
      });
      return 5.0;
    }

    // Calcular promedio
    let suma = 0;
    let cantidad = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      suma += data.estrellas;
      cantidad++;
    });

    const promedio = suma / cantidad;
    const promedioRedondeado = Math.round(promedio * 10) / 10; // Redondear a 1 decimal

    // Actualizar el usuario
    await updateDoc(doc(db, 'usuarios', userId), {
      reputacion: promedioRedondeado,
      totalCalificaciones: cantidad,
    });

    return promedioRedondeado;
  } catch (error) {
    console.error('Error al actualizar promedio:', error);
    throw error;
  }
};

/**
 * Obtiene las calificaciones de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de calificaciones
 */
export const obtenerCalificacionesUsuario = async (userId) => {
  try {
    const calificacionesRef = collection(db, 'calificaciones');
    const q = query(calificacionesRef, where('calificadoId', '==', userId));
    const snapshot = await getDocs(q);

    const calificaciones = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      calificaciones.push({
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate?.()?.toLocaleDateString('es-CL') || 'Fecha desconocida',
      });
    });

    // Ordenar por fecha (más recientes primero)
    calificaciones.sort((a, b) => {
      const fechaA = a.createdAt?.toDate?.() || new Date(0);
      const fechaB = b.createdAt?.toDate?.() || new Date(0);
      return fechaB - fechaA;
    });

    return calificaciones;
  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    throw error;
  }
};

/**
 * Verifica si un usuario puede calificar en un favor específico
 * @param {string} favorId - ID del favor
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Información sobre si puede calificar y a quién
 */
export const verificarPuedeCalificar = async (favorId, userId) => {
  try {
    const favorRef = doc(db, 'favores', favorId);
    const favorDoc = await getDoc(favorRef);

    if (!favorDoc.exists()) {
      throw new Error('El favor no existe');
    }

    const favorData = favorDoc.data();
    const confirmaciones = favorData.confirmaciones || {};

    // Verificar que ambas partes hayan confirmado
    const ambosConfirmaron = confirmaciones.solicitante?.confirmado && confirmaciones.ayudante?.confirmado;

    if (!ambosConfirmaron) {
      return {
        puedeCalificar: false,
        razon: 'Ambas partes deben confirmar la finalización primero',
      };
    }

    // Determinar el rol del usuario en este favor
    let rolUsuario = null;
    let usuarioACalificarId = null;
    let usuarioACalificarNombre = null;

    if (confirmaciones.solicitante?.usuarioId === userId) {
      rolUsuario = 'solicitante';
      usuarioACalificarId = confirmaciones.ayudante?.usuarioId;
      // Obtener nombre del ayudante
      const ayudanteDoc = await getDoc(doc(db, 'usuarios', usuarioACalificarId));
      usuarioACalificarNombre = ayudanteDoc.data()?.nombre || 'Usuario';
    } else if (confirmaciones.ayudante?.usuarioId === userId) {
      rolUsuario = 'ayudante';
      usuarioACalificarId = confirmaciones.solicitante?.usuarioId;
      usuarioACalificarNombre = favorData.nombreUsuario || 'Usuario';
    } else {
      return {
        puedeCalificar: false,
        razon: 'No eres parte de este favor',
      };
    }

    // Verificar si ya calificó
    const calificacionesRef = collection(db, 'calificaciones');
    const q = query(
      calificacionesRef,
      where('favorId', '==', favorId),
      where('calificadorId', '==', userId)
    );
    const existentes = await getDocs(q);

    if (!existentes.empty) {
      return {
        puedeCalificar: false,
        razon: 'Ya has calificado en este favor',
        yaCalificado: true,
      };
    }

    return {
      puedeCalificar: true,
      rolUsuario,
      usuarioACalificarId,
      usuarioACalificarNombre,
    };
  } catch (error) {
    console.error('Error al verificar si puede calificar:', error);
    throw error;
  }
};

/**
 * Obtiene el estado de confirmación de un favor
 * @param {string} favorId - ID del favor
 * @param {string} userId - ID del usuario actual
 * @returns {Promise<Object>} Estado de las confirmaciones
 */
export const obtenerEstadoConfirmacion = async (favorId, userId) => {
  try {
    const favorRef = doc(db, 'favores', favorId);
    const favorDoc = await getDoc(favorRef);

    if (!favorDoc.exists()) {
      throw new Error('El favor no existe');
    }

    const favorData = favorDoc.data();
    const confirmaciones = favorData.confirmaciones || {};

    // Determinar el rol del usuario
    let rolUsuario = null;
    if (favorData.usuarioId === userId) {
      rolUsuario = 'solicitante';
    } else if (confirmaciones.ayudante?.usuarioId === userId) {
      rolUsuario = 'ayudante';
    }

    return {
      confirmaciones,
      rolUsuario,
      yoConfirme: confirmaciones[rolUsuario]?.confirmado || false,
      otraParteConfirmo: rolUsuario === 'solicitante'
        ? confirmaciones.ayudante?.confirmado || false
        : confirmaciones.solicitante?.confirmado || false,
      ambosConfirmaron: confirmaciones.solicitante?.confirmado && confirmaciones.ayudante?.confirmado,
    };
  } catch (error) {
    console.error('Error al obtener estado de confirmación:', error);
    throw error;
  }
};
