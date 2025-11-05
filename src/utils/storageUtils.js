import { ref, deleteObject } from 'firebase/storage';
import { storage } from '../firebaseConfig';

/**
 * Extrae la ruta del archivo de Storage desde una URL de Firebase Storage
 * @param {string} storageUrl - URL completa de Firebase Storage
 * @returns {string|null} - Ruta del archivo o null si no se puede extraer
 */
export const extractStoragePath = (storageUrl) => {
  try {
    if (!storageUrl || typeof storageUrl !== 'string') {
      return null;
    }

    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';

    if (!storageUrl.startsWith(baseUrl)) {
      return null;
    }

    // Extraer el path después de /o/
    const pathStart = storageUrl.indexOf('/o/') + 3;
    const pathEnd = storageUrl.indexOf('?');

    if (pathStart === -1 || pathEnd === -1) {
      return null;
    }

    const filePath = decodeURIComponent(storageUrl.substring(pathStart, pathEnd));
    return filePath;
  } catch (error) {
    console.error('Error al extraer ruta de Storage:', error);
    return null;
  }
};

/**
 * Elimina un archivo de Firebase Storage usando su URL
 * @param {string} storageUrl - URL completa de Firebase Storage
 * @returns {Promise<boolean>} - true si se eliminó exitosamente, false si hubo error
 */
export const deleteFileFromStorage = async (storageUrl) => {
  try {
    if (!storageUrl || !storageUrl.includes('firebase')) {
      console.log('URL no es de Firebase Storage, omitiendo eliminación');
      return false;
    }

    const filePath = extractStoragePath(storageUrl);

    if (!filePath) {
      console.warn('No se pudo extraer la ruta del archivo de Storage');
      return false;
    }

    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log('Archivo eliminado de Storage:', filePath);
    return true;
  } catch (error) {
    // Error code 'storage/object-not-found' significa que el archivo ya no existe
    if (error.code === 'storage/object-not-found') {
      console.log('El archivo ya no existe en Storage');
      return true;
    }

    console.warn('Error al eliminar archivo de Storage:', error);
    return false;
  }
};

/**
 * Elimina múltiples archivos de Firebase Storage usando sus URLs
 * @param {string[]} storageUrls - Array de URLs de Firebase Storage
 * @returns {Promise<number>} - Cantidad de archivos eliminados exitosamente
 */
export const deleteMultipleFilesFromStorage = async (storageUrls) => {
  try {
    if (!Array.isArray(storageUrls) || storageUrls.length === 0) {
      return 0;
    }

    const deletePromises = storageUrls.map(url => deleteFileFromStorage(url));
    const results = await Promise.all(deletePromises);

    // Contar cuántos se eliminaron exitosamente
    const deletedCount = results.filter(result => result === true).length;

    console.log(`${deletedCount} de ${storageUrls.length} archivos eliminados de Storage`);
    return deletedCount;
  } catch (error) {
    console.error('Error al eliminar múltiples archivos de Storage:', error);
    return 0;
  }
};
