import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';
import admin from 'firebase-admin';
import { verifyAuth, verifyRole, sanitizeInput, simpleRateLimit } from './_middleware.js';

// Configurar para que Vercel no parsee el body automáticamente
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // ========================================
  // SEGURIDAD: Solo permitir método POST
  // ========================================
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // ========================================
  // SEGURIDAD: Rate limiting
  // ========================================
  const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  const rateLimitResult = simpleRateLimit(clientIp, 10, 60000); // 10 requests por minuto

  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de 10 uploads por minuto',
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      reset: rateLimitResult.reset,
    });
  }

  // Agregar headers de rate limit
  res.setHeader('X-RateLimit-Limit', rateLimitResult.limit);
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
  res.setHeader('X-RateLimit-Reset', rateLimitResult.reset);

  // ========================================
  // SEGURIDAD: Inicializar Firebase Admin
  // ========================================
  if (!admin.apps.length) {
    try {
      if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.error('❌ FIREBASE_SERVICE_ACCOUNT no está configurado');
        return res.status(500).json({
          error: 'Configuración de servidor incompleta',
          detalles: 'La variable de entorno FIREBASE_SERVICE_ACCOUNT no está configurada en Vercel'
        });
      }

      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      console.log('✅ Firebase Admin inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Firebase Admin:', error);
      return res.status(500).json({
        error: 'Error de configuración del servidor',
        detalles: error.message
      });
    }
  }

  // ========================================
  // SEGURIDAD: Verificar autenticación
  // ========================================
  const authResult = await verifyAuth(req, res);
  if (!authResult.success) {
    return; // Ya se envió respuesta de error en verifyAuth
  }

  // ========================================
  // SEGURIDAD: Verificar rol (solo exclusivos y admins)
  // ========================================
  const roleResult = await verifyRole(req, res, ['exclusivo', 'admin']);
  if (!roleResult.success) {
    return; // Ya se envió respuesta de error en verifyRole
  }

  try {
    // ========================================
    // 1. Autenticar con Google Drive
    // ========================================
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT no está configurado para Google Drive');
      return res.status(500).json({
        error: 'Configuración de servidor incompleta',
        detalles: 'La variable de entorno FIREBASE_SERVICE_ACCOUNT no está configurada'
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });
    console.log('✅ Google Drive API autenticada correctamente');

    // ========================================
    // 2. Procesar el formulario
    // ========================================
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // Límite de 50MB
      keepExtensions: true,
      // SEGURIDAD: Filtrar tipos de archivo permitidos
      filter: function ({ mimetype }) {
        // Solo permitir ciertos tipos de archivo
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'image/jpeg',
          'image/png',
          'image/gif',
          'text/plain',
        ];

        return allowedTypes.includes(mimetype);
      }
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // ========================================
    // 3. Extraer y validar datos
    // ========================================
    const archivo = files.archivo?.[0] || files.archivo;
    const googleDriveFolderId = fields.folderId?.[0] || fields.folderId;
    const firestoreId = fields.firestoreId?.[0] || fields.firestoreId;
    const carpetaId = fields.carpetaId?.[0] || fields.carpetaId;
    const usuarioId = fields.usuarioId?.[0] || fields.usuarioId;

    // SEGURIDAD: Verificar que el usuarioId coincide con el usuario autenticado
    if (usuarioId && usuarioId !== req.user.uid) {
      return res.status(403).json({
        error: 'Permisos insuficientes',
        message: 'No puedes subir archivos en nombre de otro usuario'
      });
    }

    // Extraer metadatos adicionales del material
    const titulo = fields.titulo?.[0] || fields.titulo;
    const descripcion = fields.descripcion?.[0] || fields.descripcion;
    const carrera = fields.carrera?.[0] || fields.carrera;
    const anio = fields.anio?.[0] || fields.anio;
    const ramo = fields.ramo?.[0] || fields.ramo;

    // SEGURIDAD: Sanitizar inputs
    const sanitizedTitulo = titulo ? sanitizeInput(titulo, 'titulo') : null;
    const sanitizedDescripcion = descripcion ? sanitizeInput(descripcion, 'descripcion') : null;
    const sanitizedCarrera = carrera ? sanitizeInput(carrera, 'carrera') : null;
    const sanitizedRamo = ramo ? sanitizeInput(ramo, 'ramo') : null;

    if (sanitizedTitulo && !sanitizedTitulo.valid) {
      return res.status(400).json({ error: sanitizedTitulo.error });
    }
    if (sanitizedDescripcion && !sanitizedDescripcion.valid) {
      return res.status(400).json({ error: sanitizedDescripcion.error });
    }
    if (sanitizedCarrera && !sanitizedCarrera.valid) {
      return res.status(400).json({ error: sanitizedCarrera.error });
    }
    if (sanitizedRamo && !sanitizedRamo.valid) {
      return res.status(400).json({ error: sanitizedRamo.error });
    }

    let tags = [];
    try {
      const tagsField = fields.tags?.[0] || fields.tags;
      if (tagsField) {
        tags = JSON.parse(tagsField);
        // SEGURIDAD: Limitar número de tags
        if (tags.length > 10) {
          return res.status(400).json({
            error: 'Demasiados tags',
            message: 'Máximo 10 tags permitidos'
          });
        }
        // SEGURIDAD: Sanitizar cada tag
        tags = tags.map(tag => {
          const sanitized = sanitizeInput(tag, 'tag');
          return sanitized.valid ? sanitized.sanitized : '';
        }).filter(tag => tag.length > 0);
      }
    } catch (e) {
      console.warn('Error parseando tags:', e);
    }

    // ========================================
    // 4. Validaciones
    // ========================================
    if (!archivo) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    if (!googleDriveFolderId) {
      return res.status(400).json({ error: 'No se proporcionó el ID de la carpeta de Google Drive' });
    }

    // SEGURIDAD: Validar que el usuario tiene permisos sobre la carpeta
    if (carpetaId) {
      const carpetaDoc = await admin.firestore()
        .collection('folders')
        .doc(carpetaId)
        .get();

      if (!carpetaDoc.exists) {
        return res.status(404).json({
          error: 'Carpeta no encontrada',
          message: 'La carpeta especificada no existe en Firestore'
        });
      }

      // Solo admins y exclusivos pueden subir a cualquier carpeta
      // (ya verificado en verifyRole)
    }

    console.log('📤 Subiendo archivo:', archivo.originalFilename);
    console.log('📁 Carpeta de Drive:', googleDriveFolderId);
    console.log('👤 Usuario:', req.user.uid);

    // ========================================
    // 5. Subir archivo a Google Drive
    // ========================================
    const fileMetadata = {
      name: archivo.originalFilename,
      parents: [googleDriveFolderId],
    };

    const media = {
      mimeType: archivo.mimetype,
      body: fs.createReadStream(archivo.filepath),
    };

    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    const fileId = driveResponse.data.id;
    const webViewLink = driveResponse.data.webViewLink;

    console.log('✅ Archivo subido a Drive:', fileId);

    // ========================================
    // 6. Hacer el archivo público
    // ========================================
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });

    console.log('🌐 Archivo hecho público');

    // ========================================
    // 7. Guardar en Firestore
    // ========================================
    if (firestoreId) {
      // Actualizar material existente
      const firestore = admin.firestore();
      const docRef = firestore.collection('material').doc(firestoreId);

      // SEGURIDAD: Verificar que el material existe y el usuario tiene permisos
      const materialDoc = await docRef.get();
      if (!materialDoc.exists) {
        return res.status(404).json({
          error: 'Material no encontrado',
          message: 'El material especificado no existe'
        });
      }

      const materialData = materialDoc.data();

      // Solo el autor o admins pueden actualizar
      if (materialData.autorId !== req.user.uid && req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Permisos insuficientes',
          message: 'Solo el autor o admins pueden actualizar este material'
        });
      }

      await docRef.update({
        archivos: admin.firestore.FieldValue.arrayUnion({
          nombre: archivo.originalFilename,
          link: webViewLink,
          tipo: archivo.mimetype,
          fechaSubida: new Date().toISOString(),
          subidoPor: req.user.uid,
        }),
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('💾 Link guardado en Firestore (material existente)');
    } else if (carpetaId) {
      // Crear nuevo material
      const firestore = admin.firestore();

      const tipoArchivo = archivo.mimetype.includes('pdf') ? 'PDF' :
                         archivo.mimetype.includes('word') || archivo.originalFilename.endsWith('.docx') ? 'DOCX' :
                         'Otro';

      const nuevoMaterial = {
        titulo: sanitizedTitulo?.sanitized || archivo.originalFilename.replace(/\.[^/.]+$/, ''),
        descripcion: sanitizedDescripcion?.sanitized || '',
        carrera: sanitizedCarrera?.sanitized || '',
        anio: anio ? parseInt(anio) : null,
        ramo: sanitizedRamo?.sanitized || '',
        tags: tags || [],
        tipo: tipoArchivo,
        archivoUrl: webViewLink,
        archivos: [{
          nombre: archivo.originalFilename,
          link: webViewLink,
          tipo: archivo.mimetype,
          fechaSubida: new Date().toISOString(),
          subidoPor: req.user.uid,
        }],
        carpetaId: carpetaId,
        autorId: req.user.uid,
        creadoPor: req.user.uid,
        fechaSubida: admin.firestore.FieldValue.serverTimestamp(),
        creadoEn: admin.firestore.FieldValue.serverTimestamp(),
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
        fijado: false,
        vistas: 0,
      };

      const docRef = await firestore.collection('material').add(nuevoMaterial);
      console.log('📝 Nuevo material creado en Firestore:', docRef.id);
    }

    // ========================================
    // 8. Limpiar archivo temporal
    // ========================================
    fs.unlinkSync(archivo.filepath);

    // ========================================
    // 9. Log de auditoría
    // ========================================
    console.log('[UPLOAD SUCCESS]', {
      timestamp: new Date().toISOString(),
      userId: req.user.uid,
      fileName: archivo.originalFilename,
      fileId: fileId,
      carpetaId: carpetaId || firestoreId,
      fileSize: archivo.size,
      mimeType: archivo.mimetype,
    });

    // ========================================
    // 10. Responder al frontend
    // ========================================
    return res.status(200).json({
      success: true,
      fileId: fileId,
      link: webViewLink,
      nombre: archivo.originalFilename,
      mensaje: 'Archivo subido exitosamente a Google Drive',
    });

  } catch (error) {
    console.error('[UPLOAD ERROR]', {
      timestamp: new Date().toISOString(),
      userId: req.user?.uid || 'unknown',
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      error: 'Error al subir el archivo',
      detalles: error.message,
    });
  }
}
