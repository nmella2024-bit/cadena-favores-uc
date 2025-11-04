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

// Configuración de Firebase (usar las mismas credenciales del proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyD4ZjQw7PQ1fPSA2P9axFobTPkZmBAnKss",
  authDomain: "red-uc-eeuu.firebaseapp.com",
  projectId: "red-uc-eeuu",
  storageBucket: "red-uc-eeuu.firebasestorage.app",
  messagingSenderId: "705871614487",
  appId: "1:705871614487:web:aab5ec45d47db1f7d44252",
  measurementId: "G-8RV5170JWM"
};

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
