import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { addFavorToUser, markFavorAsCompleted, getUserData } from './userService';

/**
 * Publica un nuevo favor en Firestore
 * @param {Object} favor - Datos del favor
 * @param {Object} user - Usuario que publica el favor
 * @returns {Promise<string>} ID del favor creado
 */
export const publicarFavor = async (favor, user) => {
  try {
    const favorData = {
      titulo: favor.titulo,
      descripcion: favor.descripcion,
      categoria: favor.categoria,
      disponibilidad: favor.disponibilidad || '',
      usuarioId: user.uid,
      nombreUsuario: user.displayName || 'Anónimo',
      emailUsuario: user.email,
      fecha: serverTimestamp(),
      estado: 'activo',
      respuestas: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'favores'), favorData);
    console.log('Favor publicado con ID:', docRef.id);

    // Agregar el favor a la lista del usuario
    await addFavorToUser(user.uid, docRef.id);

    return docRef.id;
  } catch (error) {
    console.error('Error al publicar favor:', error);
    throw error;
  }
};

/**
 * Obtiene todos los favores activos
 * @returns {Promise<Array>} Lista de favores
 */
export const obtenerFavores = async () => {
  try {
    const q = query(
      collection(db, 'favores'),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const favores = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      favores.push({
        id: doc.id,
        ...data,
        // Convertir timestamp a string para mostrar
        fecha: data.fecha?.toDate().toLocaleDateString('es-CL') || 'Fecha desconocida',
      });
    });

    return favores;
  } catch (error) {
    console.error('Error al obtener favores:', error);
    throw error;
  }
};

/**
 * Obtiene un favor específico por ID
 * @param {string} favorId - ID del favor
 * @returns {Promise<Object|null>} Datos del favor o null si no existe
 */
export const obtenerFavorPorId = async (favorId) => {
  try {
    const favorDoc = await getDoc(doc(db, 'favores', favorId));

    if (favorDoc.exists()) {
      const data = favorDoc.data();
      return {
        id: favorDoc.id,
        ...data,
        fecha: data.fecha?.toDate().toLocaleDateString('es-CL') || 'Fecha desconocida',
      };
    } else {
      console.log('No se encontró el favor');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener favor:', error);
    throw error;
  }
};

/**
 * Obtiene un favor específico por ID (alias de obtenerFavorPorId)
 * @param {string} favorId - ID del favor
 * @returns {Promise<Object|null>} Datos del favor o null si no existe
 */
export const obtenerFavor = obtenerFavorPorId;

/**
 * Obtiene los favores de un usuario específico
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de favores del usuario
 */
export const obtenerFavoresPorUsuario = async (userId) => {
  try {
    const q = query(
      collection(db, 'favores'),
      where('usuarioId', '==', userId),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const favores = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      favores.push({
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate().toLocaleDateString('es-CL') || 'Fecha desconocida',
      });
    });

    return favores;
  } catch (error) {
    console.error('Error al obtener favores del usuario:', error);
    throw error;
  }
};

/**
 * Filtra favores por categoría
 * @param {string} categoria - Categoría a filtrar
 * @returns {Promise<Array>} Lista de favores filtrados
 */
export const obtenerFavoresPorCategoria = async (categoria) => {
  try {
    const q = query(
      collection(db, 'favores'),
      where('categoria', '==', categoria),
      where('estado', '==', 'activo'),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const favores = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      favores.push({
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate().toLocaleDateString('es-CL') || 'Fecha desconocida',
      });
    });

    return favores;
  } catch (error) {
    console.error('Error al filtrar favores por categoría:', error);
    throw error;
  }
};

/**
 * Responde a un favor e intercambia información de contacto
 * @param {string} favorId - ID del favor
 * @param {Object} user - Usuario que responde
 * @returns {Promise<void>}
 */
