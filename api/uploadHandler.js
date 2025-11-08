import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';
import admin from 'firebase-admin';

// Configurar para que Vercel no parsee el body automáticamente
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Inicializar Firebase Admin (solo una vez por request)
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
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // 1. Autenticar con Google Drive usando las credenciales del Service Account
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

    // 2. Procesar el formulario para obtener el archivo y los datos
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // Límite de 50MB
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Extraer los datos del formulario
    const archivo = files.archivo?.[0] || files.archivo;
    const googleDriveFolderId = fields.folderId?.[0] || fields.folderId;
    const firestoreId = fields.firestoreId?.[0] || fields.firestoreId;
    const carpetaId = fields.carpetaId?.[0] || fields.carpetaId;
    const usuarioId = fields.usuarioId?.[0] || fields.usuarioId;

    // Extraer metadatos adicionales del material
    const titulo = fields.titulo?.[0] || fields.titulo;
    const descripcion = fields.descripcion?.[0] || fields.descripcion;
    const carrera = fields.carrera?.[0] || fields.carrera;
    const anio = fields.anio?.[0] || fields.anio;
    const ramo = fields.ramo?.[0] || fields.ramo;
    let tags = [];
    try {
      const tagsField = fields.tags?.[0] || fields.tags;
      if (tagsField) {
        tags = JSON.parse(tagsField);
      }
    } catch (e) {
      console.warn('Error parseando tags:', e);
    }

    // Validar que tenemos todos los datos necesarios
    if (!archivo) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    if (!googleDriveFolderId) {
      return res.status(400).json({ error: 'No se proporcionó el ID de la carpeta de Google Drive' });
    }

    console.log('📤 Subiendo archivo:', archivo.originalFilename);
    console.log('📁 Carpeta de Drive:', googleDriveFolderId);

    // 3. Subir el archivo a Google Drive
    const fileMetadata = {
      name: archivo.originalFilename,
      parents: [googleDriveFolderId], // Ubicar en la carpeta específica
    };

    const media = {
      mimeType: archivo.mimetype,
      body: fs.createReadStream(archivo.filepath),
    };

    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    const fileId = driveResponse.data.id;
    const webViewLink = driveResponse.data.webViewLink;

    console.log('✅ Archivo subido a Drive:', fileId);

    // 4. Hacer el archivo público (cualquiera con el link puede verlo)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log('🌐 Archivo hecho público');

    // 5. Guardar la información en Firestore (si se proporcionó firestoreId)
    if (firestoreId) {
      const firestore = admin.firestore();
      const docRef = firestore.collection('materiales').doc(firestoreId);

      await docRef.update({
        archivos: admin.firestore.FieldValue.arrayUnion({
          nombre: archivo.originalFilename,
          link: webViewLink,
          tipo: archivo.mimetype,
          fechaSubida: new Date().toISOString(),
          subidoPor: usuarioId || 'desconocido',
        }),
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('💾 Link guardado en Firestore');
    } else if (carpetaId && usuarioId) {
      // Si no hay firestoreId, crear un nuevo documento de material
      const firestore = admin.firestore();

      // Determinar tipo de archivo
      const tipoArchivo = archivo.mimetype.includes('pdf') ? 'PDF' :
                         archivo.mimetype.includes('word') || archivo.originalFilename.endsWith('.docx') ? 'DOCX' :
                         'Otro';

      const nuevoMaterial = {
        titulo: titulo || archivo.originalFilename.replace(/\.[^/.]+$/, ''), // Usar título o nombre sin extensión
        descripcion: descripcion || '',
        carrera: carrera || '',
        anio: anio ? parseInt(anio) : null,
        ramo: ramo || '',
        tags: tags || [],
        tipo: tipoArchivo,
        archivoUrl: webViewLink, // Para compatibilidad con la estructura actual
        archivos: [{
          nombre: archivo.originalFilename,
          link: webViewLink,
          tipo: archivo.mimetype,
          fechaSubida: new Date().toISOString(),
          subidoPor: usuarioId,
        }],
        carpetaId: carpetaId,
        autorId: usuarioId,
        creadoPor: usuarioId,
        fechaSubida: admin.firestore.FieldValue.serverTimestamp(),
        creadoEn: admin.firestore.FieldValue.serverTimestamp(),
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
        fijado: false,
        vistas: 0,
      };

      const docRef = await firestore.collection('material').add(nuevoMaterial);
      console.log('📝 Nuevo material creado en Firestore:', docRef.id);
    }

    // 6. Limpiar el archivo temporal
    fs.unlinkSync(archivo.filepath);

    // 7. Responder al frontend
    return res.status(200).json({
      success: true,
      fileId: fileId,
      link: webViewLink,
      nombre: archivo.originalFilename,
      mensaje: 'Archivo subido exitosamente a Google Drive',
    });

  } catch (error) {
    console.error('❌ Error en uploadHandler:', error);
    return res.status(500).json({
      error: 'Error al subir el archivo',
      detalles: error.message,
    });
  }
}
