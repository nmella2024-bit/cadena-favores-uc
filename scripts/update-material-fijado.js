/**
 * Script para agregar el campo 'fijado: false' a todos los materiales existentes en Firestore
 *
 * USO:
 * node scripts/update-material-fijado.js
 *
 * Este script actualiza todos los documentos de la colección 'material'
 * agregando el campo 'fijado' con valor 'false' si no existe.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
require('dotenv').config();

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validar que las variables de entorno estén configuradas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ ERROR: Variables de entorno de Firebase no configuradas.');
  console.error('Crea un archivo .env en la raíz del proyecto con las credenciales de Firebase.');
  process.exit(1);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para actualizar materiales
async function updateMaterialFijado() {
  console.log('🚀 Iniciando actualización de materiales...\n');

  try {
    const materialRef = collection(db, 'material');
    const querySnapshot = await getDocs(materialRef);

    console.log(`📊 Se encontraron ${querySnapshot.size} materiales en total.\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();

      // Solo actualizar si no existe el campo 'fijado'
      if (data.fijado === undefined) {
        const docRef = doc(db, 'material', docSnapshot.id);
        await updateDoc(docRef, { fijado: false });
        updatedCount++;
        console.log(`✅ Actualizado: ${data.titulo || 'Sin título'}`);
        console.log(`   🆔 ID: ${docSnapshot.id}\n`);
      } else {
        skippedCount++;
        console.log(`⏭️  Saltado (ya tiene campo fijado): ${data.titulo || 'Sin título'}`);
      }
    }

    console.log(`\n✨ ¡Proceso completado!`);
    console.log(`   ✅ Actualizados: ${updatedCount}`);
    console.log(`   ⏭️  Saltados: ${skippedCount}`);
    console.log(`   📊 Total: ${querySnapshot.size}`);

    console.log('\n📝 Puedes verificar los cambios en:');
    console.log('   https://console.firebase.google.com/project/red-uc-eeuu/firestore/data/material');

  } catch (error) {
    console.error('❌ Error al actualizar materiales:', error);
  }
}

// Ejecutar el script
updateMaterialFijado()
  .then(() => {
    console.log('\n👋 Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
