/**
 * Script para importar solo los materiales que faltan
 * (Excluye los que ya existen en Firestore)
 *
 * USO:
 * npm run import:missing
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
  console.log('✅ Firebase Admin inicializado correctamente\n');
} catch (error) {
  console.error('❌ Error al inicializar Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Cache de carpetas
const carpetasCache = new Map();

/**
 * Busca una carpeta por su ruta completa
 */
async function buscarCarpetaPorRuta(ruta) {
  if (!ruta || ruta.trim() === '') {
    return null;
  }

  // Verificar cache
  if (carpetasCache.has(ruta)) {
    return carpetasCache.get(ruta);
  }

  const partes = ruta.split('/').map(p => p.trim()).filter(p => p !== '');
  let carpetaPadreId = null;

  for (const nombreCarpeta of partes) {
    const q = db.collection('folders')
      .where('nombre', '==', nombreCarpeta)
      .where('carpetaPadreId', '==', carpetaPadreId)
      .limit(1);

    const snapshot = await q.get();

    if (snapshot.empty) {
      carpetasCache.set(ruta, null);
      return null;
    }

    carpetaPadreId = snapshot.docs[0].id;
  }

  carpetasCache.set(ruta, carpetaPadreId);
  return carpetaPadreId;
}

function procesarTags(tagsString) {
  if (!tagsString) return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
}

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
    profesor: registro.profesor?.trim() || '',
    semestre: registro.semestre?.trim() || ''
  };
}

async function main() {
  console.log('=================================================');
  console.log('  IMPORTAR MATERIALES FALTANTES');
  console.log('=================================================\n');

  // 1. Leer CSV
  console.log('📖 Leyendo CSV...');
  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const registros = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
    escape: '"',
    quote: '"'
  });
  console.log(`   Total de registros en CSV: ${registros.length}\n`);

  // 2. Obtener URLs que ya existen en Firestore
  console.log('📥 Obteniendo materiales existentes de Firestore...');
  const materialesSnapshot = await db.collection('material').get();
  const urlsExistentes = new Set();

  materialesSnapshot.docs.forEach(doc => {
    const material = doc.data();
    if (material.archivoUrl) {
      urlsExistentes.add(material.archivoUrl.trim());
    }
  });

  console.log(`   Materiales existentes en Firestore: ${urlsExistentes.size}\n`);

  // 3. Filtrar registros que NO existen
  console.log('🔍 Filtrando materiales faltantes...');
  const registrosFaltantes = registros.filter(registro => {
    return registro.archivoUrl &&
           registro.archivoUrl.trim() !== '' &&
           !urlsExistentes.has(registro.archivoUrl.trim());
  });

  console.log(`   Materiales faltantes a importar: ${registrosFaltantes.length}\n`);

  if (registrosFaltantes.length === 0) {
    console.log('✅ ¡Todos los materiales ya están importados!\n');
    return;
  }

  // 4. Validar registros faltantes
  console.log('🔍 Validando registros faltantes...');
  const erroresValidacion = [];

  registrosFaltantes.forEach((registro, index) => {
    const errores = [];

    if (!registro.titulo || registro.titulo.trim() === '') {
      errores.push('Falta el título');
    }
    if (!registro.tipo || registro.tipo.trim() === '') {
      errores.push('Falta el tipo');
    }

    if (errores.length > 0) {
      erroresValidacion.push(`Registro ${index + 1}: ${errores.join(', ')}`);
    }
  });

  if (erroresValidacion.length > 0) {
    console.error('❌ Se encontraron errores de validación:\n');
    erroresValidacion.forEach(error => console.error(`   ${error}`));
    console.error('\nPor favor corrige estos errores y vuelve a intentar.\n');
    process.exit(1);
  }
  console.log('✅ Todos los registros son válidos\n');

  // 5. Importar materiales faltantes
  console.log('📥 Iniciando importación de materiales faltantes...\n');

  const stats = {
    total: registrosFaltantes.length,
    exitosos: 0,
    fallidos: 0,
    advertencias: 0
  };

  let batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;

  for (let i = 0; i < registrosFaltantes.length; i++) {
    const registro = registrosFaltantes[i];

    try {
      // Buscar carpeta
      let carpetaId = null;
      if (registro.carpetaRuta && registro.carpetaRuta.trim() !== '') {
        carpetaId = await buscarCarpetaPorRuta(registro.carpetaRuta);
        if (!carpetaId) {
          stats.advertencias++;
          if (stats.advertencias <= 5) {
            console.warn(`   ⚠️  Material ${i + 1}: Carpeta no encontrada: ${registro.carpetaRuta}`);
          }
        }
      }

      // Crear material
      const material = await convertirAMaterial(registro, carpetaId);
      const docRef = db.collection('material').doc();
      batch.set(docRef, material);
      batchCount++;

      // Commit batch
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        stats.exitosos += batchCount;
        console.log(`   ✓ Procesados ${stats.exitosos}/${stats.total} materiales...`);
        batch = db.batch();
        batchCount = 0;
      }

    } catch (error) {
      stats.fallidos++;
      console.error(`   ❌ Material ${i + 1}: Error - ${error.message}`);
    }
  }

  // Commit final
  if (batchCount > 0) {
    await batch.commit();
    stats.exitosos += batchCount;
  }

  // 6. Resumen
  console.log('\n=================================================');
  console.log('  RESUMEN DE IMPORTACIÓN');
  console.log('=================================================');
  console.log(`Total de materiales en CSV:       ${registros.length}`);
  console.log(`Ya existían en Firestore:         ${urlsExistentes.size}`);
  console.log(`Materiales faltantes:             ${stats.total}`);
  console.log(`✅ Importados exitosamente:       ${stats.exitosos}`);
  console.log(`❌ Fallidos:                      ${stats.fallidos}`);
  console.log(`⚠️  Sin carpeta asignada:          ${stats.advertencias}`);
  console.log('=================================================\n');

  if (stats.exitosos === stats.total) {
    console.log('🎉 ¡Importación completada exitosamente!\n');
  } else if (stats.exitosos > 0) {
    console.log('⚠️  Importación completada con algunos errores.\n');
  }

  const totalFinal = urlsExistentes.size + stats.exitosos;
  console.log(`📊 Total de materiales en Firestore ahora: ${totalFinal}\n`);
}

main()
  .then(() => {
    console.log('✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
