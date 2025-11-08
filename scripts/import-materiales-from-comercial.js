/**
 * Script para importar materiales desde "comercial - Hoja 1.csv" a Firestore
 *
 * USO:
 * 1. Coloca tu archivo "comercial - Hoja 1.csv" en la raíz del proyecto
 * 2. Coloca tu serviceAccountKey.json en la raíz del proyecto
 * 3. PRIMERO ejecuta: npm run comercial:create-folders (para crear las carpetas)
 * 4. LUEGO ejecuta: npm run comercial:import (este script)
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

const CSV_FILE = path.join(__dirname, '..', 'comercial - Hoja 1.csv');
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');

// ID del usuario que aparecerá como autor
const AUTOR_ID = 'wuLb7RmRy3hJFmpYkPacQoUbZun1';
const AUTOR_NOMBRE = 'NexUC';

// Tamaño del batch para Firestore (máximo 500)
const BATCH_SIZE = 500;

// ============================================
// INICIALIZAR FIREBASE ADMIN
// ============================================

try {
  const serviceAccountKey = JSON.parse(
    fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8')
  );

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
// CACHE DE CARPETAS (OPTIMIZACIÓN)
// ============================================

// Cache para evitar búsquedas repetidas
const carpetasCache = new Map(); // key: ruta completa, value: carpetaId

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Busca una carpeta por su ruta completa (CON CACHÉ)
 * Ejemplo: "Primer Año/Matemáticas/Cálculo I"
 */
async function buscarCarpetaPorRuta(ruta) {
  if (!ruta || ruta.trim() === '') {
    return null; // Raíz
  }

  // Verificar si ya está en caché
  if (carpetasCache.has(ruta)) {
    return carpetasCache.get(ruta);
  }

  const partes = ruta.split('/').map(p => p.trim());
  let carpetaPadreId = null;
  let rutaAcumulada = '';

  for (const nombreCarpeta of partes) {
    rutaAcumulada += (rutaAcumulada ? '/' : '') + nombreCarpeta;

    // Verificar si esta parte ya está en caché
    if (carpetasCache.has(rutaAcumulada)) {
      carpetaPadreId = carpetasCache.get(rutaAcumulada);
      continue;
    }

    const q = db.collection('folders')
      .where('nombre', '==', nombreCarpeta)
      .where('carpetaPadreId', '==', carpetaPadreId)
      .limit(1);

    const snapshot = await q.get();

    if (snapshot.empty) {
      console.warn(`⚠️  Carpeta no encontrada: ${nombreCarpeta} (en ruta: ${ruta})`);
      // Cachear el resultado negativo para no volver a buscar
      carpetasCache.set(ruta, null);
      return null;
    }

    carpetaPadreId = snapshot.docs[0].id;
    // Cachear la ruta parcial
    carpetasCache.set(rutaAcumulada, carpetaPadreId);
  }

  // Cachear la ruta completa
  carpetasCache.set(ruta, carpetaPadreId);
  return carpetaPadreId;
}

/**
 * Procesa los tags desde el CSV
 */
function procesarTags(tagsString) {
  if (!tagsString) return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
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

  if (!registro.tipo || registro.tipo.trim() === '') {
    errores.push(`Fila ${index + 2}: Falta el tipo de material`);
  }

  return errores;
}

/**
 * Convierte un registro del CSV a formato Firestore
 */
