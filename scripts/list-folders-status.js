/**
 * Script para listar el estado de las carpetas
 *
 * Muestra qué carpetas tienen googleDriveFolderId y cuáles no
 *
 * USO:
 * node scripts/list-folders-status.js
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CREDENTIALS_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');

// Inicializar Firebase Admin
try {
  const serviceAccount = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

const db = admin.firestore();

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
async function listarEstado() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 ESTADO DE CARPETAS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const snapshot = await db.collection('folders').get();
    const carpetas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Total de carpetas: ${carpetas.length}\n`);

    const conDrive = carpetas.filter(c => c.googleDriveFolderId);
    const sinDrive = carpetas.filter(c => !c.googleDriveFolderId);

    console.log(`✅ Con Google Drive ID: ${conDrive.length}`);
    console.log(`⚠️  Sin Google Drive ID: ${sinDrive.length}\n`);

    if (conDrive.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ CARPETAS CON GOOGLE DRIVE\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      for (const carpeta of conDrive) {
        const ruta = await obtenerRutaCarpeta(carpeta.id, carpetas);
        console.log(`📁 ${ruta}`);
        console.log(`   ID Drive: ${carpeta.googleDriveFolderId}\n`);
      }
    }

    if (sinDrive.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('⚠️  CARPETAS SIN GOOGLE DRIVE\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      for (const carpeta of sinDrive) {
        const ruta = await obtenerRutaCarpeta(carpeta.id, carpetas);
        console.log(`📁 ${ruta}`);
        console.log(`   Firestore ID: ${carpeta.id}\n`);
      }

      console.log('💡 Ejecuta uno de estos scripts para migrar:\n');
      console.log('   npm run migrate:folders        - Buscar carpetas existentes');
      console.log('   npm run create:drive-folders   - Crear carpetas nuevas\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listarEstado()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
