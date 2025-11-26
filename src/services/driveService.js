/**
 * Servicio para subir archivos a Google Drive usando el endpoint serverless
 */

/**
 * Sube un archivo a Google Drive y retorna el link
 * @param {File} archivo - El archivo a subir
 * @param {string} googleDriveFolderId - ID de la carpeta de Google Drive
 * @param {string} carpetaId - ID de la carpeta en Firestore
 * @param {string} usuarioId - ID del usuario que sube el archivo
 * @param {Object} metadatos - (Opcional) Metadatos adicionales del material (titulo, descripcion, carrera, anio, ramo, tags)
 * @param {string} firestoreId - (Opcional) ID del material existente para actualizar
 * @returns {Promise<Object>} Respuesta con {success, fileId, link, nombre}
 */
export const subirArchivoADrive = async (archivo, googleDriveFolderId, carpetaId, usuarioId, metadatos = {}, firestoreId = null, token) => {
  try {
    const formData = new FormData();

    // Agregar el archivo
    formData.append('archivo', archivo);

    // Agregar metadatos básicos
    formData.append('folderId', googleDriveFolderId);
    formData.append('carpetaId', carpetaId);
    formData.append('usuarioId', usuarioId);

    // Agregar metadatos adicionales del material
    if (metadatos.titulo) formData.append('titulo', metadatos.titulo);
    if (metadatos.descripcion) formData.append('descripcion', metadatos.descripcion);
    if (metadatos.carrera) formData.append('carrera', metadatos.carrera);
    if (metadatos.anio) formData.append('anio', metadatos.anio);
    if (metadatos.ramo) formData.append('ramo', metadatos.ramo);
    if (metadatos.tags && Array.isArray(metadatos.tags)) {
      formData.append('tags', JSON.stringify(metadatos.tags));
    }

    // Si hay un ID de Firestore, agregarlo para actualizar ese documento
    if (firestoreId) {
      formData.append('firestoreId', firestoreId);
    }

    console.log('📤 Subiendo archivo a Google Drive:', archivo.name);

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/uploadHandler', {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error HTTP:', response.status, response.statusText);
      console.error('❌ Detalles del error:', data);
      throw new Error(data.detalles || data.error || `Error ${response.status}: ${response.statusText}`);
    }

    if (data.success) {
      console.log('✅ Archivo subido exitosamente:', data.link);
      return data;
    } else {
      console.error('❌ Respuesta sin éxito:', data);
      throw new Error(data.detalles || data.error || 'Error desconocido al subir archivo');
    }
  } catch (error) {
    console.error('❌ Error en subirArchivoADrive:', error);
    console.error('❌ Stack trace:', error.stack);
    throw error;
  }
};

/**
 * Sube múltiples archivos a Google Drive
 * @param {Array<File>} archivos - Array de archivos
 * @param {string} googleDriveFolderId - ID de la carpeta de Google Drive
 * @param {string} carpetaId - ID de la carpeta en Firestore
 * @param {string} usuarioId - ID del usuario
 * @returns {Promise<Array>} Array con los resultados de cada subida
 */
export const subirMultiplesArchivosADrive = async (archivos, googleDriveFolderId, carpetaId, usuarioId, token) => {
  try {
    const promesas = archivos.map(archivo =>
      subirArchivoADrive(archivo, googleDriveFolderId, carpetaId, usuarioId, {}, null, token)
    );

    const resultados = await Promise.all(promesas);
    return resultados;
  } catch (error) {
    console.error('❌ Error al subir múltiples archivos:', error);
    throw error;
  }
};
