/**
 * Script para importar materiales de Derecho desde CSV a Firestore
 *
 * Este script:
 * 1. Lee el archivo DerechoUC.csv
 * 2. Busca las carpetas correspondientes en Firestore
 * 3. Importa los materiales con sus metadatos
 *
 * USO:
 * node scripts/import-derecho-from-csv.js
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// CONFIGURACIÓN
// ============================================

const CSV_FILE = path.join(__dirname, '..', 'DerechoUC.csv');
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');

// ID del usuario que aparecerá como autor (debe ser un usuario existente con rol exclusivo)
const AUTOR_ID = '2xItxJLvGPhYeB2xYfCWP6g5dIg2';
const AUTOR_NOMBRE = 'NexUC';

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

// Mapas para carpetas pre-cargadas
const carpetasPorId = new Map(); // id -> data
const carpetasPorRuta = new Map(); // ruta completa -> id

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Pre-carga todas las carpetas de material en memoria
 */
async function precargarCarpetas() {
  console.log('📦 Pre-cargando carpetas en memoria...');

  const snapshot = await db.collection('folders')
    .where('seccion', '==', 'material')
    .get();

  console.log(`   Encontradas ${snapshot.size} carpetas`);

  // Primero guardar todas las carpetas por ID
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
      // Es raíz
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

  console.log(`✅ ${carpetasPorRuta.size} rutas de carpetas cargadas en memoria\n`);
}

/**
 * Busca una carpeta por su ruta completa (usando el mapa pre-cargado)
 */
function buscarCarpetaPorRuta(ruta) {
  if (!ruta || ruta.trim() === '') {
    return null;
  }

  ruta = ruta.trim();
  return carpetasPorRuta.get(ruta) || null;
}

/**
 * Procesa los tags desde el CSV
 */
function procesarTags(tagsString) {
  if (!tagsString) return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
}

/**
 * Extrae el tipo de archivo de la URL o del nombre
 */
function extraerTipoArchivo(archivoUrl, titulo) {
  // Primero intentar desde el tipo en el CSV
  if (titulo) {
    const extension = titulo.toLowerCase();
    if (extension.includes('.pdf')) return 'pdf';
    if (extension.includes('.docx') || extension.includes('.doc')) return 'docx';
    if (extension.includes('.pptx') || extension.includes('.ppt')) return 'pptx';
    if (extension.includes('.xlsx') || extension.includes('.xls')) return 'xlsx';
    if (extension.includes('.txt')) return 'txt';
  }

  // Luego intentar desde la URL
  if (archivoUrl.includes('/document/')) return 'docx';
  if (archivoUrl.includes('/file/') && archivoUrl.includes('pdf')) return 'pdf';
  if (archivoUrl.includes('/presentation/')) return 'pptx';
  if (archivoUrl.includes('/spreadsheets/')) return 'xlsx';

  // Por defecto, PDF
  return 'pdf';
}

