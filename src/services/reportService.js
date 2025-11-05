import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Tipos de reporte soportados
 */
export const REPORT_TYPES = {
  SPAM: 'spam',
  INAPPROPRIATE: 'inappropriate',
  FALSE_INFO: 'false_info',
  HARASSMENT: 'harassment',
  OTHER: 'other',
};

/**
 * Tipos de contenido reportable
 */
export const CONTENT_TYPES = {
  FAVOR: 'favor',
  ANUNCIO: 'anuncio',
  MARKETPLACE: 'marketplace',
  MATERIAL: 'material',
  USUARIO: 'usuario',
  COMENTARIO: 'comentario',
};

/**
 * Crea un reporte en Firestore
 * @param {Object} reportData - Datos del reporte
 * @param {string} reportData.contentType - Tipo de contenido ('favor', 'anuncio', 'marketplace', 'material', 'usuario')
 * @param {string} reportData.contentId - ID del contenido reportado
 * @param {string} reportData.reportType - Tipo de reporte (REPORT_TYPES)
 * @param {string} reportData.description - Descripción adicional (opcional)
 * @param {string} reportData.reporterId - ID del usuario que reporta
 * @param {string} reportData.reporterName - Nombre del usuario que reporta
 * @param {string} reportData.contentAuthorId - ID del autor del contenido (opcional)
 * @param {string} reportData.contentTitle - Título del contenido (opcional)
 * @returns {Promise<string>} ID del reporte creado
 */
export const crearReporte = async (reportData) => {
  try {
    const {
      contentType,
      contentId,
      reportType,
      description = '',
      reporterId,
      reporterName,
      contentAuthorId = '',
      contentTitle = '',
    } = reportData;

    // Validaciones
    if (!contentType || !contentId || !reportType || !reporterId) {
      throw new Error('Faltan datos requeridos para crear el reporte');
    }

    if (!Object.values(CONTENT_TYPES).includes(contentType)) {
      throw new Error('Tipo de contenido inválido');
    }

    if (!Object.values(REPORT_TYPES).includes(reportType)) {
      throw new Error('Tipo de reporte inválido');
    }

    // Verificar si el usuario ya reportó este contenido
    const existingReport = await verificarReporteExistente(
      reporterId,
      contentType,
      contentId
    );

    if (existingReport) {
      throw new Error('Ya has reportado este contenido anteriormente');
    }

    // Crear el reporte
    const reportesRef = collection(db, 'reportes');
    const reporte = {
      contentType,
      contentId,
      reportType,
      description,
      reporterId,
      reporterName,
      contentAuthorId,
      contentTitle,
      estado: 'pendiente', // 'pendiente', 'revisado', 'resuelto', 'descartado'
      fechaCreacion: serverTimestamp(),
      fechaRevision: null,
      revisadoPor: null,
      notas: '',
    };

    const docRef = await addDoc(reportesRef, reporte);
    console.log('✅ Reporte creado:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error al crear reporte:', error);
    throw error;
  }
};

/**
 * Verifica si un usuario ya reportó un contenido específico
 * @param {string} reporterId - ID del usuario que reporta
 * @param {string} contentType - Tipo de contenido
 * @param {string} contentId - ID del contenido
 * @returns {Promise<boolean>} true si ya existe un reporte
 */
export const verificarReporteExistente = async (
  reporterId,
  contentType,
  contentId
) => {
  try {
    const reportesRef = collection(db, 'reportes');
    const q = query(
      reportesRef,
      where('reporterId', '==', reporterId),
      where('contentType', '==', contentType),
      where('contentId', '==', contentId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('❌ Error al verificar reporte existente:', error);
    return false;
  }
};

/**
 * Obtiene todos los reportes (solo para moderadores/admins)
 * @param {Object} options - Opciones de filtrado
 * @param {string} options.estado - Filtrar por estado (opcional)
 * @param {string} options.contentType - Filtrar por tipo de contenido (opcional)
 * @returns {Promise<Array>} Array de reportes
 */
export const obtenerReportes = async (options = {}) => {
  try {
    const { estado = null, contentType = null } = options;

    const reportesRef = collection(db, 'reportes');
    let q = query(reportesRef, orderBy('fechaCreacion', 'desc'));

    // Aplicar filtros si existen
    if (estado) {
      q = query(reportesRef, where('estado', '==', estado), orderBy('fechaCreacion', 'desc'));
    }

    if (contentType) {
      q = query(reportesRef, where('contentType', '==', contentType), orderBy('fechaCreacion', 'desc'));
    }

    const snapshot = await getDocs(q);
    const reportes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return reportes;
  } catch (error) {
    console.error('❌ Error al obtener reportes:', error);
    throw error;
  }
};

/**
 * Obtiene reportes de un contenido específico
 * @param {string} contentType - Tipo de contenido
 * @param {string} contentId - ID del contenido
 * @returns {Promise<Array>} Array de reportes del contenido
 */
export const obtenerReportesDeContenido = async (contentType, contentId) => {
  try {
    const reportesRef = collection(db, 'reportes');
    const q = query(
      reportesRef,
      where('contentType', '==', contentType),
      where('contentId', '==', contentId),
      orderBy('fechaCreacion', 'desc')
    );

    const snapshot = await getDocs(q);
    const reportes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return reportes;
  } catch (error) {
    console.error('❌ Error al obtener reportes de contenido:', error);
    throw error;
  }
};

/**
 * Obtiene la cantidad de reportes de un contenido
 * @param {string} contentType - Tipo de contenido
 * @param {string} contentId - ID del contenido
 * @returns {Promise<number>} Cantidad de reportes
 */
export const contarReportes = async (contentType, contentId) => {
  try {
    const reportes = await obtenerReportesDeContenido(contentType, contentId);
    return reportes.length;
  } catch (error) {
    console.error('❌ Error al contar reportes:', error);
    return 0;
  }
};

/**
 * Obtiene el label en español para un tipo de reporte
 * @param {string} reportType - Tipo de reporte
 * @returns {string} Label en español
 */
export const getReportTypeLabel = (reportType) => {
  switch (reportType) {
    case REPORT_TYPES.SPAM:
      return 'Spam o contenido no deseado';
    case REPORT_TYPES.INAPPROPRIATE:
      return 'Contenido inapropiado';
    case REPORT_TYPES.FALSE_INFO:
      return 'Información falsa o engañosa';
    case REPORT_TYPES.HARASSMENT:
      return 'Acoso o intimidación';
    case REPORT_TYPES.OTHER:
      return 'Otro';
    default:
      return reportType;
  }
};

/**
 * Obtiene el label en español para un tipo de contenido
 * @param {string} contentType - Tipo de contenido
 * @returns {string} Label en español
 */
export const getContentTypeLabel = (contentType) => {
  switch (contentType) {
    case CONTENT_TYPES.FAVOR:
      return 'Favor';
    case CONTENT_TYPES.ANUNCIO:
      return 'Anuncio';
    case CONTENT_TYPES.MARKETPLACE:
      return 'Producto de Marketplace';
    case CONTENT_TYPES.MATERIAL:
      return 'Material académico';
    case CONTENT_TYPES.USUARIO:
      return 'Usuario';
    case CONTENT_TYPES.COMENTARIO:
      return 'Comentario';
    default:
      return contentType;
  }
};
