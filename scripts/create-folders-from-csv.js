/**
 * Script para crear carpetas automáticamente desde las rutas del CSV
 *
 * USO:
 * npm run create:folders-from-csv
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
const AUTOR_ID = 'wuLb7RmRy3hJFmpYkPacQoUbZun1';
const AUTOR_NOMBRE = 'NexUC';

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

// Cache de carpetas creadas
const carpetasCache = new Map(); // key: ruta completa, value: carpetaId

/**
 * Crea una carpeta y todas sus carpetas padres si no existen
 */
async function crearCarpetaRecursiva(rutaCompleta) {
  if (!rutaCompleta || rutaCompleta.trim() === '') {
    return null;
  }

  // Si ya existe en cache, retornar
  if (carpetasCache.has(rutaCompleta)) {
    return carpetasCache.get(rutaCompleta);
  }

  const partes = rutaCompleta.split('/').map(p => p.trim()).filter(p => p !== '');
  let carpetaPadreId = null;
  let rutaAcumulada = '';

  for (const nombreCarpeta of partes) {
    rutaAcumulada += (rutaAcumulada ? '/' : '') + nombreCarpeta;

    // Verificar si ya existe en cache
    if (carpetasCache.has(rutaAcumulada)) {
      carpetaPadreId = carpetasCache.get(rutaAcumulada);
      continue;
    }

    // Buscar si existe en Firestore
    const q = db.collection('folders')
      .where('nombre', '==', nombreCarpeta)
      .where('carpetaPadreId', '==', carpetaPadreId)
      .limit(1);

    const snapshot = await q.get();

    if (!snapshot.empty) {
      // Ya existe
      carpetaPadreId = snapshot.docs[0].id;
      carpetasCache.set(rutaAcumulada, carpetaPadreId);
    } else {
      // Crear nueva carpeta
      const nuevaCarpeta = {
        nombre: nombreCarpeta,
        carpetaPadreId: carpetaPadreId,
        autorId: AUTOR_ID,
        autorNombre: AUTOR_NOMBRE,
        fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('folders').add(nuevaCarpeta);
      carpetaPadreId = docRef.id;
      carpetasCache.set(rutaAcumulada, carpetaPadreId);

      console.log(`   ✓ Creada: ${rutaAcumulada}`);
    }
  }

  return carpetaPadreId;
}

async function main() {
  console.log('=================================================');
  console.log('  CREACIÓN DE CARPETAS DESDE CSV');
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

  console.log(`   Total de registros: ${registros.length}\n`);

  // Extraer rutas únicas
  const rutasUnicas = new Set();
  registros.forEach(registro => {
    if (registro.carpetaRuta && registro.carpetaRuta.trim() !== '') {
      rutasUnicas.add(registro.carpetaRuta.trim());
    }
  });

  console.log(`📁 Rutas únicas encontradas: ${rutasUnicas.size}\n`);
  console.log('🔨 Creando estructura de carpetas...\n');

  let carpetasCreadas = 0;
  let carpetasExistentes = 0;

  for (const ruta of rutasUnicas) {
    const sizeBefore = carpetasCache.size;
    await crearCarpetaRecursiva(ruta);
    const sizeAfter = carpetasCache.size;

    if (sizeAfter > sizeBefore) {
      carpetasCreadas += (sizeAfter - sizeBefore);
    } else {
      carpetasExistentes++;
    }
  }

  console.log('\n=================================================');
  console.log('  RESUMEN');
  console.log('=================================================');
  console.log(`Rutas procesadas:       ${rutasUnicas.size}`);
  console.log(`Carpetas creadas:       ${carpetasCreadas}`);
  console.log(`Carpetas ya existentes: ${carpetasExistentes}`);
  console.log(`Total en cache:         ${carpetasCache.size}`);
  console.log('=================================================\n');

  console.log('✅ ¡Estructura de carpetas creada!\n');
  console.log('📋 Próximos pasos:\n');
  console.log('   1. Verifica las carpetas en /material');
  console.log('   2. Ejecuta: npm run reassign:folders');
  console.log('   3. Esto asignará los materiales a sus carpetas\n');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