/**
 * Valida y limpia un registro del CSV
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
async function convertirAMaterial(registro, carpetaId) {
  // Extraer tipo de archivo
  const tipo = registro.tipo?.trim() || extraerTipoArchivo(registro.archivoUrl, registro.titulo);

  return {
    titulo: registro.titulo.trim(),
    descripcion: registro.descripcion?.trim() || '',
    tipo: tipo,
    carrera: registro.carrera?.trim() || 'Derecho',
    anio: registro.anio ? parseInt(registro.anio) : null,
    ramo: registro.ramo?.trim() || '',
    tags: procesarTags(registro.tags),
    archivoUrl: registro.archivoUrl.trim(),
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
  console.log('  IMPORTACIÓN MASIVA DE MATERIALES - DERECHO');
  console.log('=================================================\n');

  // 1. Verificar que existe el archivo CSV
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ Error: No se encontró el archivo ${CSV_FILE}`);
    console.error('   Coloca tu archivo DerechoUC.csv en la raíz del proyecto\n');
    process.exit(1);
  }

  // 2. Leer y parsear el CSV
  console.log('📖 Leyendo archivo CSV...');
  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');

  let registros;
  try {
    registros = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true // Maneja BOM si existe
    });
    console.log(`✅ CSV parseado correctamente: ${registros.length} registros encontrados\n`);
  } catch (error) {
    console.error('❌ Error al parsear el CSV:', error.message);
    process.exit(1);
  }

  // 3. Validar registros
  console.log('🔍 Validando registros...');
  const erroresValidacion = [];
  registros.forEach((registro, index) => {
    const errores = validarRegistro(registro, index);
    erroresValidacion.push(...errores);
  });

  if (erroresValidacion.length > 0) {
    console.error('❌ Se encontraron errores de validación:\n');
    erroresValidacion.slice(0, 10).forEach(error => console.error(`   ${error}`));
    if (erroresValidacion.length > 10) {
      console.error(`   ... y ${erroresValidacion.length - 10} errores más`);
    }
    console.error('\nPor favor corrige estos errores en el CSV y vuelve a intentar.\n');
    process.exit(1);
  }
  console.log('✅ Todos los registros son válidos\n');

  // 4. Verificar autor
  try {
    const autorDoc = await db.collection('usuarios').doc(AUTOR_ID).get();
    if (!autorDoc.exists) {
      console.error('❌ Error: El AUTOR_ID especificado no existe en la base de datos');
      console.error(`   AUTOR_ID: ${AUTOR_ID}`);
      console.error('   Por favor actualiza la variable AUTOR_ID en el script con un usuario válido.\n');
      process.exit(1);
    }
    console.log(`✅ Autor verificado: ${autorDoc.data().nombre || AUTOR_NOMBRE}\n`);
  } catch (error) {
    console.error('❌ Error al verificar autor:', error.message);
    process.exit(1);
  }

  // 4.5. Pre-cargar todas las carpetas
  await precargarCarpetas();

  // 5. Procesar e importar materiales
  console.log('📥 Iniciando importación...\n');

  const stats = {
    total: registros.length,
    exitosos: 0,
    fallidos: 0,
    advertencias: 0,
    sinCarpeta: 0
  };

  let batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500; // Firestore permite máximo 500 operaciones por batch

  // Para mostrar progreso
  const progressInterval = Math.floor(registros.length / 20) || 100;
  let lastProgressTime = Date.now();

  for (let i = 0; i < registros.length; i++) {
    const registro = registros[i];
    const numeroFila = i + 2; // +2 porque empezamos en 1 y la fila 1 es el header

    try {
      // Buscar carpeta (ahora es síncrono y rápido)
      let carpetaId = null;
      if (registro.rutaCarpeta && registro.rutaCarpeta.trim() !== '') {
        carpetaId = buscarCarpetaPorRuta(registro.rutaCarpeta.trim());
        if (!carpetaId) {
          stats.sinCarpeta++;
          // Solo mostrar los primeros 5 warnings para no saturar la consola
          if (stats.sinCarpeta <= 5) {
            console.warn(`⚠️  Fila ${numeroFila}: Carpeta "${registro.rutaCarpeta}" no encontrada`);
          }
        }
      }

      // Crear material
      const material = await convertirAMaterial(registro, carpetaId);
      const docRef = db.collection('material').doc();
      batch.set(docRef, material);
      batchCount++;

      // Mostrar progreso cada N registros o cada 5 segundos
      const now = Date.now();
      if ((i + 1) % progressInterval === 0 || now - lastProgressTime > 5000) {
        const porcentaje = ((i + 1) / registros.length * 100).toFixed(1);
        console.log(`   ⏳ Preparando: ${i + 1}/${registros.length} (${porcentaje}%)`);
        lastProgressTime = now;
      }

      // Commit batch si alcanzamos el límite
      if (batchCount >= BATCH_SIZE) {
        console.log(`   💾 Guardando lote en Firestore...`);
        await batch.commit();
        stats.exitosos += batchCount;
        console.log(`   ✅ Guardados ${stats.exitosos}/${registros.length} materiales`);
        // CREAR NUEVO BATCH después de commit
        batch = db.batch();
        batchCount = 0;
      }

    } catch (error) {
      stats.fallidos++;
      console.error(`❌ Fila ${numeroFila}: Error - ${error.message}`);
    }
  }

  // Commit batch final
  if (batchCount > 0) {
    console.log(`   💾 Guardando lote final en Firestore...`);
    await batch.commit();
    stats.exitosos += batchCount;
    console.log(`   ✅ Guardados ${stats.exitosos}/${registros.length} materiales`);
  }

  // 6. Mostrar resumen
  console.log('\n=================================================');
  console.log('  RESUMEN DE IMPORTACIÓN');
  console.log('=================================================');
  console.log(`Total de registros:    ${stats.total}`);
  console.log(`✅ Importados:         ${stats.exitosos}`);
  console.log(`❌ Fallidos:           ${stats.fallidos}`);
  console.log(`⚠️  Sin carpeta:        ${stats.sinCarpeta}`);
  console.log('=================================================\n');

  if (stats.exitosos === stats.total) {
    console.log('🎉 ¡Importación completada exitosamente!\n');
  } else if (stats.fallidos === 0) {
    console.log('✅ Importación completada. Algunos materiales se guardaron sin carpeta.\n');
  } else {
    console.log('⚠️  Importación completada con algunos errores.\n');
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
    process.exit(1);
  });
