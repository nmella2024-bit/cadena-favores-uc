import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

/**
 * Publica un nuevo producto en el marketplace
 * @param {Object} productoData - Datos del producto
 * @param {Object} usuario - Usuario que publica
 * @param {File[]} imagenes - Archivos de imagen (opcional)
 * @returns {Promise<string>} ID del producto creado
 */
export const publicarProducto = async (productoData, usuario, imagenes = []) => {
  try {
    const imagenesURL = [];

    // Si hay imágenes, subirlas a Firebase Storage
    if (imagenes && imagenes.length > 0) {
      for (const imagen of imagenes) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const imagenRef = ref(storage, `marketplace/${usuario.uid}/${timestamp}_${random}_${imagen.name}`);
        const snapshot = await uploadBytes(imagenRef, imagen);
        const url = await getDownloadURL(snapshot.ref);
        imagenesURL.push(url);
      }
    }

    // Crear el producto en Firestore
    const docRef = await addDoc(collection(db, 'marketplace'), {
      titulo: productoData.titulo,
      descripcion: productoData.descripcion,
      precio: productoData.precio,
      autor: usuario.uid,
      autorNombre: usuario.nombre || usuario.displayName || 'Usuario',
      autorEmail: usuario.email || '',
      fecha: serverTimestamp(),
      imagenesURL: imagenesURL,
      estado: 'disponible', // disponible, vendido, reservado
    });

    return docRef.id;
  } catch (error) {
    console.error('Error al publicar producto:', error);
    throw error;
  }
};

/**
 * Obtiene todos los productos del marketplace ordenados por fecha
 * @returns {Promise<Array>} Lista de productos
 */
export const obtenerProductos = async () => {
  try {
    const q = query(collection(db, 'marketplace'), orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);

    const productos = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      productos.push({
        id: doc.id,
        ...data,
        // Convertir timestamp a objeto Date si existe
        fecha: data.fecha?.toDate ? data.fecha.toDate() : new Date(),
      });
    });

    return productos;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

/**
 * Obtiene los productos de un usuario específico
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de productos del usuario
 */
export const obtenerProductosUsuario = async (userId) => {
  try {
    const q = query(
      collection(db, 'marketplace'),
      where('autor', '==', userId),
      orderBy('fecha', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const productos = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      productos.push({
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate ? data.fecha.toDate() : new Date(),
      });
    });

    return productos;
  } catch (error) {
    console.error('Error al obtener productos del usuario:', error);
    throw error;
  }
};

/**
 * Obtiene un producto por ID
 * @param {string} productoId - ID del producto
 * @returns {Promise<Object>} Datos del producto
 */
export const obtenerProducto = async (productoId) => {
  try {
    const docRef = doc(db, 'marketplace', productoId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        fecha: data.fecha?.toDate ? data.fecha.toDate() : new Date(),
      };
    } else {
      throw new Error('Producto no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw error;
  }
};

/**
 * Actualiza un producto
 * @param {string} productoId - ID del producto
 * @param {Object} datosActualizados - Datos a actualizar
 * @returns {Promise<void>}
 */
export const actualizarProducto = async (productoId, datosActualizados) => {
  try {
    const docRef = doc(db, 'marketplace', productoId);
    await updateDoc(docRef, datosActualizados);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

/**
 * Elimina un producto
 * @param {string} productoId - ID del producto
 * @returns {Promise<void>}
 */
export const eliminarProducto = async (productoId) => {
  try {
    await deleteDoc(doc(db, 'marketplace', productoId));
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
};

/**
 * Verifica si un producto es nuevo (publicado en las últimas 48 horas)
 * @param {Date} fecha - Fecha del producto
 * @returns {boolean}
 */
export const esProductoNuevo = (fecha) => {
  const ahora = new Date();
  const diferencia = ahora - fecha;
  const dosDiasEnMs = 48 * 60 * 60 * 1000;
  return diferencia < dosDiasEnMs;
};

/**
 * Formatea el precio en formato chileno
 * @param {number} precio - Precio a formatear
 * @returns {string}
 */
export const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(precio);
};
