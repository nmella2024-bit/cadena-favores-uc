import admin from 'firebase-admin';

/**
 * Middleware para verificar autenticación de Firebase Auth
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - { success: boolean, user?: Object, error?: Object }
 */
export async function verifyAuth(req, res) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido. Incluye el header: Authorization: Bearer <token>'
      });
      return { success: false };
    }

    const token = authHeader.split('Bearer ')[1];

    // Verificar token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Agregar usuario al request para uso posterior
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
    };

    // Log de seguridad
    console.log('[AUTH SUCCESS]', {
      timestamp: new Date().toISOString(),
      userId: req.user.uid,
      endpoint: req.url,
      method: req.method,
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
    });

    return { success: true, user: req.user };
  } catch (error) {
    console.error('[AUTH ERROR]', {
      timestamp: new Date().toISOString(),
      error: error.message,
      code: error.code,
      endpoint: req.url,
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
    });

    res.status(403).json({
      error: 'Token inválido',
      message: error.message,
      code: error.code
    });
    return { success: false };
  }
}

/**
 * Middleware para verificar roles de usuario en Firestore
 * @param {Object} req - Request object (debe tener req.user de verifyAuth)
 * @param {Object} res - Response object
 * @param {Array<string>} allowedRoles - Roles permitidos: ['admin', 'exclusivo', 'normal']
 * @returns {Object} - { success: boolean, role?: string, error?: Object }
 */
export async function verifyRole(req, res, allowedRoles = []) {
  try {
    // Verificar que el usuario esté autenticado primero
    if (!req.user || !req.user.uid) {
      res.status(401).json({
        error: 'Usuario no autenticado',
        message: 'Primero debe autenticarse con verifyAuth()'
      });
      return { success: false };
    }

    // Obtener rol del usuario desde Firestore
    const userDoc = await admin.firestore()
      .collection('usuarios')
      .doc(req.user.uid)
      .get();

    if (!userDoc.exists) {
      res.status(403).json({
        error: 'Usuario no encontrado en la base de datos',
        message: 'El usuario autenticado no tiene un perfil registrado'
      });
      return { success: false };
    }

    const userData = userDoc.data();
    const userRole = userData.rol;

    // Verificar si el rol está permitido
    if (!allowedRoles.includes(userRole)) {
      console.warn('[ROLE DENIED]', {
        timestamp: new Date().toISOString(),
        userId: req.user.uid,
        userRole: userRole,
        requiredRoles: allowedRoles,
        endpoint: req.url,
      });

      res.status(403).json({
        error: 'Permisos insuficientes',
        message: `Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
        userRole: userRole,
      });
      return { success: false };
    }

    // Agregar rol al objeto user
    req.user.rol = userRole;

    // Log de seguridad
    console.log('[ROLE CHECK SUCCESS]', {
      timestamp: new Date().toISOString(),
      userId: req.user.uid,
      userRole: userRole,
      endpoint: req.url,
    });

    return { success: true, role: userRole };
  } catch (error) {
    console.error('[ROLE ERROR]', {
      timestamp: new Date().toISOString(),
      userId: req.user?.uid || 'unknown',
      error: error.message,
      endpoint: req.url,
    });

    res.status(500).json({
      error: 'Error verificando permisos',
      message: error.message
    });
    return { success: false };
  }
}

/**
 * Validador de input para prevenir inyecciones
 * @param {string} input - String a validar
 * @param {string} fieldName - Nombre del campo (para mensajes de error)
 * @returns {Object} - { valid: boolean, sanitized?: string, error?: string }
 */
export function sanitizeInput(input, fieldName = 'input') {
  if (typeof input !== 'string') {
    return { valid: false, error: `${fieldName} debe ser un string` };
  }

  // Detectar intentos de inyección
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /__proto__/i,
    /constructor/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return {
        valid: false,
        error: `${fieldName} contiene caracteres no permitidos`
      };
    }
  }

  // Sanitizar: eliminar caracteres peligrosos
  const sanitized = input
    .replace(/[<>]/g, '') // Eliminar < y >
    .trim()
    .substring(0, 5000); // Limitar longitud

  return { valid: true, sanitized };
}

/**
 * Rate limiter simple basado en memoria
 * NOTA: Para producción, usar Redis/Upstash
 */
const rateLimitStore = new Map();

export function simpleRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;

  // Limpiar entradas viejas
  if (rateLimitStore.size > 10000) {
    rateLimitStore.clear();
  }

  // Obtener historial de requests
  const requests = rateLimitStore.get(key) || [];

  // Filtrar requests dentro de la ventana de tiempo
  const recentRequests = requests.filter(time => now - time < windowMs);

  // Verificar límite
  if (recentRequests.length >= maxRequests) {
    const oldestRequest = Math.min(...recentRequests);
    const resetTime = oldestRequest + windowMs;

    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      reset: new Date(resetTime).toISOString(),
    };
  }

  // Agregar request actual
  recentRequests.push(now);
  rateLimitStore.set(key, recentRequests);

  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - recentRequests.length,
    reset: new Date(now + windowMs).toISOString(),
  };
}
