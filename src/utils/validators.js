/**
 * Valida si un correo electrónico pertenece a la UC.
 * @param {string} email - El correo a validar.
 * @returns {boolean} - true si es válido, false si no.
 */
export const isValidUCEmail = (email) => {
  const ucEmailRegex = /^[a-zA-Z0-9._-]+@(uc\.cl|estudiante\.uc\.cl)$/;
  return ucEmailRegex.test(email);
};

/**
 * Valida si una contraseña cumple con los requisitos mínimos.
 * @param {string} password - La contraseña a validar.
 * @returns {boolean} - true si es válida.
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};
