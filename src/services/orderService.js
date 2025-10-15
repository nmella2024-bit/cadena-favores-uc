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
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Crea un nuevo pedido en Firestore
 * @param {Object} orderData - Datos del pedido
 * @param {Object} user - Usuario que crea el pedido
 * @returns {Promise<string>} ID del pedido creado
 */
export const crearPedido = async (orderData, user) => {
  try {
    const pedidoData = {
      restaurante: orderData.restaurante,
      producto: orderData.producto,
      precio: orderData.precio,
      puntoEntrega: orderData.puntoEntrega,
      instrucciones: orderData.instrucciones || '',
      solicitanteId: user.uid,
      solicitanteNombre: user.displayName || user.nombre || 'Usuario',
      solicitanteEmail: user.email,
      estado: 'pendiente', // pendiente, aceptado, en-camino, entregado, cancelado
      repartidorId: null,
      repartidorNombre: null,
      fecha: serverTimestamp(),
      fechaAceptado: null,
      fechaEntregado: null,
      codigoQR: null, // Se generará al ser entregado
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'pedidos'), pedidoData);
    console.log('Pedido creado con ID:', docRef.id);

    return docRef.id;
  } catch (error) {
    console.error('Error al crear pedido:', error);
    throw error;
  }
};

/**
 * Obtiene todos los pedidos
 * @returns {Promise<Array>} Lista de pedidos
 */
export const obtenerPedidos = async () => {
  try {
    const q = query(
      collection(db, 'pedidos'),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const pedidos = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pedidos.push({
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate?.() || new Date(),
      });
    });

    return pedidos;
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }
};

/**
 * Obtiene pedidos por restaurante
 * @param {string} restaurante - Nombre del restaurante
 * @returns {Promise<Array>} Lista de pedidos del restaurante
 */
export const obtenerPedidosPorRestaurante = async (restaurante) => {
  try {
    const q = query(
      collection(db, 'pedidos'),
      where('restaurante', '==', restaurante),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const pedidos = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pedidos.push({
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate?.() || new Date(),
      });
    });

    return pedidos;
  } catch (error) {
    console.error('Error al obtener pedidos por restaurante:', error);
    throw error;
  }
};

/**
 * Obtiene pedidos de un usuario (como solicitante)
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de pedidos del usuario
 */
export const obtenerMisPedidos = async (userId) => {
  try {
    const q = query(
      collection(db, 'pedidos'),
      where('solicitanteId', '==', userId),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const pedidos = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pedidos.push({
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate?.() || new Date(),
      });
    });

    return pedidos;
  } catch (error) {
    console.error('Error al obtener mis pedidos:', error);
    throw error;
  }
};

/**
 * Obtiene pedidos que un usuario está repartiendo
 * @param {string} userId - ID del usuario repartidor
 * @returns {Promise<Array>} Lista de pedidos que está repartiendo
 */
export const obtenerPedidosRepartiendo = async (userId) => {
  try {
    const q = query(
      collection(db, 'pedidos'),
      where('repartidorId', '==', userId),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const pedidos = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pedidos.push({
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate?.() || new Date(),
      });
    });

    return pedidos;
  } catch (error) {
    console.error('Error al obtener pedidos repartiendo:', error);
    throw error;
  }
};

/**
 * Acepta un pedido (repartidor toma el pedido)
 * @param {string} pedidoId - ID del pedido
 * @param {Object} user - Usuario repartidor
 * @returns {Promise<void>}
 */
