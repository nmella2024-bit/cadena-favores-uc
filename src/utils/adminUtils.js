/**
 * Utilidades para verificar permisos de administrador
 */

import { getUserData } from '../services/userService';

/**
 * Roles disponibles en el sistema
 */
export const ROLES = {
  ADMIN: 'admin',
  EXCLUSIVO: 'exclusivo',
  NORMAL: 'normal',
};

/**
 * Verifica si un usuario tiene rol de administrador
 * @param {Object} usuario - Objeto del usuario con campo 'rol'
 * @returns {boolean} true si el usuario es admin
 */
export const esAdmin = (usuario) => {
  return usuario && usuario.rol === ROLES.ADMIN;
};

/**
 * Verifica si un usuario tiene rol exclusivo
 * @param {Object} usuario - Objeto del usuario con campo 'rol'
 * @returns {boolean} true si el usuario es exclusivo
 */
export const esExclusivo = (usuario) => {
  return usuario && usuario.rol === ROLES.EXCLUSIVO;
};

/**
 * Verifica si un usuario es admin o exclusivo
 * @param {Object} usuario - Objeto del usuario con campo 'rol'
 * @returns {boolean} true si el usuario es admin o exclusivo
 */
export const esAdminOExclusivo = (usuario) => {
  return esAdmin(usuario) || esExclusivo(usuario);
};

/**
 * Verifica si un usuario puede eliminar un contenido general
 * Los admins pueden eliminar cualquier contenido
 * Los usuarios normales solo pueden eliminar su propio contenido
 * @param {Object} usuario - Usuario actual
 * @param {string} autorId - ID del autor del contenido
 * @returns {boolean} true si puede eliminar
 */
export const puedeEliminar = (usuario, autorId) => {
  if (!usuario) return false;

  // Los admins pueden eliminar cualquier contenido
  if (esAdmin(usuario)) return true;

  // Los usuarios normales solo pueden eliminar su propio contenido
  return usuario.uid === autorId;
};

/**
 * Verifica si un usuario puede eliminar anuncios
 * Solo los admins pueden eliminar anuncios (exclusivos NO pueden)
 * @param {Object} usuario - Usuario actual
 * @returns {boolean} true si puede eliminar anuncios
 */
export const puedeEliminarAnuncios = (usuario) => {
  if (!usuario) return false;
  return esAdmin(usuario);
};

/**
 * Verifica si un usuario puede eliminar material
 * Solo los admins pueden eliminar material (exclusivos NO pueden)
 * @param {Object} usuario - Usuario actual
 * @returns {boolean} true si puede eliminar material
 */
export const puedeEliminarMaterial = (usuario) => {
  if (!usuario) return false;
  return esAdmin(usuario);
};

/**
 * Verifica si un usuario puede editar un contenido
 * Los admins pueden editar cualquier contenido
 * Los usuarios normales solo pueden editar su propio contenido
 * @param {Object} usuario - Usuario actual
 * @param {string} autorId - ID del autor del contenido
 * @returns {boolean} true si puede editar
 */
export const puedeEditar = (usuario, autorId) => {
  if (!usuario) return false;

  // Los admins pueden editar cualquier contenido
  if (esAdmin(usuario)) return true;

  // Los usuarios normales solo pueden editar su propio contenido
  return usuario.uid === autorId;
};

/**
 * Verifica si un usuario puede fijar contenido
 * Solo los admins y exclusivos pueden fijar contenido
 * @param {Object} usuario - Usuario actual
 * @returns {boolean} true si puede fijar
 */
export const puedeFijar = (usuario) => {
  if (!usuario) return false;
  return esAdminOExclusivo(usuario);
};

/**
 * Verifica si un usuario puede gestionar reportes (leer y actualizar)
 * Los admins y exclusivos pueden gestionar reportes
 * @param {Object} usuario - Usuario actual
 * @returns {boolean} true si puede gestionar reportes
 */
export const puedeGestionarReportes = (usuario) => {
  if (!usuario) return false;
  return esAdminOExclusivo(usuario);
};

/**
 * Verifica si un usuario puede eliminar reportes
 * Solo los admins pueden eliminar reportes
 * @param {Object} usuario - Usuario actual
 * @returns {boolean} true si puede eliminar reportes
 */
export const puedeEliminarReportes = (usuario) => {
  if (!usuario) return false;
  return esAdmin(usuario);
};

/**
 * Verifica si un usuario puede cambiar roles de otros usuarios
 * Solo los admins pueden cambiar roles
 * @param {Object} usuario - Usuario actual
 * @returns {boolean} true si puede cambiar roles
 */
export const puedeCambiarRoles = (usuario) => {
  if (!usuario) return false;
  return esAdmin(usuario);
};

/**
 * Obtiene el nivel de permisos de un usuario
 * @param {Object} usuario - Usuario actual
 * @returns {number} 0=sin permisos, 1=normal, 2=exclusivo, 3=admin
 */
export const getNivelPermisos = (usuario) => {
  if (!usuario) return 0;
  if (esAdmin(usuario)) return 3;
  if (esExclusivo(usuario)) return 2;
  return 1;
};

/**
 * Valida que un usuario sea admin y lanza error si no lo es
 * Útil para usar en funciones que requieren permisos de admin
 * @param {Object} usuario - Usuario actual
 * @throws {Error} Si el usuario no es admin
 */
export const validarAdmin = (usuario) => {
  if (!esAdmin(usuario)) {
    throw new Error('No tienes permisos de administrador para realizar esta acción');
  }
};

/**
 * Valida que un usuario tenga permisos para eliminar contenido
 * @param {Object} usuario - Usuario actual
 * @param {string} autorId - ID del autor del contenido
 * @throws {Error} Si el usuario no tiene permisos
 */
export const validarPermisoEliminar = (usuario, autorId) => {
  if (!puedeEliminar(usuario, autorId)) {
    throw new Error('No tienes permisos para eliminar este contenido');
  }
};

/**
 * Valida que un usuario tenga permisos para editar contenido
 * @param {Object} usuario - Usuario actual
 * @param {string} autorId - ID del autor del contenido
 * @throws {Error} Si el usuario no tiene permisos
 */
export const validarPermisoEditar = (usuario, autorId) => {
  if (!puedeEditar(usuario, autorId)) {
    throw new Error('No tienes permisos para editar este contenido');
  }
};

/**
 * Verifica si un usuario por ID es admin (consulta a Firestore)
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>} true si es admin
 */
export const verificarEsAdmin = async (userId) => {
  try {
    const userData = await getUserData(userId);
    return esAdmin(userData);
  } catch (error) {
    console.error('Error al verificar si es admin:', error);
    return false;
  }
};
