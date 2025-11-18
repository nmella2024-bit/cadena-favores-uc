/**
 * Script para crear carpetas de Psicología en Firestore
 *
 * Este script:
 * 1. Lee el archivo Psicologia - Archivos.csv
 * 2. Extrae las rutas únicas de carpetas
 * 3. Crea la estructura de carpetas en Firestore
 * 4. Guarda un mapeo ruta -> ID para usar en la importación
 *
 * USO:
 * node scripts/create-psicologia-folders.js
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

const CSV_FILE = path.join(__dirname, '..', 'Psicologia - Archivos.csv');
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');
const MAPPING_FILE = path.join(__dirname, 'psicologia-carpetas-mapping.json');

// ============================================
// INICIALIZAR FIREBASE ADMIN
// ============================================

try {
  const serviceAccountKey = JSON.parse(
    fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8')
  );

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey)
    });
  }

  console.log('✅ Firebase Admin inicializado correctamente\n');
} catch (error) {
  console.error('❌ Error al inicializar Firebase Admin:');
  console.error('   Asegúrate de que serviceAccountKey.json existe en la raíz del proyecto');
  console.error('   Error:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Extrae rutas únicas de carpetas del CSV
 */
function extraerRutasUnicas(registros) {
  const rutasSet = new Set();

  for (const registro of registros) {
    if (!registro.rutaCarpeta || registro.rutaCarpeta.trim() === '') {
      continue;
    }

    const rutaCompleta = registro.rutaCarpeta.trim();
    const partes = rutaCompleta.split('/');

    // Agregar cada nivel de la ruta
    let rutaAcumulada = '';
    for (const parte of partes) {
      if (parte.trim() === '') continue;

      rutaAcumulada = rutaAcumulada ? `${rutaAcumulada}/${parte}` : parte;
      rutasSet.add(rutaAcumulada);
    }
  }

  return Array.from(rutasSet).sort();
}

/**
 * Pre-carga carpetas existentes de Firestore
 */
async function precargarCarpetasExistentes() {
  console.log('📦 Pre-cargando carpetas existentes de Firestore...');

  const snapshot = await db.collection('folders')
    .where('seccion', '==', 'material')
    .get();

  const carpetasPorRuta = new Map();
  const carpetasPorId = new Map();

  // Primero guardar por ID
  snapshot.forEach(doc => {
    carpetasPorId.set(doc.id, {
      id: doc.id,
      nombre: doc.data().nombre,
      carpetaPadreId: doc.data().carpetaPadreId
    });
  });

  // Construir rutas completas
  function construirRuta(carpetaId) {
    const carpeta = carpetasPorId.get(carpetaId);
    if (!carpeta) return null;

    if (!carpeta.carpetaPadreId) {
      return carpeta.nombre;
    }

    const rutaPadre = construirRuta(carpeta.carpetaPadreId);
    return rutaPadre ? `${rutaPadre}/${carpeta.nombre}` : carpeta.nombre;
  }

  // Mapear todas las rutas
  for (const [id, carpeta] of carpetasPorId) {
    const ruta = construirRuta(id);
    if (ruta) {
      carpetasPorRuta.set(ruta, id);
    }
  }

  console.log(`✅ ${carpetasPorRuta.size} carpetas existentes cargadas en memoria\n`);
  return carpetasPorRuta;
}

/**
 * Crea una carpeta en Firestore
 */
async function crearCarpeta(nombre, carpetaPadreId = null) {
  const carpetaData = {
    nombre: nombre,
    seccion: 'material',
    creadoEn: admin.firestore.FieldValue.serverTimestamp(),
    actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (carpetaPadreId) {
    carpetaData.carpetaPadreId = carpetaPadreId;
  }

  const docRef = await db.collection('folders').add(carpetaData);
  return docRef.id;
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function crearCarpetas() {
  console.log('=================================================');
  console.log('  CREACIÓN DE CARPETAS - PSICOLOGÍA');
  console.log('=================================================\n');

  // 1. Verificar CSV
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ Error: No se encontró el archivo ${CSV_FILE}`);
    console.error('   Coloca tu archivo "Psicologia - Archivos.csv" en la raíz del proyecto\n');
    process.exit(1);
  }

  // 2. Leer y parsear CSV
  console.log('📖 Leyendo archivo CSV...');
  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');

  let registros;
  try {
    registros = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });
    console.log(`✅ CSV parseado: ${registros.length} registros\n`);
  } catch (error) {
    console.error('❌ Error al parsear CSV:', error.message);
    process.exit(1);
  }

  // 3. Extraer rutas únicas
  console.log('🔍 Extrayendo rutas de carpetas...');
  const rutasUnicas = extraerRutasUnicas(registros);
  console.log(`✅ ${rutasUnicas.length} rutas únicas encontradas\n`);

  // 4. Pre-cargar carpetas existentes
  const carpetasExistentes = await precargarCarpetasExistentes();

  // 5. Crear carpetas
  console.log('📁 Creando estructura de carpetas...\n');

  const carpetasMapping = {};
  let creadas = 0;
  let yaExistian = 0;

  for (let i = 0; i < rutasUnicas.length; i++) {
    const ruta = rutasUnicas[i];
    const porcentaje = ((i + 1) / rutasUnicas.length * 100).toFixed(1);

    console.log(`[${i + 1}/${rutasUnicas.length}] (${porcentaje}%) 📂 ${ruta}`);

    // Verificar si ya existe
    if (carpetasExistentes.has(ruta)) {
      const carpetaId = carpetasExistentes.get(ruta);
      carpetasMapping[ruta] = carpetaId;
      console.log(`   ✓ Ya existe: ${carpetaId}`);
      yaExistian++;
      continue;
    }

    // Determinar carpeta padre
    const partes = ruta.split('/');
    const nombreCarpeta = partes[partes.length - 1];
    let carpetaPadreId = null;

    if (partes.length > 1) {
      const rutaPadre = partes.slice(0, -1).join('/');
      carpetaPadreId = carpetasMapping[rutaPadre] || carpetasExistentes.get(rutaPadre);

      if (!carpetaPadreId) {
        console.log(`   ⚠️  Carpeta padre "${rutaPadre}" no encontrada, saltando...`);
        continue;
      }
    }

    // Crear carpeta
    try {
      const carpetaId = await crearCarpeta(nombreCarpeta, carpetaPadreId);
      carpetasMapping[ruta] = carpetaId;
      carpetasExistentes.set(ruta, carpetaId); // Agregar al cache
      console.log(`   ✅ Creada: ${carpetaId}`);
      creadas++;
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  // 6. Guardar mapeo
  console.log('\n💾 Guardando mapeo de carpetas...');
  fs.writeFileSync(
    MAPPING_FILE,
    JSON.stringify(carpetasMapping, null, 2),
    'utf-8'
  );
  console.log(`✅ Mapeo guardado en: ${MAPPING_FILE}\n`);

  // 7. Resumen
  console.log('=================================================');
  console.log('  RESUMEN');
  console.log('=================================================');
  console.log(`Total de rutas:        ${rutasUnicas.length}`);
  console.log(`✅ Creadas:            ${creadas}`);
  console.log(`ℹ️  Ya existían:        ${yaExistian}`);
  console.log('=================================================\n');

  if (creadas > 0 || yaExistian > 0) {
    console.log('🎉 ¡Carpetas listas! Ahora puedes ejecutar:');
    console.log('   node scripts/import-psicologia-from-csv.js\n');
  }
}

// ============================================
// EJECUTAR
// ============================================

crearCarpetas()
  .then(() => {
    console.log('✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });
