/**
 * Script para ELIMINAR TODOS los materiales de Firestore
 *
 * ⚠️ ADVERTENCIA: Este script borrará TODOS los materiales.
 * Úsalo solo si necesitas empezar desde cero.
 *
 * USO:
 * npm run clean:materiales
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');

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
// FUNCIÓN PARA CONFIRMAR
// ============================================

function preguntarConfirmacion(pregunta) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(pregunta, (respuesta) => {
      rl.close();
      resolve(respuesta.toLowerCase() === 'si' || respuesta.toLowerCase() === 'sí');
    });
  });
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function limpiarColeccion() {
  console.log('=================================================');
  console.log('  ⚠️  LIMPIEZA DE COLECCIÓN MATERIAL');
  console.log('=================================================\n');

  console.log('⚠️  ADVERTENCIA: Este script eliminará TODOS los materiales de Firestore.');
  console.log('   Esta acción NO se puede deshacer.\n');

  // Contar materiales
  console.log('📊 Contando materiales...');
  const snapshot = await db.collection('material').count().get();
  const totalMateriales = snapshot.data().count;
  console.log(`   Total de materiales en la base de datos: ${totalMateriales}\n`);

  if (totalMateriales === 0) {
    console.log('✅ La colección ya está vacía. No hay nada que eliminar.\n');
    process.exit(0);
  }

  // Solicitar confirmación
  const confirmacion1 = await preguntarConfirmacion(
    `¿Estás SEGURO de que quieres eliminar ${totalMateriales} materiales? (escribe "si" para confirmar): `
  );

  if (!confirmacion1) {
    console.log('\n❌ Operación cancelada. No se eliminó nada.\n');
    process.exit(0);
  }

  const confirmacion2 = await preguntarConfirmacion(
    '¿REALMENTE seguro? Esta acción NO se puede deshacer (escribe "si" nuevamente): '
  );

  if (!confirmacion2) {
    console.log('\n❌ Operación cancelada. No se eliminó nada.\n');
    process.exit(0);
  }

  // Eliminar materiales
  console.log('\n🗑️  Eliminando materiales...\n');

  const batchSize = 500;
  let totalEliminados = 0;

  try {
    while (true) {
      // Obtener un lote de documentos
      const querySnapshot = await db.collection('material').limit(batchSize).get();

      if (querySnapshot.empty) {
        break; // No hay más documentos
      }

      // Crear batch para eliminar
      const batch = db.batch();
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      totalEliminados += querySnapshot.size;

      console.log(`   ✓ Eliminados ${totalEliminados}/${totalMateriales} materiales...`);
    }

    console.log('\n=================================================');
    console.log('  RESUMEN');
    console.log('=================================================');
    console.log(`✅ Eliminados: ${totalEliminados} materiales`);
    console.log('=================================================\n');

    console.log('✅ Colección limpiada exitosamente.\n');

  } catch (error) {
    console.error('\n❌ Error al eliminar materiales:', error.message);
    process.exit(1);
  }
}

// ============================================
// EJECUTAR
// ============================================

limpiarColeccion()
  .then(() => {
    console.log('✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
