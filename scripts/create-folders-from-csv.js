/**
 * Script para crear carpetas en Firestore basándose en el archivo CSV "OFG - Archivos.csv"
 *
 * Este script:
 * 1. Lee el archivo CSV con la estructura de carpetas
 * 2. Crea las carpetas en Firestore siguiendo la jerarquía del CSV
 * 3. Las carpetas aparecerán en la página web
 *
 * USO:
 * node scripts/create-folders-from-csv.js
 *
 * FORMATO DEL CSV:
 * El campo 'rutaCarpeta' contiene la ruta completa, ej: "TRABAJO DE RRHH" o "Filosofía ¿Para qué?/Apuntes"
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CREDENTIALS_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');
const CSV_PATH = path.join(__dirname, '..', 'OFG - Archivos.csv');

const AUTOR_ID = 'wuLb7RmRy3hJFmpYkPacQoUbZun1';
const AUTOR_NOMBRE = 'NexUC';

// Inicializar Firebase Admin
console.log('🔧 Inicializando Firebase Admin...\n');
try {
  const serviceAccount = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  console.log('✅ Firebase Admin inicializado\n');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Cache de carpetas creadas
const carpetasCache = new Map(); // key: ruta completa, value: carpetaId

/**
 * Crea una carpeta en Firestore y todas sus carpetas padres si no existen
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

/**
 * Función principal
 */
async function crearCarpetasDesdeCSV() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🏗️  CREANDO CARPETAS EN FIRESTORE DESDE CSV\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Leer el archivo CSV
    console.log('📄 Leyendo archivo CSV...\n');
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`   Total de registros: ${records.length}\n`);

    // 2. Extraer rutas únicas
    const rutasUnicas = new Set();
    records.forEach(record => {
      if (record.rutaCarpeta && record.rutaCarpeta.trim() !== '') {
        rutasUnicas.add(record.rutaCarpeta.trim());
      }
    });

    console.log(`📁 Rutas únicas encontradas: ${rutasUnicas.size}\n`);
    console.log('🔨 Creando estructura de carpetas...\n');

    // 3. Crear carpetas
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

    // 4. Guardar mapeo de carpetas para el siguiente script
    const mapeoPath = path.join(__dirname, 'carpetas-mapping.json');
    const mapeoObj = Object.fromEntries(carpetasCache);
    fs.writeFileSync(mapeoPath, JSON.stringify(mapeoObj, null, 2));
    console.log(`\n💾 Mapeo guardado en: carpetas-mapping.json`);

    // 5. Resumen
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 RESUMEN\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Rutas procesadas:       ${rutasUnicas.size}`);
    console.log(`Carpetas creadas:       ${carpetasCreadas}`);
    console.log(`Carpetas ya existentes: ${carpetasExistentes}`);
    console.log(`Total en cache:         ${carpetasCache.size}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (carpetasCreadas > 0) {
      console.log('🎉 Estructura de carpetas creada!\n');
      console.log('   Siguiente paso: Ejecuta upload-materials-from-csv.js\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('\nStack trace:', error.stack);
  }
}

// Ejecutar
crearCarpetasDesdeCSV()
  .then(() => {
    console.log('✅ Script finalizado\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
