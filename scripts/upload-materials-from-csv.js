/**
 * Script para subir materiales a Firestore desde el archivo CSV "OFG - Archivos.csv"
 *
 * Este script:
 * 1. Lee el archivo CSV con los materiales
 * 2. Crea los materiales en Firestore con sus URLs de Google Drive
 * 3. Los asocia a las carpetas correspondientes
 *
 * USO:
 * node scripts/upload-materials-from-csv.js
 *
 * REQUISITOS:
 * - Haber ejecutado primero create-folders-from-csv.js
 * - El archivo carpetas-mapping.json debe existir
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
const MAPPING_PATH = path.join(__dirname, 'carpetas-mapping.json');

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

/**
 * Función principal
 */
async function subirMaterialesDesdeCSV() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📤 SUBIENDO MATERIALES A FIRESTORE DESDE CSV\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Cargar el mapeo de carpetas
    console.log('📂 Cargando mapeo de carpetas...\n');
    if (!fs.existsSync(MAPPING_PATH)) {
      console.error('❌ Error: No se encontró carpetas-mapping.json');
      console.error('   Ejecuta primero: node scripts/create-folders-from-csv.js\n');
      process.exit(1);
    }

    const carpetasMapping = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf-8'));
    console.log(`   Encontradas ${Object.keys(carpetasMapping).length} carpetas en el mapeo\n`);

    // 2. Leer el archivo CSV
    console.log('📄 Leyendo archivo CSV...\n');
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`   Encontrados ${records.length} materiales en el CSV\n`);

    // 3. Procesar cada material
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔄 CREANDO MATERIALES\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let procesados = 0;
    let exitosos = 0;
    let errores = 0;
    let omitidos = 0;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      procesados++;

      console.log(`\n[${procesados}/${records.length}] 📄 ${record.titulo || 'Sin título'}`);

      // Validar que tenga URL y carpeta
      if (!record.archivoUrl || !record.archivoUrl.trim()) {
        console.log(`   ⚠️  Omitido: No tiene URL de archivo`);
        omitidos++;
        continue;
      }

      if (!record.rutaCarpeta || !record.rutaCarpeta.trim()) {
        console.log(`   ⚠️  Omitido: No tiene ruta de carpeta`);
        omitidos++;
        continue;
      }

      const rutaCarpeta = record.rutaCarpeta.trim();

      // Verificar que la carpeta existe en el mapeo
      if (!carpetasMapping[rutaCarpeta]) {
        console.log(`   ❌ Error: Carpeta "${rutaCarpeta}" no encontrada en el mapeo`);
        errores++;
        continue;
      }

      const carpetaId = carpetasMapping[rutaCarpeta];

      console.log(`   📁 Carpeta: ${rutaCarpeta}`);
      console.log(`   💾 Guardando en Firestore...`);

      // Crear material en Firestore
      try {
        const materialData = {
          titulo: record.titulo || 'Sin título',
          descripcion: record.descripcion || '',
          tipo: record.tipo || 'pdf',
          carrera: record.carrera || '',
          anio: record.anio || '',
          ramo: record.ramo || '',
          tags: record.tags ? record.tags.split(',').map(t => t.trim()).filter(t => t) : [],
          archivoUrl: record.archivoUrl.trim(),
          carpetaId: carpetaId,
          fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
          autorId: AUTOR_ID,
          autorNombre: AUTOR_NOMBRE,
        };

        const docRef = await db.collection('materials').add(materialData);
        console.log(`   ✅ Material creado: ${docRef.id}`);
        exitosos++;
      } catch (firestoreError) {
        console.log(`   ❌ Error al guardar en Firestore:`, firestoreError.message);
        errores++;
      }
    }

    // 4. Resumen
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 RESUMEN\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Total procesados:    ${procesados}`);
    console.log(`✅ Exitosos:          ${exitosos}`);
    console.log(`⚠️  Omitidos:          ${omitidos}`);
    console.log(`❌ Errores:           ${errores}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (exitosos > 0) {
      console.log('🎉 Materiales subidos exitosamente!\n');
      console.log('   Los materiales están disponibles en la página web\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('\nStack trace:', error.stack);
  }
}

// Ejecutar
subirMaterialesDesdeCSV()
  .then(() => {
    console.log('✅ Script finalizado\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