async function convertirAMaterial(registro, carpetaId) {
  return {
    titulo: registro.titulo.trim(),
    descripcion: registro.descripcion?.trim() || '',
    tipo: registro.tipo.trim(),
    carrera: registro.carrera?.trim() || 'Otra',
    anio: registro.anio ? parseInt(registro.anio) : null,
    ramo: registro.ramo?.trim() || 'Todos los ramos',
    tags: procesarTags(registro.tags),
    archivoUrl: registro.archivoUrl.trim(),
    nombreArchivo: registro.titulo.trim(),
    autorId: AUTOR_ID,
    autorNombre: AUTOR_NOMBRE,
    carpetaId: carpetaId,
    fijado: false,
    fechaSubida: admin.firestore.FieldValue.serverTimestamp(),
    // Campos opcionales
    profesor: registro.profesor?.trim() || '',
    semestre: registro.semestre?.trim() || ''
  };
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function importarMateriales() {
  console.log('=================================================================');
  console.log('  IMPORTACIÓN DE MATERIALES DESDE "comercial - Hoja 1.csv"');
  console.log('=================================================================\n');

  // 1. Verificar que existe el archivo CSV
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ Error: No se encontró el archivo: ${CSV_FILE}`);
    console.error('   Coloca tu archivo "comercial - Hoja 1.csv" en la raíz del proyecto\n');
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
      relax_column_count: true,
      relax_quotes: true
    });
    console.log(`✅ CSV parseado correctamente: ${registros.length} registros encontrados\n`);
  } catch (error) {
    console.error('❌ Error al parsear el CSV:', error.message);
    console.error('   Verifica que el CSV tenga el formato correcto\n');
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
    erroresValidacion.forEach(error => console.error(`   ${error}`));
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
      console.error('   Por favor actualiza la variable AUTOR_ID en el script.\n');
      process.exit(1);
    }
    console.log(`✅ Autor verificado: ${autorDoc.data().nombre || AUTOR_NOMBRE}\n`);
  } catch (error) {
    console.error('❌ Error al verificar autor:', error.message);
    process.exit(1);
  }

  // 5. Procesar e importar materiales
  console.log('📥 Iniciando importación...');
  console.log(`   Total de materiales a procesar: ${registros.length}\n`);

  const stats = {
    total: registros.length,
    exitosos: 0,
    fallidos: 0,
    advertencias: 0
  };

  let batch = db.batch();
  let batchCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < registros.length; i++) {
    const registro = registros[i];
    const numeroFila = i + 2; // +2 porque empezamos en 1 y la fila 1 es el header

    // Mostrar progreso cada 100 materiales
    if (i > 0 && i % 100 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`   📊 Procesando... ${i}/${stats.total} (${elapsed}s) - Cache: ${carpetasCache.size} carpetas`);
    }

    try {
      // Buscar carpeta
      let carpetaId = null;
      if (registro.carpetaRuta && registro.carpetaRuta.trim() !== '') {
        carpetaId = await buscarCarpetaPorRuta(registro.carpetaRuta);
        if (!carpetaId) {
          stats.advertencias++;
          // Solo mostrar las primeras 10 advertencias para no saturar la consola
          if (stats.advertencias <= 10) {
            console.warn(`⚠️  Fila ${numeroFila}: Carpeta no encontrada, se guardará en la raíz`);
          }
        }
      }

      // Crear material
      const material = await convertirAMaterial(registro, carpetaId);
      const docRef = db.collection('material').doc();
      batch.set(docRef, material);
      batchCount++;

      // Commit batch si alcanzamos el límite
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        stats.exitosos += batchCount;
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`   ✓ Commit batch: ${stats.exitosos}/${stats.total} materiales guardados (${elapsed}s)`);
        // Crear nuevo batch después de commit
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
    console.log('\n   💾 Guardando últimos materiales...');
    await batch.commit();
    stats.exitosos += batchCount;
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  // 6. Mostrar resumen
  console.log('\n=================================================================');
  console.log('  RESUMEN DE IMPORTACIÓN');
  console.log('=================================================================');
  console.log(`Total de registros:    ${stats.total}`);
  console.log(`✅ Importados:         ${stats.exitosos}`);
  console.log(`❌ Fallidos:           ${stats.fallidos}`);
  console.log(`⚠️  Advertencias:       ${stats.advertencias}`);
  console.log(`📁 Carpetas en caché:  ${carpetasCache.size}`);
  console.log(`⏱️  Tiempo total:       ${totalTime}s`);
  console.log('=================================================================\n');

  if (stats.exitosos === stats.total) {
    console.log('🎉 ¡Importación completada exitosamente!\n');
    console.log('📋 Próximos pasos:\n');
    console.log('   1. Ve a tu aplicación web → Sección Materiales');
    console.log('   2. Verifica que las carpetas y materiales estén correctos');
    console.log('   3. ¡Listo para usar!\n');
  } else {
    console.log('⚠️  Importación completada con algunos errores.\n');
    console.log('   Revisa los mensajes de error arriba para más detalles.\n');
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