export const aceptarPedido = async (pedidoId, user) => {
  try {
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    const pedidoDoc = await getDoc(pedidoRef);

    if (!pedidoDoc.exists()) {
      throw new Error('El pedido no existe');
    }

    const pedidoData = pedidoDoc.data();

    if (pedidoData.estado !== 'pendiente') {
      throw new Error('Este pedido ya no está disponible');
    }

    await updateDoc(pedidoRef, {
      estado: 'aceptado',
      repartidorId: user.uid,
      repartidorNombre: user.displayName || user.nombre || 'Repartidor',
      fechaAceptado: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('Pedido aceptado exitosamente');
  } catch (error) {
    console.error('Error al aceptar pedido:', error);
    throw error;
  }
};

/**
 * Marca un pedido como "en camino"
 * @param {string} pedidoId - ID del pedido
 * @param {string} userId - ID del repartidor
 * @returns {Promise<void>}
 */
export const marcarEnCamino = async (pedidoId, userId) => {
  try {
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    const pedidoDoc = await getDoc(pedidoRef);

    if (!pedidoDoc.exists()) {
      throw new Error('El pedido no existe');
    }

    const pedidoData = pedidoDoc.data();

    if (pedidoData.repartidorId !== userId) {
      throw new Error('No tienes permiso para actualizar este pedido');
    }

    await updateDoc(pedidoRef, {
      estado: 'en-camino',
      updatedAt: serverTimestamp(),
    });

    console.log('Pedido marcado como en camino');
  } catch (error) {
    console.error('Error al marcar pedido en camino:', error);
    throw error;
  }
};

/**
 * Marca un pedido como entregado y genera código QR
 * @param {string} pedidoId - ID del pedido
 * @returns {Promise<void>}
 */
export const marcarEntregado = async (pedidoId) => {
  try {
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    const pedidoDoc = await getDoc(pedidoRef);

    if (!pedidoDoc.exists()) {
      throw new Error('El pedido no existe');
    }

    // Generar código QR automáticamente
    const codigoQR = generarCodigoQR(pedidoId);

    await updateDoc(pedidoRef, {
      estado: 'entregado',
      codigoQR: codigoQR,
      fechaEntregado: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('Pedido marcado como entregado');
  } catch (error) {
    console.error('Error al marcar pedido como entregado:', error);
    throw error;
  }
};

/**
 * Cancela un pedido
 * @param {string} pedidoId - ID del pedido
 * @param {string} userId - ID del usuario (solicitante o repartidor)
 * @returns {Promise<void>}
 */
export const cancelarPedido = async (pedidoId, userId) => {
  try {
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    const pedidoDoc = await getDoc(pedidoRef);

    if (!pedidoDoc.exists()) {
      throw new Error('El pedido no existe');
    }

    const pedidoData = pedidoDoc.data();

    // Solo el solicitante o el repartidor pueden cancelar
    if (pedidoData.solicitanteId !== userId && pedidoData.repartidorId !== userId) {
      throw new Error('No tienes permiso para cancelar este pedido');
    }

    // No se puede cancelar si ya está entregado
    if (pedidoData.estado === 'entregado') {
      throw new Error('No se puede cancelar un pedido ya entregado');
    }

    await updateDoc(pedidoRef, {
      estado: 'cancelado',
      updatedAt: serverTimestamp(),
    });

    console.log('Pedido cancelado');
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    throw error;
  }
};

/**
 * Elimina un pedido
 * @param {string} pedidoId - ID del pedido
 * @param {string} userId - ID del solicitante
 * @returns {Promise<void>}
 */
export const eliminarPedido = async (pedidoId, userId) => {
  try {
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    const pedidoDoc = await getDoc(pedidoRef);

    if (!pedidoDoc.exists()) {
      throw new Error('El pedido no existe');
    }

    const pedidoData = pedidoDoc.data();

    // Solo el solicitante puede eliminar
    if (pedidoData.solicitanteId !== userId) {
      throw new Error('Solo el solicitante puede eliminar este pedido');
    }

    // Solo se pueden eliminar pedidos pendientes
    if (pedidoData.estado !== 'pendiente') {
      throw new Error('Solo se pueden eliminar pedidos pendientes');
    }

    await deleteDoc(pedidoRef);
    console.log('Pedido eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    throw error;
  }
};

/**
 * Genera un código QR simple para el pedido
 * @param {string} pedidoId - ID del pedido
 * @returns {string} Código QR (puede ser un hash o ID único)
 */
export const generarCodigoQR = (pedidoId) => {
  // Generar código simple basado en el ID y timestamp
  const timestamp = Date.now();
  return `QR-${pedidoId.substring(0, 8)}-${timestamp.toString(36).toUpperCase()}`;
};

/**
 * Crea un pedido con múltiples items (carrito)
 * @param {Object} orderData - Datos del pedido con carrito
 * @param {Object} user - Usuario que crea el pedido
 * @returns {Promise<string>} ID del pedido creado
 */
export const crearPedidoConCarrito = async (orderData, user) => {
  try {
    console.log('Usuario recibido en crearPedidoConCarrito:', user);

    if (!user || !user.uid) {
      throw new Error('Usuario no válido. Debes iniciar sesión.');
    }

    const pedidoData = {
      restaurante: orderData.restaurante,
      restauranteId: orderData.restauranteId,
      items: orderData.items, // Array de items con {id, nombre, precio, cantidad}
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      total: orderData.total,
      puntoEntrega: orderData.puntoEntrega,
      instrucciones: orderData.instrucciones || '',
      metodoPago: orderData.metodoPago,
      solicitanteId: user.uid || user.id,
      solicitanteNombre: user.displayName || user.nombre || 'Usuario',
      solicitanteEmail: user.email || user.correo,
      estado: 'pendiente', // pendiente, aceptado, en-camino, entregado, cancelado
      repartidorId: null,
      repartidorNombre: null,
      fecha: Date.now(), // Usar timestamp numérico
      fechaAceptado: null,
      fechaEntregado: null,
      codigoQR: null, // Se generará al ser entregado
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log('Datos del pedido a crear:', pedidoData);

    const docRef = await addDoc(collection(db, 'pedidos'), pedidoData);
    console.log('Pedido con carrito creado con ID:', docRef.id);

    return docRef.id;
  } catch (error) {
    console.error('Error al crear pedido con carrito:', error);
    console.error('Error completo:', error.message);
    throw error;
  }
};

/**
 * Obtiene pedidos pendientes (disponibles para aceptar)
 * @returns {Promise<Array>} Lista de pedidos pendientes
 */
export const obtenerPedidosPendientes = async () => {
  try {
    const q = query(
      collection(db, 'pedidos'),
      where('estado', '==', 'pendiente'),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const pedidos = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pedidos.push({
        id: doc.id,
        ...data,
        fecha: data.fecha || Date.now(),
      });
    });

    return pedidos;
  } catch (error) {
    console.error('Error al obtener pedidos pendientes:', error);
    throw error;
  }
};

/**
 * Obtiene pedidos activos de un repartidor (aceptado, en-camino, entregado)
 * @param {string} userId - ID del repartidor
 * @returns {Promise<Array>} Lista de pedidos activos
 */
export const obtenerMisPedidosActivos = async (userId) => {
  try {
    const q = query(
      collection(db, 'pedidos'),
      where('repartidorId', '==', userId),
      where('estado', 'in', ['aceptado', 'en-camino', 'entregado']),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const pedidos = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pedidos.push({
        id: doc.id,
        ...data,
        fecha: data.fecha || Date.now(),
      });
    });

    return pedidos;
  } catch (error) {
    console.error('Error al obtener pedidos activos:', error);
    throw error;
  }
};

/**
 * Escucha pedidos pendientes en tiempo real
 * @param {Function} callback - Función callback con los pedidos actualizados
 * @returns {Function} Función para cancelar la suscripción
 */
export const escucharPedidosPendientes = (callback) => {
  const q = query(
    collection(db, 'pedidos'),
    where('estado', '==', 'pendiente'),
    orderBy('fecha', 'desc')
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const pedidos = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pedidos.push({
          id: doc.id,
          ...data,
          fecha: data.fecha || Date.now(),
        });
      });
      callback(pedidos);
    },
    (error) => {
      console.error('Error escuchando pedidos pendientes:', error);
    }
  );
};

/**
 * Escucha pedidos activos de un repartidor en tiempo real
 * @param {string} userId - ID del repartidor
 * @param {Function} callback - Función callback con los pedidos actualizados
 * @returns {Function} Función para cancelar la suscripción
 */
export const escucharMisPedidosActivos = (userId, callback) => {
  const q = query(
    collection(db, 'pedidos'),
    where('repartidorId', '==', userId),
    where('estado', 'in', ['aceptado', 'en-camino', 'entregado']),
    orderBy('fecha', 'desc')
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const pedidos = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pedidos.push({
          id: doc.id,
          ...data,
          fecha: data.fecha || Date.now(),
        });
      });
      callback(pedidos);
    },
    (error) => {
      console.error('Error escuchando pedidos activos:', error);
    }
  );
};

/**
 * Escucha los pedidos creados por un usuario en tiempo real
 * @param {string} userId - ID del usuario solicitante
 * @param {Function} callback - Función callback con los pedidos actualizados
 * @returns {Function} Función para cancelar la suscripción
 */
export const escucharMisPedidosCreados = (userId, callback) => {
  const q = query(
    collection(db, 'pedidos'),
    where('solicitanteId', '==', userId),
    orderBy('fecha', 'desc')
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const pedidos = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pedidos.push({
          id: doc.id,
          ...data,
          fecha: data.fecha || Date.now(),
        });
      });
      callback(pedidos);
    },
    (error) => {
      console.error('Error escuchando mis pedidos creados:', error);
    }
  );
};
