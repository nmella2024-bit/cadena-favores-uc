/**
 * Script para crear carpetas automáticamente desde el CSV "comercial - Hoja 1.csv"
 *
 * USO:
 * 1. Coloca tu archivo "comercial - Hoja 1.csv" en la raíz del proyecto
 * 2. Coloca tu serviceAccountKey.json en la raíz del proyecto
 * 3. Ejecuta: npm run comercial:create-folders
 */

import admin from 'firebase-admin';
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

const CSV_FILE = path.join(__dirname, '..', 'comercial - Hoja 1.csv');
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');
const AUTOR_ID = 'wuLb7RmRy3hJFmpYkPacQoUbZun1';
const AUTOR_NOMBRE = 'NexUC';

// ============================================
// INICIALIZAR FIREBASE ADMIN
// ============================================

try {
  const serviceAccountKey = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
  });
  console.log('✅ Firebase Admin inicializado correctamente\n');
} catch (error) {
  console.error('❌ Error al inicializar Firebase Admin:');
  console.error('   Asegúrate de que serviceAccountKey.json existe en la raíz del proyecto');
  console.error('   Error:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// ============================================
// CACHE DE CARPETAS
// ============================================

// Cache de carpetas creadas: key = ruta completa, value = carpetaId
const carpetasCache = new Map();

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Crea una carpeta y todas sus carpetas padres si no existen
 * @param {string} rutaCompleta - Ruta completa separada por /
 * @returns {string|null} - ID de la carpeta creada o null si es raíz
 */
async function crearCarpetaRecursiva(rutaCompleta) {
  if (!rutaCompleta || rutaCompleta.trim() === '') {
    return null; // Raíz
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
      console.log(`   ○ Ya existe: ${rutaAcumulada}`);
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

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('=================================================================');
  console.log('  CREACIÓN DE CARPETAS DESDE "comercial - Hoja 1.csv"');
  console.log('=================================================================\n');

  // 1. Verificar que existe el archivo CSV
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ Error: No se encontró el archivo: ${CSV_FILE}`);
    console.error('   Coloca tu archivo "comercial - Hoja 1.csv" en la raíz del proyecto\n');
    process.exit(1);
  }

  // 2. Leer y parsear CSV
  console.log('📖 Leyendo CSV...');
  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');

  let registros;
  try {
    registros = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      relax_quotes: true
    });
    console.log(`   Total de registros: ${registros.length}\n`);
  } catch (error) {
    console.error('❌ Error al parsear el CSV:', error.message);
    process.exit(1);
  }

  // 3. Extraer rutas únicas
  const rutasUnicas = new Set();
  registros.forEach(registro => {
    if (registro.carpetaRuta && registro.carpetaRuta.trim() !== '') {
      rutasUnicas.add(registro.carpetaRuta.trim());
    }
  });

  console.log(`📁 Rutas únicas encontradas: ${rutasUnicas.size}\n`);

  if (rutasUnicas.size === 0) {
    console.warn('⚠️  No se encontraron rutas de carpetas en el CSV.');
    console.warn('   Todos los materiales se importarán en la raíz.\n');
    process.exit(0);
  }

  console.log('🔨 Creando estructura de carpetas...\n');

  // 4. Crear carpetas
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

  // 5. Mostrar resumen
  console.log('\n=================================================================');
  console.log('  RESUMEN');
  console.log('=================================================================');
  console.log(`Rutas procesadas:       ${rutasUnicas.size}`);
  console.log(`Carpetas creadas:       ${carpetasCreadas}`);
  console.log(`Carpetas ya existentes: ${carpetasExistentes}`);
  console.log(`Total en cache:         ${carpetasCache.size}`);
  console.log('=================================================================\n');

  console.log('✅ ¡Estructura de carpetas creada exitosamente!\n');
  console.log('📋 Próximos pasos:\n');
  console.log('   1. Verifica las carpetas en tu aplicación (/material)');
  console.log('   2. Ejecuta: npm run comercial:import');
  console.log('   3. Esto importará los materiales a sus carpetas\n');
}

// ============================================
// EJECUTAR
// ============================================

main()
  .then(() => {
    console.log('✅ Script finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
