/**
 * Script OPTIMIZADO para importar materiales de Psicología desde CSV a Firestore
 *
 * OPTIMIZACIONES:
 * - Pre-carga de carpetas en memoria (evita consultas repetidas)
 * - Procesamiento por lotes (batch writes)
 * - Procesamiento paralelo cuando es posible
 * - Indicadores de progreso mejorados
 *
 * Este script:
 * 1. Lee el archivo Psicologia - Archivos.csv
 * 2. Busca las carpetas correspondientes (pre-cargadas)
 * 3. Importa los materiales con sus metadatos en lotes
 *
 * USO:
 * node scripts/import-psicologia-from-csv.js
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

// ID del usuario que aparecerá como autor
const AUTOR_ID = '2xItxJLvGPhYeB2xYfCWP6g5dIg2';
const AUTOR_NOMBRE = 'NexUC';

// Tamaño de lote para batch writes (Firestore permite máximo 500)
const BATCH_SIZE = 500;

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
 * Extrae el ID del archivo de Google Drive desde la URL
 */
function extraerGoogleDriveFileId(url) {
  if (!url) return null;

  // Formato: https://drive.google.com/file/d/FILE_ID/view?usp=...
  const match = url.match(/\/file\/d\/([^\/]+)/);
  return match ? match[1] : null;
}

/**
 * Convierte URL de Google Drive a formato de descarga directa
 */