export const responderFavor = async (favorId, user) => {
  try {
    const favorRef = doc(db, 'favores', favorId);
    const favorDoc = await getDoc(favorRef);

    if (favorDoc.exists()) {
      const favorData = favorDoc.data();
      const respuestas = favorData.respuestas || [];

      // Obtener datos completos del usuario que responde (incluye teléfono)
      const respondienteData = await getUserData(user.uid);

      // Obtener datos completos del usuario que publicó el favor
      const solicitanteData = await getUserData(favorData.usuarioId);

      if (!respondienteData || !solicitanteData) {
        throw new Error('No se pudo obtener información de los usuarios');
      }

      // Validar que ambos usuarios tengan teléfono
      if (!respondienteData.telefono) {
        throw new Error('Debes agregar un número de WhatsApp a tu perfil para poder responder a favores');
      }

      if (!solicitanteData.telefono) {
        throw new Error('El solicitante aún no ha agregado un número de WhatsApp. No se puede establecer contacto en este momento.');
      }

      respuestas.push({
        usuarioId: user.uid,
        nombreUsuario: user.displayName || 'Anónimo',
        emailUsuario: user.email,
        telefonoUsuario: respondienteData.telefono || '', // Teléfono del que responde
        fecha: new Date(),
        // Información del solicitante para el que responde
        solicitanteTelefono: solicitanteData.telefono || '',
        solicitanteNombre: solicitanteData.nombre,
        solicitanteEmail: solicitanteData.email,
      });

      await updateDoc(favorRef, {
        respuestas,
        updatedAt: serverTimestamp(),
      });

      console.log('Respuesta agregada al favor con información de contacto');
    }
  } catch (error) {
    console.error('Error al responder favor:', error);
    throw error;
  }
};

/**
 * Marca un favor como completado (DEPRECATED - usar finalizarFavor)
 * @param {string} favorId - ID del favor
 * @param {string} userId - ID del usuario que completa el favor
 * @returns {Promise<void>}
 */
export const completarFavor = async (favorId, userId) => {
  try {
    await updateDoc(doc(db, 'favores', favorId), {
      estado: 'completado',
      updatedAt: serverTimestamp(),
    });

    // Marcar como completado en el perfil del usuario
    await markFavorAsCompleted(userId, favorId);

    console.log('Favor marcado como completado');
  } catch (error) {
    console.error('Error al completar favor:', error);
    throw error;
  }
};

/**
 * Finaliza un favor (solo puede hacerlo el creador)
 * @param {string} favorId - ID del favor
 * @param {string} solicitanteId - ID del usuario solicitante
 * @returns {Promise<void>}
 */
export const finalizarFavor = async (favorId, solicitanteId) => {
  try {
    const favorRef = doc(db, 'favores', favorId);
    const favorDoc = await getDoc(favorRef);

    if (!favorDoc.exists()) {
      throw new Error('El favor no existe');
    }

    const favorData = favorDoc.data();

    // Verificar que quien finaliza es el creador
    if (favorData.usuarioId !== solicitanteId) {
      throw new Error('Solo el creador del favor puede marcarlo como finalizado');
    }

    // Actualizar estado a finalizado
    // No requiere que haya ayudante, puede finalizar de todas formas
    await updateDoc(favorRef, {
      estado: 'finalizado',
      fechaFinalizacion: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('Favor finalizado exitosamente');
  } catch (error) {
    console.error('Error al finalizar favor:', error);
    throw error;
  }
};

/**
 * Asocia un ayudante a un favor cuando responde
 * @param {string} favorId - ID del favor
 * @param {string} ayudanteId - ID del usuario ayudante
 * @param {string} ayudanteNombre - Nombre del ayudante
 * @returns {Promise<void>}
 */
export const asociarAyudante = async (favorId, ayudanteId, ayudanteNombre) => {
  try {
    console.log('[DEBUG] Iniciando asociarAyudante:', { favorId, ayudanteId, ayudanteNombre });

    const favorRef = doc(db, 'favores', favorId);
    const favorDoc = await getDoc(favorRef);

    if (!favorDoc.exists()) {
      console.error('[DEBUG] El favor no existe');
      throw new Error('El favor no existe');
    }

    console.log('[DEBUG] Favor encontrado:', favorDoc.data());

    // Verificar que no haya ayudante previo
    if (favorDoc.data().ayudanteId) {
      console.warn('[DEBUG] Ya hay un ayudante:', favorDoc.data().ayudanteId);
      throw new Error('Este favor ya tiene un ayudante asociado');
    }

    console.log('[DEBUG] Intentando updateDoc con:', {
      ayudanteId,
      ayudanteNombre,
    });

    // Solo actualizar los campos esenciales
    await updateDoc(favorRef, {
      ayudanteId: ayudanteId,
      ayudanteNombre: ayudanteNombre,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ [DEBUG] Ayudante asociado exitosamente');
  } catch (error) {
    console.error('❌ [DEBUG] Error al asociar ayudante:', error);
    console.error('❌ [DEBUG] Error code:', error.code);
    console.error('❌ [DEBUG] Error message:', error.message);
    throw error;
  }
};

/**
 * Elimina un favor
 * @param {string} favorId - ID del favor a eliminar
 * @returns {Promise<void>}
 */
export const eliminarFavor = async (favorId) => {
  try {
    await deleteDoc(doc(db, 'favores', favorId));
    console.log('Favor eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar favor:', error);
    throw error;
  }
};

/**
 * Actualiza los datos de un favor
 * @param {string} favorId - ID del favor
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<void>}
 */
export const actualizarFavor = async (favorId, updates) => {
  try {
    await updateDoc(doc(db, 'favores', favorId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log('Favor actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar favor:', error);
    throw error;
  }
};

/**
 * Busca favores por texto en título, descripción o disponibilidad
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Lista de favores que coinciden
 */
export const buscarFavores = async (searchTerm) => {
  try {
    // Nota: Firestore no soporta búsqueda de texto completo de forma nativa
    // Esta es una solución básica que obtiene todos los favores y filtra en el cliente
    const favores = await obtenerFavores();

    const searchLower = searchTerm.toLowerCase();
    return favores.filter(
      (favor) =>
        favor.titulo.toLowerCase().includes(searchLower) ||
        favor.descripcion.toLowerCase().includes(searchLower) ||
        (favor.disponibilidad && favor.disponibilidad.toLowerCase().includes(searchLower))
    );
  } catch (error) {
    console.error('Error al buscar favores:', error);
    throw error;
  }
};

/**
 * Ofrece ayuda para un favor
 * @param {string} favorId - ID del favor
 * @param {Object} user - Usuario que ofrece ayuda
 * @returns {Promise<void>}
 */
export const ofrecerAyuda = async (favorId, user) => {
  try {
    const favorRef = doc(db, 'favores', favorId);
    const favorDoc = await getDoc(favorRef);

    if (!favorDoc.exists()) {
      throw new Error('El favor no existe');
    }

    const favorData = favorDoc.data();

    // No permitir que el creador del favor se ofrezca a ayudarse a sí mismo
    if (favorData.usuarioId === user.uid) {
      throw new Error('No puedes ofrecerte ayuda en tu propio favor');
    }

    // Obtener datos completos del usuario
    const userData = await getUserData(user.uid);

    if (!userData) {
      throw new Error('No se pudo obtener información del usuario');
    }

    // Validar que el usuario tenga teléfono
    if (!userData.telefono) {
      throw new Error('Debes agregar un número de WhatsApp a tu perfil para poder ofrecer ayuda');
    }

    const ayudantes = favorData.ayudantes || [];

    // Verificar que no se haya ofrecido antes
    if (ayudantes.some(a => a.idUsuario === user.uid)) {
      throw new Error('Ya te has ofrecido a ayudar en este favor');
    }

    // Agregar oferta de ayuda
    ayudantes.push({
      idUsuario: user.uid,
      nombre: userData.nombre || user.displayName || 'Usuario',
      carrera: userData.carrera || '',
      fotoPerfil: userData.fotoPerfil || null,
      telefono: userData.telefono,
      fechaOferta: new Date().toISOString(),
    });

    await updateDoc(favorRef, {
      ayudantes,
      updatedAt: serverTimestamp(),
    });

    console.log('Oferta de ayuda agregada exitosamente');
  } catch (error) {
    console.error('Error al ofrecer ayuda:', error);
    throw error;
  }
};

/**
 * Acepta a un ayudante específico para un favor
 * @param {string} favorId - ID del favor
 * @param {string} solicitanteId - ID del usuario solicitante
 * @param {string} ayudanteId - ID del usuario ayudante seleccionado
 * @returns {Promise<void>}
 */
export const aceptarAyudante = async (favorId, solicitanteId, ayudanteId) => {
  try {
    const favorRef = doc(db, 'favores', favorId);
    const favorDoc = await getDoc(favorRef);

    if (!favorDoc.exists()) {
      throw new Error('El favor no existe');
    }

    const favorData = favorDoc.data();

    // Verificar que quien acepta es el creador
    if (favorData.usuarioId !== solicitanteId) {
      throw new Error('Solo el creador del favor puede aceptar ayudantes');
    }

    // Verificar que el estado sea pendiente
    if (favorData.estado !== 'activo' && favorData.estado !== 'pendiente') {
      throw new Error('Este favor ya no está disponible');
    }

    // Verificar que el ayudante esté en la lista de ofertas
    const ayudantes = favorData.ayudantes || [];
    const ayudante = ayudantes.find(a => a.idUsuario === ayudanteId);

    if (!ayudante) {
      throw new Error('El ayudante seleccionado no se ha ofrecido para este favor');
    }

    // Actualizar favor con ayudante seleccionado y cambiar estado
    await updateDoc(favorRef, {
      ayudanteSeleccionado: {
        idUsuario: ayudante.idUsuario,
        nombre: ayudante.nombre,
        carrera: ayudante.carrera,
        fotoPerfil: ayudante.fotoPerfil,
        telefono: ayudante.telefono,
        fechaAceptacion: new Date().toISOString(),
      },
      estado: 'en_proceso',
      updatedAt: serverTimestamp(),
    });

    console.log('Ayudante aceptado exitosamente');
  } catch (error) {
    console.error('Error al aceptar ayudante:', error);
    throw error;
  }
};

/**
 * Completa un favor y lo marca como finalizado
 * @param {string} favorId - ID del favor
 * @param {string} solicitanteId - ID del usuario solicitante
 * @returns {Promise<void>}
 */
export const completarFavorConAyudante = async (favorId, solicitanteId) => {
  try {
    const favorRef = doc(db, 'favores', favorId);
    const favorDoc = await getDoc(favorRef);

    if (!favorDoc.exists()) {
      throw new Error('El favor no existe');
    }

    const favorData = favorDoc.data();

    // Verificar que quien completa es el creador
    if (favorData.usuarioId !== solicitanteId) {
      throw new Error('Solo el creador del favor puede marcarlo como completado');
    }

    // Verificar que esté en proceso
    if (favorData.estado !== 'en_proceso') {
      throw new Error('El favor debe estar en proceso para completarlo');
    }

    await updateDoc(favorRef, {
      estado: 'completado',
      fechaCompletado: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('Favor completado exitosamente');
  } catch (error) {
    console.error('Error al completar favor:', error);
    throw error;
  }
};

/**
 * Obtiene favores donde el usuario ha participado (publicado o respondido)
 * con información de contacto si corresponde
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Objeto con favores publicados y respondidos con contactos
 */
export const obtenerFavoresConContactos = async (userId) => {
  try {
    // Obtener todos los favores
    const todosFavores = await obtenerFavores();

    // Favores publicados por el usuario
    const favoresPublicados = todosFavores.filter(f => f.usuarioId === userId);

    // Favores donde el usuario respondió (con información de contacto)
    const favoresRespondidos = [];

    for (const favor of todosFavores) {
      if (favor.respuestas && favor.respuestas.length > 0) {
        const miRespuesta = favor.respuestas.find(r => r.usuarioId === userId);
        if (miRespuesta) {
          favoresRespondidos.push({
            ...favor,
            miContacto: {
              solicitanteNombre: miRespuesta.solicitanteNombre,
              solicitanteEmail: miRespuesta.solicitanteEmail,
              solicitanteTelefono: miRespuesta.solicitanteTelefono,
            }
          });
        }
      }
    }

    return {
      publicados: favoresPublicados,
      respondidos: favoresRespondidos,
    };
  } catch (error) {
    console.error('Error al obtener favores con contactos:', error);
    throw error;
  }
};
