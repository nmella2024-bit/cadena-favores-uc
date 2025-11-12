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
import { notificarNuevaCalificacion } from './notificationService';

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
 * Tanto el solicitante como el ayudante pueden calificarse mutuamente
 * @param {Object} calificacionData - Datos de la calificación
 * @param {string} calificacionData.favorId - ID del favor
 * @param {string} calificacionData.calificadorId - ID del usuario que califica
 * @param {string} calificacionData.calificadorNombre - Nombre del usuario que califica
 * @param {string} calificacionData.calificadoId - ID del usuario calificado
 * @param {string} calificacionData.calificadoNombre - Nombre del usuario calificado
 * @param {number} calificacionData.estrellas - Calificación de 1 a 5
 * @param {string} calificacionData.comentario - Comentario opcional
 * @param {string} calificacionData.rolCalificador - 'solicitante' o 'ayudante'
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

    console.log('🔍 [calificarUsuario] Iniciando calificación:', {
      favorId,
      calificadorId,
      calificadoId,
      estrellas,
      rolCalificador
    });

    // Validar que todos los campos requeridos estén presentes
    if (!favorId) {
      throw new Error('El ID del favor es requerido');
    }
    if (!calificadorId) {
      throw new Error('El ID del calificador es requerido');
    }
    if (!calificadoId) {
      throw new Error('El ID del calificado es requerido');
    }
    if (!calificadorNombre) {
      throw new Error('El nombre del calificador es requerido');
    }
    if (!calificadoNombre) {
      throw new Error('El nombre del calificado es requerido');
    }

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

    console.log('✅ [calificarUsuario] Verificación de duplicados completada');

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

    // Crear notificación para el usuario calificado
    try {
      await notificarNuevaCalificacion(
        calificadoId,
        calificadorNombre,
        estrellas,
        favorId
      );
      console.log('✅ [calificarUsuario] Notificación enviada al usuario calificado');
    } catch (notifError) {
      console.error('⚠️ [calificarUsuario] Error al crear notificación:', notifError);
    }

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
 * Tanto el solicitante como el ayudante pueden calificarse mutuamente
 * @param {string} favorId - ID del favor
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Información sobre si puede calificar y a quién
 */
export const verificarPuedeCalificar = async (favorId, userId) => {
  try {
    // Validar parámetros
    if (!favorId || !userId) {
      throw new Error('Faltan parámetros necesarios (favorId o userId)');
    }

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

    // SOLO el solicitante puede calificar
    if (confirmaciones.solicitante?.usuarioId !== userId) {
      return {
        puedeCalificar: false,
        razon: 'Solo el solicitante del favor puede calificar al ayudante',
        noEsSolicitante: true,
      };
    }

    // Verificar que exista el ID del ayudante
    const usuarioACalificarId = confirmaciones.ayudante?.usuarioId;
    if (!usuarioACalificarId) {
      return {
        puedeCalificar: false,
        razon: 'No se pudo obtener la información del ayudante',
        sinAyudante: true,
      };
    }

    // El solicitante califica al ayudante
    const rolUsuario = 'solicitante';

    // Obtener nombre del ayudante
    const ayudanteDoc = await getDoc(doc(db, 'usuarios', usuarioACalificarId));
    const usuarioACalificarNombre = ayudanteDoc.exists() ? ayudanteDoc.data()?.nombre || 'Usuario' : 'Usuario';

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
 * Verifica si un usuario puede calificar en un favor FINALIZADO
 * Tanto el solicitante como el ayudante pueden calificarse mutuamente
 * @param {string} favorId - ID del favor
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Información sobre si puede calificar y a quién
 */
export const verificarPuedeCalificarFinalizado = async (favorId, userId) => {
  try {
    console.log('🔍 [verificarPuedeCalificarFinalizado] Iniciando verificación:', { favorId, userId });

    // Validar parámetros
    if (!favorId || !userId) {
      console.error('❌ [verificarPuedeCalificarFinalizado] Faltan parámetros:', { favorId, userId });
      throw new Error('Faltan parámetros necesarios (favorId o userId)');
    }

    const favorRef = doc(db, 'favores', favorId);
    const favorDoc = await getDoc(favorRef);

    if (!favorDoc.exists()) {
      console.error('❌ [verificarPuedeCalificarFinalizado] Favor no existe:', favorId);
      throw new Error('El favor no existe');
    }

    const favorData = favorDoc.data();
    console.log('📄 [verificarPuedeCalificarFinalizado] Datos del favor:', {
      estado: favorData.estado,
      usuarioId: favorData.usuarioId,
      ayudanteId: favorData.ayudanteId
    });

    // Verificar que el favor esté finalizado
    if (favorData.estado !== 'finalizado') {
      return {
        puedeCalificar: false,
        razon: 'El favor debe estar marcado como finalizado primero',
      };
    }

    // Verificar que hay un ayudante
    if (!favorData.ayudanteId) {
      return {
        puedeCalificar: false,
        razon: 'No se registró quién ayudó con este favor. Esto ocurre cuando el sistema no pudo guardar la información del ayudante al presionar "Ofrecer ayuda". Lamentablemente no podrás calificar este favor.',
        sinAyudante: true,
      };
    }

    // Determinar el rol del usuario actual
    let rolUsuario = null;
    let usuarioACalificarId = null;

    if (favorData.usuarioId === userId) {
      // El usuario actual es el solicitante, califica al ayudante
      rolUsuario = 'solicitante';
      usuarioACalificarId = favorData.ayudanteId;
    } else if (favorData.ayudanteId === userId) {
      // El usuario actual es el ayudante, califica al solicitante
      rolUsuario = 'ayudante';
      usuarioACalificarId = favorData.usuarioId;
    } else {
      console.log('❌ [verificarPuedeCalificarFinalizado] Usuario no participa en el favor');
      return {
        puedeCalificar: false,
        razon: 'No participaste en este favor',
        noParticipa: true,
      };
    }

    console.log('👤 [verificarPuedeCalificarFinalizado] Rol del usuario:', rolUsuario, 'Calificará a:', usuarioACalificarId);

    // Obtener nombre del usuario a calificar
    const usuarioACalificarDoc = await getDoc(doc(db, 'usuarios', usuarioACalificarId));
    const usuarioACalificarNombre = usuarioACalificarDoc.exists() ? usuarioACalificarDoc.data()?.nombre || 'Usuario' : 'Usuario';

    console.log('✅ [verificarPuedeCalificarFinalizado] Nombre del usuario a calificar:', usuarioACalificarNombre);

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
    } else if (favorData.ayudanteId === userId) {
      // Verificar por ayudanteId en el favor (más confiable)
      rolUsuario = 'ayudante';
    } else if (confirmaciones.ayudante?.usuarioId === userId) {
      // También verificar en confirmaciones por compatibilidad
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
