/**
 * Script para obtener el ID de un usuario por email
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');
const EMAIL_TO_FIND = 'nmellaq@estudiante.uc.cl';

// Inicializar Firebase Admin
try {
  const serviceAccountKey = JSON.parse(
    fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8')
  );

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey)
    });
  }

  console.log('✅ Firebase Admin inicializado\n');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function getUserId() {
  try {
    console.log(`🔍 Buscando usuario con email: ${EMAIL_TO_FIND}\n`);

    const snapshot = await db.collection('usuarios')
      .where('email', '==', EMAIL_TO_FIND)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.log('❌ No se encontró ningún usuario con ese email');
      return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    console.log('✅ Usuario encontrado:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`ID:     ${doc.id}`);
    console.log(`Nombre: ${data.nombre || 'N/A'}`);
    console.log(`Email:  ${data.email}`);
    console.log(`Rol:    ${data.rol || 'N/A'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getUserId()
  .then(() => {
    console.log('✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
