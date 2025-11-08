/**
 * Script para reasignar materiales existentes a sus carpetas correctas
 *
 * USO:
 * npm run reassign:folders
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_FILE = path.join(__dirname, '..', 'materiales.csv');
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');

// Inicializar Firebase
try {
  const serviceAccountKey = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
  });
  console.log('✅ Firebase Admin inicializado\n');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

const db = admin.firestore();

/**
 * Busca una carpeta por su ruta completa
 */
async function buscarCarpetaPorRuta(ruta) {
  if (!ruta || ruta.trim() === '') {
    return null;
  }

  const partes = ruta.split('/').map(p => p.trim()).filter(p => p !== '');
  let carpetaPadreId = null;

  for (const nombreCarpeta of partes) {
    const q = db.collection('folders')
      .where('nombre', '==', nombreCarpeta)
      .where('carpetaPadreId', '==', carpetaPadreId)
      .limit(1);

    const snapshot = await q.get();

    if (snapshot.empty) {
      return null; // Carpeta no encontrada
    }

    carpetaPadreId = snapshot.docs[0].id;
  }

  return carpetaPadreId;
}

async function main() {
  console.log('=================================================');
  console.log('  REASIGNACIÓN DE MATERIALES A CARPETAS');
  console.log('=================================================\n');

  // Leer CSV
  console.log('📖 Leyendo CSV...');
  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const registros = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true
  });

  console.log(`   Total de registros en CSV: ${registros.length}\n`);

  // Crear un mapa: URL -> carpetaRuta
  const urlToCarpeta = new Map();
  registros.forEach(registro => {
    if (registro.archivoUrl && registro.archivoUrl.trim() !== '') {
      urlToCarpeta.set(registro.archivoUrl.trim(), registro.carpetaRuta?.trim() || null);
    }
  });

  console.log(`   URLs únicas en CSV: ${urlToCarpeta.size}\n`);

  // Obtener todos los materiales de Firestore
  console.log('📥 Obteniendo materiales de Firestore...');
  const materialesSnapshot = await db.collection('material').get();
  console.log(`   Total de materiales en Firestore: ${materialesSnapshot.size}\n`);

  // Procesar materiales
  console.log('🔄 Procesando materiales...\n');

  const stats = {
    procesados: 0,
    asignados: 0,
    noEncontrados: 0,
    sinCarpeta: 0,
    carpetaNoExiste: 0
  };

  const batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;

  for (const doc of materialesSnapshot.docs) {
    const material = doc.data();
    stats.procesados++;

    // Buscar la ruta de carpeta en el CSV por URL
    const rutaCarpeta = urlToCarpeta.get(material.archivoUrl);

    if (!rutaCarpeta) {
      // Este material no tiene carpeta en el CSV
      stats.sinCarpeta++;
      continue;
    }

    // Buscar el ID de la carpeta
    const carpetaId = await buscarCarpetaPorRuta(rutaCarpeta);

    if (!carpetaId) {
      // La carpeta no existe en Firestore
      stats.carpetaNoExiste++;
      console.warn(`   ⚠️  Carpeta no encontrada: ${rutaCarpeta}`);
      continue;
    }

    // Actualizar el material
    batch.update(doc.ref, { carpetaId });
    batchCount++;
    stats.asignados++;

    // Commit batch si alcanzamos el límite
    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      console.log(`   ✓ Actualizados ${stats.asignados}/${stats.procesados} materiales...`);
      batchCount = 0;
    }
  }

  // Commit batch final
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log('\n=================================================');
  console.log('  RESUMEN');
  console.log('=================================================');
  console.log(`Total procesados:         ${stats.procesados}`);
  console.log(`✅ Asignados a carpetas:  ${stats.asignados}`);
  console.log(`⚠️  Sin carpeta en CSV:    ${stats.sinCarpeta}`);
  console.log(`❌ Carpeta no existe:     ${stats.carpetaNoExiste}`);
  console.log('=================================================\n');

  if (stats.asignados > 0) {
    console.log('🎉 ¡Materiales reasignados exitosamente!\n');
    console.log('📋 Ve a /material para ver los archivos organizados en carpetas\n');
  } else {
    console.log('⚠️  No se asignaron materiales. Verifica que las carpetas existan.\n');
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