function convertirAUrlDescarga(url) {
  const fileId = extraerGoogleDriveFileId(url);
  if (!fileId) return url;

  // Formato de descarga directa
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Extrae el tipo de archivo de la URL o título
 */
function extraerTipoArchivo(archivoUrl, titulo) {
  if (!archivoUrl) return 'pdf';

  // Verificar extensión en el título
  if (titulo) {
    const tituloLower = titulo.toLowerCase();
    if (tituloLower.includes('.pdf')) return 'pdf';
    if (tituloLower.includes('.docx') || tituloLower.includes('.doc')) return 'docx';
    if (tituloLower.includes('.pptx') || tituloLower.includes('.ppt')) return 'pptx';
    if (tituloLower.includes('.xlsx') || tituloLower.includes('.xls')) return 'xlsx';
  }

  // Por defecto PDF (es lo más común en materiales académicos)
  return 'pdf';
}

/**
 * Procesa los tags desde el CSV
 */
function procesarTags(tagsString) {
  if (!tagsString || tagsString.trim() === '') return [];
  return tagsString.split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

/**
 * Valida un registro del CSV
 */
function validarRegistro(registro, index) {
  const errores = [];

  if (!registro.titulo || registro.titulo.trim() === '') {
    errores.push(`Fila ${index + 2}: Falta el título`);
  }

  if (!registro.archivoUrl || registro.archivoUrl.trim() === '') {
    errores.push(`Fila ${index + 2}: Falta la URL del archivo`);
  }

  return errores;
}

/**
 * Convierte un registro del CSV a formato Firestore
 */
function convertirAMaterial(registro, carpetaId) {
  const tipo = registro.tipo?.trim() || extraerTipoArchivo(registro.archivoUrl, registro.titulo);
  const archivoUrl = registro.archivoUrl.trim();

  return {
    titulo: registro.titulo.trim(),
    descripcion: registro.descripcion?.trim() || '',
    tipo: tipo,
    carrera: registro.carrera?.trim() || 'Psicología',
    anio: registro.anio ? parseInt(registro.anio) : null,
    ramo: registro.ramo?.trim() || '',
    tags: procesarTags(registro.tags),
    archivoUrl: archivoUrl,
    nombreArchivo: registro.titulo.trim(),
    autorId: AUTOR_ID,
    autorNombre: AUTOR_NOMBRE,
    carpetaId: carpetaId,
    fijado: false,
    fechaSubida: admin.firestore.FieldValue.serverTimestamp(),
  };
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function importarMateriales() {
  console.log('=================================================');
  console.log('  IMPORTACIÓN OPTIMIZADA - PSICOLOGÍA');
  console.log('=================================================\n');

  const startTime = Date.now();

  // 1. Verificar archivos necesarios
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ Error: No se encontró el archivo ${CSV_FILE}`);
    console.error('   Coloca tu archivo "Psicologia - Archivos.csv" en la raíz del proyecto\n');
    process.exit(1);
  }

  if (!fs.existsSync(MAPPING_FILE)) {
    console.error(`❌ Error: No se encontró el archivo ${MAPPING_FILE}`);
    console.error('   Ejecuta primero: node scripts/create-psicologia-folders.js\n');
    process.exit(1);
  }

  // 2. Cargar mapeo de carpetas
  console.log('📂 Cargando mapeo de carpetas...');
  const carpetasMapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
  console.log(`✅ ${Object.keys(carpetasMapping).length} carpetas en el mapeo\n`);

  // 3. Leer y parsear CSV
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

  // 4. Validar registros
  console.log('🔍 Validando registros...');
  const erroresValidacion = [];
  registros.forEach((registro, index) => {
    const errores = validarRegistro(registro, index);
    erroresValidacion.push(...errores);
  });

  if (erroresValidacion.length > 0) {
    console.error('❌ Errores de validación encontrados:\n');
    erroresValidacion.slice(0, 10).forEach(error => console.error(`   ${error}`));
    if (erroresValidacion.length > 10) {
      console.error(`   ... y ${erroresValidacion.length - 10} errores más`);
    }
    console.error('\nCorrige estos errores y vuelve a intentar.\n');
    process.exit(1);
  }
  console.log('✅ Todos los registros son válidos\n');

  // 5. Verificar autor
  try {
    const autorDoc = await db.collection('usuarios').doc(AUTOR_ID).get();
    if (!autorDoc.exists) {
      console.error('❌ Error: El AUTOR_ID especificado no existe');
      console.error(`   AUTOR_ID: ${AUTOR_ID}`);
      console.error('   Actualiza la variable AUTOR_ID en el script.\n');
      process.exit(1);
    }
    console.log(`✅ Autor verificado: ${autorDoc.data().nombre || AUTOR_NOMBRE}\n`);
  } catch (error) {
    console.error('❌ Error al verificar autor:', error.message);
    process.exit(1);
  }

  // 6. Procesar e importar materiales (OPTIMIZADO CON BATCHING)
  console.log('📥 Iniciando importación optimizada...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const stats = {
    total: registros.length,
    exitosos: 0,
    sinCarpeta: 0,
    errores: 0
  };

  let batch = db.batch();
  let batchCount = 0;
  let lastProgressTime = Date.now();
  const progressInterval = Math.max(1, Math.floor(registros.length / 50));

  for (let i = 0; i < registros.length; i++) {
    const registro = registros[i];
    const numeroFila = i + 2;

    try {
      // Buscar carpeta (búsqueda en memoria, muy rápida)
      let carpetaId = null;
      if (registro.rutaCarpeta && registro.rutaCarpeta.trim() !== '') {
        const rutaCarpeta = registro.rutaCarpeta.trim();
        carpetaId = carpetasMapping[rutaCarpeta];

        if (!carpetaId) {
          stats.sinCarpeta++;
          // Solo mostrar los primeros 5 warnings
          if (stats.sinCarpeta <= 5) {
            console.warn(`⚠️  Fila ${numeroFila}: Carpeta "${rutaCarpeta}" no encontrada`);
          }
        }
      }

      // Crear material
      const material = convertirAMaterial(registro, carpetaId);
      const docRef = db.collection('material').doc();
      batch.set(docRef, material);
      batchCount++;

      // Mostrar progreso
      const now = Date.now();
      if ((i + 1) % progressInterval === 0 || now - lastProgressTime > 3000) {
        const porcentaje = ((i + 1) / registros.length * 100).toFixed(1);
        const velocidad = ((i + 1) / ((now - startTime) / 1000)).toFixed(0);
        console.log(`   ⏳ Preparando: ${i + 1}/${registros.length} (${porcentaje}%) - ${velocidad} reg/s`);
        lastProgressTime = now;
      }

      // Commit batch si alcanzamos el límite
      if (batchCount >= BATCH_SIZE) {
        console.log(`   💾 Guardando lote de ${batchCount} materiales...`);
        const batchStart = Date.now();
        await batch.commit();
        const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
        stats.exitosos += batchCount;
        console.log(`   ✅ Guardados ${stats.exitosos}/${registros.length} (${batchTime}s)`);

        // Crear nuevo batch
        batch = db.batch();
        batchCount = 0;
      }

    } catch (error) {
      stats.errores++;
      console.error(`❌ Fila ${numeroFila}: ${error.message}`);
    }
  }

  // Commit batch final
  if (batchCount > 0) {
    console.log(`\n   💾 Guardando lote final de ${batchCount} materiales...`);
    const batchStart = Date.now();
    await batch.commit();
    const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
    stats.exitosos += batchCount;
    console.log(`   ✅ Guardados ${stats.exitosos}/${registros.length} (${batchTime}s)`);
  }

  // 7. Resumen
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const velocidadPromedio = (stats.total / totalTime).toFixed(1);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('=================================================');
  console.log('  RESUMEN DE IMPORTACIÓN');
  console.log('=================================================');
  console.log(`Total de registros:    ${stats.total}`);
  console.log(`✅ Importados:         ${stats.exitosos}`);
  console.log(`⚠️  Sin carpeta:        ${stats.sinCarpeta}`);
  console.log(`❌ Errores:            ${stats.errores}`);
  console.log(`⏱️  Tiempo total:       ${totalTime}s`);
  console.log(`🚀 Velocidad promedio: ${velocidadPromedio} reg/s`);
  console.log('=================================================\n');

  if (stats.exitosos === stats.total) {
    console.log('🎉 ¡Importación completada exitosamente!\n');
  } else if (stats.errores === 0) {
    console.log('✅ Importación completada. Algunos materiales sin carpeta.\n');
  } else {
    console.log('⚠️  Importación completada con algunos errores.\n');
  }

  if (stats.sinCarpeta > 5) {
    console.log(`ℹ️  ${stats.sinCarpeta} materiales no tienen carpeta asignada`);
    console.log('   Verifica las rutas en el CSV o ejecuta nuevamente create-psicologia-folders.js\n');
  }
}

// ============================================
// EJECUTAR
// ============================================

importarMateriales()
  .then(() => {
    console.log('✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });
