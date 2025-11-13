/**
 * Script para crear carpetas en Firestore para la sección de Material
 * basándose en el archivo EnfermeriaUC.csv
 *
 * Este script:
 * 1. Lee el archivo EnfermeriaUC.csv
 * 2. Extrae las carpetas únicas de la columna 'rutaCarpeta'
 * 3. Crea las carpetas en Firestore dentro de la sección Material
 * 4. Genera también las carpetas en Google Drive
 *
 * USO:
 * node scripts/create-material-folders-from-csv.js
 */

import admin from 'firebase-admin';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// CONFIGURACIÓN
// ============================================

const CSV_FILE = path.join(__dirname, '..', 'EnfermeriaUC.csv');
const CREDENTIALS_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');

// IMPORTANTE: Configura este ID en variables de entorno o archivo .env
// Esta es la carpeta raíz de "Material" en Google Drive
// Debe estar compartida con el Service Account como "Editor"
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '1qQwtcpIaEusfGFtXyT7BlrVTLuYWmTyK';

let SERVICE_ACCOUNT_EMAIL;

// ============================================
// INICIALIZAR FIREBASE ADMIN
// ============================================

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

// ============================================
// INICIALIZAR GOOGLE DRIVE API
// ============================================

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

// ============================================
// FUNCIONES AUXILIARES
// ============================================

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
 * Busca una carpeta por nombre dentro de una carpeta padre específica
 */
async function buscarCarpetaPorNombre(nombre, carpetaPadreId = null) {
  try {
    const query = db.collection('folders')
      .where('nombre', '==', nombre)
      .where('seccion', '==', 'material');

    if (carpetaPadreId === null) {
      const snapshot = await query.where('carpetaPadreId', '==', null).limit(1).get();
      return snapshot.empty ? null : snapshot.docs[0].id;
    } else {
      const snapshot = await query.where('carpetaPadreId', '==', carpetaPadreId).limit(1).get();
      return snapshot.empty ? null : snapshot.docs[0].id;
    }
  } catch (error) {
    console.error(`   ❌ Error al buscar carpeta "${nombre}":`, error.message);
    return null;
  }
}

/**
 * Crea una carpeta en Firestore y Google Drive
 */
async function crearCarpeta(nombre, carpetaPadreId = null, parentDriveId = ROOT_FOLDER_ID) {
  try {
    // Crear en Google Drive primero
    console.log(`   🏗️  Creando "${nombre}" en Google Drive...`);
    const driveId = await crearCarpetaEnDrive(nombre, parentDriveId);

    if (!driveId) {
      console.log(`   ❌ Error al crear en Google Drive`);
      return null;
    }

    console.log(`   ✓ Creada en Drive: ${driveId}`);

    // Compartir con el bot
    console.log(`   🔗 Compartiendo con el bot...`);
    await compartirCarpeta(driveId);

    // Crear en Firestore
    const carpetaData = {
      nombre: nombre,
      descripcion: '',
      seccion: 'material',
      carpetaPadreId: carpetaPadreId,
      googleDriveFolderId: driveId,
      creadoEn: admin.firestore.FieldValue.serverTimestamp(),
      actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('folders').add(carpetaData);
    console.log(`   ✅ Carpeta creada en Firestore: ${docRef.id}`);

    return { id: docRef.id, driveId: driveId };
  } catch (error) {
    console.error(`   ❌ Error al crear carpeta "${nombre}":`, error.message);
    return null;
  }
}

/**
 * Obtiene o crea una carpeta por ruta
 * Ejemplo: "Educación para las salud" -> crea/busca esta carpeta
 */
async function obtenerOCrearCarpeta(nombreCarpeta) {
  // Limpiar el nombre
  nombreCarpeta = nombreCarpeta.trim();

  if (!nombreCarpeta) {
    return null;
  }

  // Buscar si ya existe
  const carpetaExistente = await buscarCarpetaPorNombre(nombreCarpeta, null);

  if (carpetaExistente) {
    console.log(`   ℹ️  Carpeta "${nombreCarpeta}" ya existe`);
    return carpetaExistente;
  }

  // Si no existe, crearla
  console.log(`\n📁 Creando carpeta: ${nombreCarpeta}`);
  const resultado = await crearCarpeta(nombreCarpeta, null, ROOT_FOLDER_ID);

  return resultado ? resultado.id : null;
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function crearEstructuraDeCarpetas() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🏗️  CREANDO ESTRUCTURA DE CARPETAS PARA MATERIAL\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Verificar que existe el archivo CSV
    if (!fs.existsSync(CSV_FILE)) {
      console.error(`❌ Error: No se encontró el archivo ${CSV_FILE}`);
      process.exit(1);
    }

    // 2. Leer y parsear el CSV
    console.log('📖 Leyendo archivo CSV...\n');
    const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');

    let registros;
    try {
      registros = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      console.log(`✅ CSV parseado correctamente: ${registros.length} registros encontrados\n`);
    } catch (error) {
      console.error('❌ Error al parsear el CSV:', error.message);
      process.exit(1);
    }

    // 3. Extraer carpetas únicas
    console.log('📂 Extrayendo carpetas únicas del CSV...\n');
    const carpetasUnicas = new Set();

    registros.forEach(registro => {
      if (registro.rutaCarpeta && registro.rutaCarpeta.trim() !== '') {
        carpetasUnicas.add(registro.rutaCarpeta.trim());
      }
    });

    const carpetasArray = Array.from(carpetasUnicas).sort();
    console.log(`✅ Encontradas ${carpetasArray.length} carpetas únicas:\n`);
    carpetasArray.forEach((carpeta, index) => {
      console.log(`   ${index + 1}. ${carpeta}`);
    });
    console.log('');

    // 4. Crear carpetas
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔄 CREANDO CARPETAS\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const stats = {
      total: carpetasArray.length,
      creadas: 0,
      yaExistian: 0,
      errores: 0
    };

    for (let i = 0; i < carpetasArray.length; i++) {
      const nombreCarpeta = carpetasArray[i];
      console.log(`\n[${i + 1}/${carpetasArray.length}] 📁 ${nombreCarpeta}`);

      const resultado = await obtenerOCrearCarpeta(nombreCarpeta);

      if (resultado) {
        const carpetaDoc = await db.collection('folders').doc(resultado).get();
        if (carpetaDoc.exists && carpetaDoc.data().googleDriveFolderId) {
          stats.creadas++;
        } else {
          stats.yaExistian++;
        }
      } else {
        stats.errores++;
      }
    }

    // 5. Resumen
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 RESUMEN\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Total de carpetas:   ${stats.total}`);
    console.log(`✅ Creadas:          ${stats.creadas}`);
    console.log(`ℹ️  Ya existían:      ${stats.yaExistian}`);
    console.log(`❌ Errores:          ${stats.errores}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (stats.errores === 0) {
      console.log('🎉 Estructura de carpetas creada exitosamente!\n');
    } else {
      console.log('⚠️  Proceso completado con algunos errores.\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('\nStack trace:', error.stack);
  }
}

// ============================================
// EJECUTAR
// ============================================

crearEstructuraDeCarpetas()
  .then(() => {
    console.log('✅ Script finalizado\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
