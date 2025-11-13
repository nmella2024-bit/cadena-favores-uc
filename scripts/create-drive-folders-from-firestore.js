/**
 * Script para crear carpetas en Google Drive basándose en la estructura de Firestore
 *
 * Este script:
 * 1. Lee todas las carpetas de Firestore
 * 2. Crea las carpetas que faltan en Google Drive
 * 3. Mantiene la jerarquía de carpetas
 * 4. Comparte automáticamente con el Service Account
 * 5. Actualiza Firestore con los googleDriveFolderId
 *
 * USO:
 * node scripts/create-drive-folders-from-firestore.js
 */

import admin from 'firebase-admin';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CREDENTIALS_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');

// IMPORTANTE: Configura este ID en variables de entorno o archivo .env
// Esta es la carpeta raíz en Google Drive donde se crearán las carpetas
// Debe estar compartida con el Service Account como "Editor"
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '1qQwtcpIaEusfGFtXyT7BlrVTLuYWmTyK';

let SERVICE_ACCOUNT_EMAIL;

// Inicializar Firebase Admin
console.log('🔧 Inicializando Firebase Admin...\n');
try {
  const serviceAccount = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));

  // Leer el email del service account del archivo de credenciales
  SERVICE_ACCOUNT_EMAIL = serviceAccount.client_email;

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  console.log('✅ Firebase Admin inicializado');
  console.log(`   Service Account: ${SERVICE_ACCOUNT_EMAIL}\n`);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Inicializar Google Drive API
console.log('🔧 Inicializando Google Drive API...\n');
let drive;
try {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));

  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  drive = google.drive({ version: 'v3', auth });
  console.log('✅ Google Drive API inicializada\n');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

/**
 * Crea una carpeta en Google Drive
 */
async function crearCarpetaEnDrive(nombre, parentId = null) {
  try {
    const fileMetadata = {
      name: nombre,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const response = await drive.files.create({
      resource: fileMetadata,
      fields: 'id, name',
    });

    return response.data.id;
  } catch (error) {
    console.error(`   ❌ Error al crear carpeta "${nombre}":`, error.message);
    return null;
  }
}

/**
 * Comparte una carpeta con el Service Account
 */
async function compartirCarpeta(folderId) {
  try {
    await drive.permissions.create({
      fileId: folderId,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: SERVICE_ACCOUNT_EMAIL,
      },
      sendNotificationEmail: false,
    });

    return true;
  } catch (error) {
    console.error(`   ⚠️  Error al compartir:`, error.message);
    return false;
  }
}

/**
 * Obtiene la ruta completa de una carpeta
 */
async function obtenerRutaCarpeta(carpetaId, carpetas) {
  const ruta = [];
  let carpetaActual = carpetas.find(c => c.id === carpetaId);

  while (carpetaActual) {
    ruta.unshift(carpetaActual.nombre);
    if (carpetaActual.carpetaPadreId) {
      carpetaActual = carpetas.find(c => c.id === carpetaActual.carpetaPadreId);
    } else {
      break;
    }
  }

  return ruta.join(' / ');
}

/**
 * Función principal
 */
async function crearEstructuraDrive() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🏗️  CREANDO ESTRUCTURA EN GOOGLE DRIVE\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Obtener todas las carpetas de Firestore
    console.log('📂 Obteniendo carpetas de Firestore...\n');
    const snapshot = await db.collection('folders').get();
    const carpetas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`   Encontradas ${carpetas.length} carpetas\n`);

    // 2. Ordenar por nivel (primero las raíz, luego las hijas)
    const carpetasPorNivel = [];
    const carpetasRestantes = [...carpetas];

    // Primero las carpetas raíz
    let carpetasActuales = carpetasRestantes.filter(c => !c.carpetaPadreId);
    while (carpetasActuales.length > 0) {
      carpetasPorNivel.push(...carpetasActuales);
      carpetasRestantes.splice(0, carpetasRestantes.length,
        ...carpetasRestantes.filter(c => !carpetasActuales.find(ca => ca.id === c.id))
      );

      // Siguiente nivel
      const idsActuales = carpetasActuales.map(c => c.id);
      carpetasActuales = carpetasRestantes.filter(c =>
        idsActuales.includes(c.carpetaPadreId)
      );
    }

    // Estadísticas
    let procesadas = 0;
    let creadas = 0;
    let yaExistian = 0;
    let errores = 0;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔄 CREANDO CARPETAS\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 3. Procesar cada carpeta en orden
    for (const carpeta of carpetasPorNivel) {
      procesadas++;
      const rutaCompleta = await obtenerRutaCarpeta(carpeta.id, carpetas);

      console.log(`\n[${procesadas}/${carpetas.length}] 📁 ${rutaCompleta}`);

      // Verificar si ya tiene googleDriveFolderId
      if (carpeta.googleDriveFolderId) {
        console.log(`   ✓ Ya existe en Drive: ${carpeta.googleDriveFolderId}`);
        yaExistian++;
        continue;
      }

      // Determinar el padre en Drive
      let parentDriveId = ROOT_FOLDER_ID;
      if (carpeta.carpetaPadreId) {
        const carpetaPadre = carpetas.find(c => c.id === carpeta.carpetaPadreId);
        if (carpetaPadre?.googleDriveFolderId) {
          parentDriveId = carpetaPadre.googleDriveFolderId;
        } else {
          console.log(`   ⚠️  Carpeta padre aún no procesada, saltando...`);
          continue;
        }
      }

      // Crear carpeta en Drive
      console.log(`   🏗️  Creando en Google Drive...`);
      const driveId = await crearCarpetaEnDrive(carpeta.nombre, parentDriveId);

      if (!driveId) {
        console.log(`   ❌ Error al crear carpeta`);
        errores++;
        continue;
      }

      console.log(`   ✓ Creada: ${driveId}`);

      // Compartir con el bot
      console.log(`   🔗 Compartiendo con el bot...`);
      await compartirCarpeta(driveId);
      console.log(`   ✓ Compartida`);

      // Actualizar Firestore
      console.log(`   💾 Actualizando Firestore...`);
      try {
        await db.collection('folders').doc(carpeta.id).update({
          googleDriveFolderId: driveId,
          actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
        });

        // IMPORTANTE: Actualizar también el objeto en memoria para que las carpetas hijas puedan usarlo
        carpeta.googleDriveFolderId = driveId;

        console.log(`   ✅ Completado`);
        creadas++;
      } catch (error) {
        console.log(`   ❌ Error al actualizar Firestore:`, error.message);
        errores++;
      }
    }

    // Resumen
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 RESUMEN\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Total procesadas:    ${procesadas}`);
    console.log(`✅ Creadas:           ${creadas}`);
    console.log(`ℹ️  Ya existían:       ${yaExistian}`);
    console.log(`❌ Errores:           ${errores}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (creadas > 0) {
      console.log('🎉 Estructura creada exitosamente!\n');
      console.log('   Ahora puedes subir archivos desde la aplicación\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('\nStack trace:', error.stack);
  }
}

// Ejecutar
crearEstructuraDrive()
  .then(() => {
    console.log('✅ Script finalizado\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
