/**
 * Script optimizado para reasignar materiales a carpetas
 * Usa caché para evitar búsquedas repetidas
 *
 * USO:
 * npm run reassign:folders:fast
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

// Cache global
const carpetasCache = new Map(); // key: ruta completa, value: carpetaId

/**
 * Carga TODAS las carpetas de Firestore en memoria
 */
async function cargarTodasLasCarpetas() {
  console.log('📥 Cargando todas las carpetas en caché...');
  const snapshot = await db.collection('folders').get();

  // Crear mapa de carpetas por ID
  const carpetasPorId = new Map();
  snapshot.docs.forEach(doc => {
    carpetasPorId.set(doc.id, {
      id: doc.id,
      nombre: doc.data().nombre,
      carpetaPadreId: doc.data().carpetaPadreId
    });
  });

  console.log(`   Total de carpetas en Firestore: ${carpetasPorId.size}`);

  // Construir rutas completas para cada carpeta
  function construirRuta(carpetaId) {
    const carpeta = carpetasPorId.get(carpetaId);
    if (!carpeta) return null;

    const partes = [carpeta.nombre];
    let padreId = carpeta.carpetaPadreId;

    while (padreId) {
      const padre = carpetasPorId.get(padreId);
      if (!padre) break;
      partes.unshift(padre.nombre);
      padreId = padre.carpetaPadreId;
    }

    return partes.join('/');
  }

  // Crear cache de ruta -> carpetaId
  for (const [id, carpeta] of carpetasPorId) {
    const ruta = construirRuta(id);
    if (ruta) {
      carpetasCache.set(ruta, id);
    }
  }

  console.log(`   ✅ Caché construido: ${carpetasCache.size} rutas indexadas\n`);
}

/**
 * Busca una carpeta por ruta usando caché (instantáneo)
 */
function buscarCarpetaPorRuta(ruta) {
  if (!ruta || ruta.trim() === '') {
    return null;
  }
  return carpetasCache.get(ruta.trim()) || null;
}

async function main() {
  console.log('=================================================');
  console.log('  REASIGNACIÓN RÁPIDA DE MATERIALES');
  console.log('=================================================\n');

  // 1. Cargar todas las carpetas en caché
  await cargarTodasLasCarpetas();

  // 2. Leer CSV
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

  // 3. Crear mapa: URL -> carpetaRuta
  console.log('🗺️  Creando índice URL → Carpeta...');
  const urlToCarpeta = new Map();
  registros.forEach(registro => {
    if (registro.archivoUrl && registro.archivoUrl.trim() !== '') {
      urlToCarpeta.set(registro.archivoUrl.trim(), registro.carpetaRuta?.trim() || null);
    }
  });
  console.log(`   URLs únicas: ${urlToCarpeta.size}\n`);

  // 4. Obtener materiales de Firestore
  console.log('📥 Obteniendo materiales de Firestore...');
  const materialesSnapshot = await db.collection('material').get();
  console.log(`   Total de materiales: ${materialesSnapshot.size}\n`);

  // 5. Procesar materiales
  console.log('🔄 Procesando materiales...\n');

  const stats = {
    procesados: 0,
    asignados: 0,
    sinCarpeta: 0,
    carpetaNoExiste: 0,
    yaAsignados: 0
  };

  let batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;

  for (const doc of materialesSnapshot.docs) {
    const material = doc.data();
    stats.procesados++;

    // Buscar ruta en CSV
    const rutaCarpeta = urlToCarpeta.get(material.archivoUrl);

    if (!rutaCarpeta) {
      stats.sinCarpeta++;
      continue;
    }

    // Buscar ID de carpeta en caché (instantáneo)
    const carpetaId = buscarCarpetaPorRuta(rutaCarpeta);

    if (!carpetaId) {
      stats.carpetaNoExiste++;
      if (stats.carpetaNoExiste <= 10) {
        console.warn(`   ⚠️  Carpeta no existe: ${rutaCarpeta}`);
      }
      continue;
    }

    // Verificar si ya está asignado
    if (material.carpetaId === carpetaId) {
      stats.yaAsignados++;
      continue;
    }

    // Actualizar material
    batch.update(doc.ref, { carpetaId });
    batchCount++;
    stats.asignados++;

    // Commit batch
    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      console.log(`   ✓ Actualizados ${stats.asignados}/${stats.procesados} materiales...`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  // Commit final
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log('\n=================================================');
  console.log('  RESUMEN');
  console.log('=================================================');
  console.log(`Total procesados:           ${stats.procesados}`);
  console.log(`✅ Asignados a carpetas:    ${stats.asignados}`);
  console.log(`ℹ️  Ya estaban asignados:    ${stats.yaAsignados}`);
  console.log(`⚠️  Sin carpeta en CSV:      ${stats.sinCarpeta}`);
  console.log(`❌ Carpeta no existe:       ${stats.carpetaNoExiste}`);
  console.log('=================================================\n');

  const porcentajeAsignado = ((stats.asignados + stats.yaAsignados) / stats.procesados * 100).toFixed(1);
  console.log(`📊 ${porcentajeAsignado}% de materiales están en carpetas\n`);

  if (stats.asignados > 0) {
    console.log('🎉 ¡Materiales reasignados exitosamente!\n');
  }

  if (stats.carpetaNoExiste > 10) {
    console.log(`⚠️  Nota: ${stats.carpetaNoExiste} carpetas del CSV no existen en Firestore`);
    console.log('   Ejecuta: npm run create:folders-from-csv para crearlas\n');
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
