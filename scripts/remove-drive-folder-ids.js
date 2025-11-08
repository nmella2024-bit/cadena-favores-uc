/**
 * Script para remover googleDriveFolderId de todas las carpetas
 * y volver a usar Firebase Storage
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CREDENTIALS_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');

// Inicializar Firebase Admin
try {
  const serviceAccount = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function removerDriveFolderIds() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🗑️  REMOVIENDO GOOGLE DRIVE FOLDER IDS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const snapshot = await db.collection('folders').get();
    const carpetas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Total de carpetas: ${carpetas.length}\n`);

    const conDrive = carpetas.filter(c => c.googleDriveFolderId);

    console.log(`Carpetas con googleDriveFolderId: ${conDrive.length}\n`);

    if (conDrive.length === 0) {
      console.log('✅ No hay carpetas con googleDriveFolderId\n');
      return;
    }

    console.log('Removiendo googleDriveFolderId...\n');

    let batch = db.batch();
    let count = 0;
    let batchCount = 0;

    for (const carpeta of conDrive) {
      const ref = db.collection('folders').doc(carpeta.id);
      batch.update(ref, {
        googleDriveFolderId: admin.firestore.FieldValue.delete(),
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
      });
      count++;
      batchCount++;

      // Firestore batch limit is 500
      if (batchCount === 500) {
        await batch.commit();
        console.log(`   Procesadas ${count} carpetas...`);
        batch = db.batch(); // Crear nuevo batch
        batchCount = 0;
      }
    }

    // Commit el último batch si tiene operaciones pendientes
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`\n✅ ${count} carpetas actualizadas\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 Ahora las carpetas usarán Firebase Storage\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

removerDriveFolderIds()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
