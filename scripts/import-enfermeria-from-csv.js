/**
 * Script para importar materiales de Enfermería UC desde CSV a Firestore
 *
 * Este script:
 * 1. Lee el archivo EnfermeriaUC.csv
 * 2. Busca las carpetas correspondientes en Firestore
 * 3. Importa los materiales a la sección 'material'
 * 4. Los vincula con sus carpetas respectivas
 *
 * USO:
 * node scripts/import-enfermeria-from-csv.js
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

const CSV_FILE = path.join(__dirname, '..', 'EnfermeriaUC.csv');
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');

// ID del usuario que aparecerá como autor (debe ser un usuario existente con rol exclusivo)
const AUTOR_ID = 'wuLb7RmRy3hJFmpYkPacQoUbZun1';
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

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Busca una carpeta por su nombre exacto en la sección de material
 */
async function buscarCarpetaPorNombre(nombreCarpeta) {
  if (!nombreCarpeta || nombreCarpeta.trim() === '') {
    return null;
  }

  try {
    const q = db.collection('folders')
      .where('nombre', '==', nombreCarpeta.trim())
      .where('seccion', '==', 'material')
      .where('carpetaPadreId', '==', null)
      .limit(1);

    const snapshot = await q.get();

    if (snapshot.empty) {
      console.warn(`   ⚠️  Carpeta no encontrada: "${nombreCarpeta}"`);
      return null;
    }

    return snapshot.docs[0].id;
  } catch (error) {
    console.error(`   ❌ Error al buscar carpeta "${nombreCarpeta}":`, error.message);
    return null;
  }
}

/**
 * Extrae el ID de Google Drive desde una URL
 */
function extraerGoogleDriveId(url) {
  if (!url) return null;

  // Diferentes formatos de URL de Google Drive:
  // https://drive.google.com/file/d/FILE_ID/view
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/uc?id=FILE_ID

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
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
async function convertirAMaterial(registro, carpetaId, autorRol) {
  // Extraer Google Drive ID de la URL
  const driveId = extraerGoogleDriveId(registro.archivoUrl);
  let archivoUrl = registro.archivoUrl.trim();

  // Si pudimos extraer el ID, construir una URL más limpia
  if (driveId) {
    archivoUrl = `https://drive.google.com/file/d/${driveId}/view`;
  }

  return {
    titulo: registro.titulo.trim(),
    descripcion: registro.descripcion?.trim() || '',
    tipo: registro.tipo.trim(),
    carrera: registro.carrera?.trim() || 'Enfermería',
    anio: registro.anio ? parseInt(registro.anio) : null,
    ramo: registro.ramo?.trim() || '',
    tags: procesarTags(registro.tags),
    archivoUrl: archivoUrl,
    googleDriveId: driveId || '',
    nombreArchivo: registro.titulo.trim(),
    autorId: AUTOR_ID,
    autorNombre: AUTOR_NOMBRE,
    autorRol: autorRol,
    carpetaId: carpetaId,
    fijado: false,
    fechaSubida: admin.firestore.FieldValue.serverTimestamp(),
    seccion: 'material'
  };
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function importarMateriales() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  IMPORTACIÓN DE MATERIALES DE ENFERMERÍA UC');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Verificar que existe el archivo CSV
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ Error: No se encontró el archivo ${CSV_FILE}`);
    console.error('   Coloca tu archivo EnfermeriaUC.csv en la raíz del proyecto\n');
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
      trim: true
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
    erroresValidacion.forEach(error => console.error(`   ${error}`));
    console.error('\nPor favor corrige estos errores en el CSV y vuelve a intentar.\n');
    process.exit(1);
  }
  console.log('✅ Todos los registros son válidos\n');

  // 4. Verificar autor y obtener su rol
  let autorRol = null;
  try {
    const autorDoc = await db.collection('usuarios').doc(AUTOR_ID).get();
    if (!autorDoc.exists) {
      console.error('❌ Error: El AUTOR_ID especificado no existe en la base de datos');
      console.error(`   AUTOR_ID: ${AUTOR_ID}`);
      console.error('   Por favor actualiza la variable AUTOR_ID en el script con un usuario válido.\n');
      process.exit(1);
    }
    const autorData = autorDoc.data();
    autorRol = autorData.rol || null;
    console.log(`✅ Autor verificado: ${autorData.nombre || AUTOR_NOMBRE} (Rol: ${autorRol || 'ninguno'})\n`);
  } catch (error) {
    console.error('❌ Error al verificar autor:', error.message);
    process.exit(1);
  }

  // 5. Procesar e importar materiales
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 IMPORTANDO MATERIALES\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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

  for (let i = 0; i < registros.length; i++) {
    const registro = registros[i];
    const numeroFila = i + 2; // +2 porque empezamos en 1 y la fila 1 es el header

    try {
      console.log(`[${i + 1}/${registros.length}] 📄 ${registro.titulo}`);

      // Buscar carpeta
      let carpetaId = null;
      if (registro.rutaCarpeta && registro.rutaCarpeta.trim() !== '') {
        carpetaId = await buscarCarpetaPorNombre(registro.rutaCarpeta);
        if (!carpetaId) {
          stats.sinCarpeta++;
          console.warn(`   ⚠️  Sin carpeta - se guardará en la raíz de Material`);
        } else {
          console.log(`   ✓ Carpeta: ${registro.rutaCarpeta}`);
        }
      } else {
        stats.sinCarpeta++;
        console.log(`   ℹ️  Sin carpeta especificada`);
      }

      // Crear material
      const material = await convertirAMaterial(registro, carpetaId, autorRol);
      const docRef = db.collection('material').doc();
      batch.set(docRef, material);
      batchCount++;

      console.log(`   ✅ Agregado al batch\n`);

      // Commit batch si alcanzamos el límite
      if (batchCount >= BATCH_SIZE) {
        console.log(`💾 Guardando batch de ${batchCount} materiales...\n`);
        await batch.commit();
        stats.exitosos += batchCount;
        console.log(`   ✓ Procesados ${stats.exitosos}/${stats.total} materiales\n`);
        // CREAR NUEVO BATCH después de commit
        batch = db.batch();
        batchCount = 0;
      }

    } catch (error) {
      stats.fallidos++;
      console.error(`   ❌ Error - ${error.message}\n`);
    }
  }

  // Commit batch final
  if (batchCount > 0) {
    console.log(`💾 Guardando batch final de ${batchCount} materiales...\n`);
    await batch.commit();
    stats.exitosos += batchCount;
  }

  // 6. Mostrar resumen
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📊 RESUMEN DE IMPORTACIÓN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total de registros:      ${stats.total}`);
  console.log(`✅ Importados:           ${stats.exitosos}`);
  console.log(`❌ Fallidos:             ${stats.fallidos}`);
  console.log(`⚠️  Sin carpeta:          ${stats.sinCarpeta}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (stats.exitosos === stats.total) {
    console.log('🎉 ¡Importación completada exitosamente!\n');
  } else if (stats.fallidos === 0) {
    console.log('✅ Importación completada con advertencias.\n');
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
