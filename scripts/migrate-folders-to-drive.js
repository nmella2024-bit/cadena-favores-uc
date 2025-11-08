/**
 * Script para migrar carpetas de Firestore y vincularlas con Google Drive
 *
 * Este script:
 * 1. Lee todas las carpetas de Firestore
 * 2. Busca la carpeta correspondiente en Google Drive por nombre
 * 3. Agrega el campo googleDriveFolderId a Firestore
 * 4. Comparte la carpeta con el Service Account automáticamente
 *
 * USO:
 * node scripts/migrate-folders-to-drive.js
 *
 * REQUISITOS:
 * - Tener el archivo coherent-flame-475215-f0-4fff3af9eaec.json en la raíz
 * - Las carpetas deben existir en Google Drive con el mismo nombre
 */

import admin from 'firebase-admin';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Rutas de archivos
const CREDENTIALS_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');

// Email del Service Account (se leerá automáticamente del archivo)
let SERVICE_ACCOUNT_EMAIL;

// Inicializar Firebase Admin
console.log('🔧 Inicializando Firebase Admin...\n');
try {
  const serviceAccount = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));

  // Leer el email del service account
  SERVICE_ACCOUNT_EMAIL = serviceAccount.client_email;

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  console.log('✅ Firebase Admin inicializado');
  console.log(`   Service Account: ${SERVICE_ACCOUNT_EMAIL}\n`);
} catch (error) {
  console.error('❌ Error al inicializar Firebase Admin:', error.message);
  console.error('   Asegúrate de que el archivo coherent-flame-475215-f0-4fff3af9eaec.json existe\n');
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
  console.error('❌ Error al inicializar Google Drive API:', error.message);
  process.exit(1);
}

/**
 * Busca una carpeta en Google Drive por nombre y padre
 * @param {string} nombreCarpeta - Nombre de la carpeta a buscar
 * @param {string|null} parentId - ID de la carpeta padre (null para raíz)
 * @returns {Promise<string|null>} - ID de la carpeta o null si no se encuentra
 */
async function buscarCarpetaEnDrive(nombreCarpeta, parentId = null) {
  try {
    let query = `name='${nombreCarpeta.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, parents)',
      pageSize: 10,
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    return null;
  } catch (error) {
    console.error(`   ⚠️  Error al buscar carpeta "${nombreCarpeta}":`, error.message);
    return null;
  }
}

/**
 * Comparte una carpeta de Drive con el Service Account
 * @param {string} folderId - ID de la carpeta a compartir
 * @returns {Promise<boolean>} - true si se compartió exitosamente
 */
async function compartirCarpetaConBot(folderId) {
  try {
    // Verificar si ya tiene permisos
    const permissions = await drive.permissions.list({
      fileId: folderId,
      fields: 'permissions(emailAddress, role)',
    });

    const yaCompartida = permissions.data.permissions?.some(
      p => p.emailAddress === SERVICE_ACCOUNT_EMAIL
    );

    if (yaCompartida) {
      return true; // Ya tiene permisos
    }

    // Compartir con el Service Account
    await drive.permissions.create({
      fileId: folderId,
      requestBody: {
        type: 'user',
        role: 'writer', // Editor
        emailAddress: SERVICE_ACCOUNT_EMAIL,
      },
      sendNotificationEmail: false,
    });

    return true;
  } catch (error) {
    console.error(`   ⚠️  Error al compartir carpeta:`, error.message);
    return false;
  }
}

/**
 * Reconstruye la ruta completa de una carpeta
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
 * Función principal de migración
 */
async function migrarCarpetas() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🚀 INICIANDO MIGRACIÓN DE CARPETAS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Obtener todas las carpetas de Firestore
    console.log('📂 Obteniendo carpetas de Firestore...\n');
    const carpetasSnapshot = await db.collection('folders').get();
    const carpetas = carpetasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`   Encontradas ${carpetas.length} carpetas en Firestore\n`);

    if (carpetas.length === 0) {
      console.log('⚠️  No hay carpetas para migrar\n');
      return;
    }

    // Estadísticas
    let procesadas = 0;
    let exitosas = 0;
    let yaExistian = 0;
    let noEncontradas = 0;
    let errores = 0;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔄 PROCESANDO CARPETAS\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 2. Procesar cada carpeta
    for (const carpeta of carpetas) {
      procesadas++;
      const rutaCompleta = await obtenerRutaCarpeta(carpeta.id, carpetas);

      console.log(`\n[${procesadas}/${carpetas.length}] 📁 ${rutaCompleta}`);

      // Verificar si ya tiene googleDriveFolderId
      if (carpeta.googleDriveFolderId) {
        console.log(`   ✓ Ya tiene googleDriveFolderId: ${carpeta.googleDriveFolderId}`);
        yaExistian++;

        // Intentar compartir si aún no está compartida
        const compartida = await compartirCarpetaConBot(carpeta.googleDriveFolderId);
        if (compartida) {
          console.log(`   ✓ Compartida con el bot`);
        }

        continue;
      }

      // 3. Buscar carpeta padre en Drive (si tiene)
      let parentDriveId = null;
      if (carpeta.carpetaPadreId) {
        const carpetaPadre = carpetas.find(c => c.id === carpeta.carpetaPadreId);
        if (carpetaPadre?.googleDriveFolderId) {
          parentDriveId = carpetaPadre.googleDriveFolderId;
        }
      }

      // 4. Buscar la carpeta en Google Drive
      console.log(`   🔍 Buscando en Google Drive...`);
      const driveId = await buscarCarpetaEnDrive(carpeta.nombre, parentDriveId);

      if (!driveId) {
        console.log(`   ❌ No encontrada en Google Drive`);
        console.log(`   💡 Tip: Crea la carpeta "${carpeta.nombre}" en Drive o actualiza manualmente`);
        noEncontradas++;
        continue;
      }

      console.log(`   ✓ Encontrada: ${driveId}`);

      // 5. Compartir con el bot
      console.log(`   🔗 Compartiendo con el bot...`);
      const compartida = await compartirCarpetaConBot(driveId);

      if (compartida) {
        console.log(`   ✓ Compartida exitosamente`);
      } else {
        console.log(`   ⚠️  No se pudo compartir (puede que ya esté compartida)`);
      }

      // 6. Actualizar Firestore
      console.log(`   💾 Actualizando Firestore...`);
      try {
        await db.collection('folders').doc(carpeta.id).update({
          googleDriveFolderId: driveId,
          actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`   ✅ Migración exitosa`);
        exitosas++;
      } catch (error) {
        console.log(`   ❌ Error al actualizar Firestore:`, error.message);
        errores++;
      }
    }

    // 7. Resumen final
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 RESUMEN DE MIGRACIÓN\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Total procesadas:        ${procesadas}`);
    console.log(`✅ Migradas exitosamente: ${exitosas}`);
    console.log(`ℹ️  Ya tenían Drive ID:    ${yaExistian}`);
    console.log(`⚠️  No encontradas:        ${noEncontradas}`);
    console.log(`❌ Errores:               ${errores}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (noEncontradas > 0) {
      console.log('💡 SUGERENCIAS:\n');
      console.log('   Las carpetas no encontradas pueden ser:');
      console.log('   1. Nombres que no coinciden exactamente');
      console.log('   2. Carpetas que no existen en Google Drive');
      console.log('   3. Problemas de permisos\n');
      console.log('   Puedes:');
      console.log('   - Crear las carpetas manualmente en Drive');
      console.log('   - Renombrarlas para que coincidan');
      console.log('   - Volver a ejecutar este script\n');
    }

    if (exitosas > 0 || yaExistian > 0) {
      console.log('🎉 Migración completada!\n');
      console.log('   Ahora puedes subir archivos y se guardarán en Google Drive\n');
    }

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    console.error('\nStack trace:', error.stack);
  }
}

// Ejecutar migración
migrarCarpetas()
  .then(() => {
    console.log('✅ Script finalizado\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
