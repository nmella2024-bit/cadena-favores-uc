/**
 * Script de prueba para verificar la conexión a Firestore
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer configuración
const firebaseConfigPath = join(__dirname, '../src/firebaseConfig.js');
const firebaseConfigContent = readFileSync(firebaseConfigPath, 'utf-8');

const extractConfig = (content) => {
  const apiKey = content.match(/apiKey:\s*['"](.*?)['"]/)?.[1] || '';
  const authDomain = content.match(/authDomain:\s*['"](.*?)['"]/)?.[1] || '';
  const projectId = content.match(/projectId:\s*['"](.*?)['"]/)?.[1] || '';
  const storageBucket = content.match(/storageBucket:\s*['"](.*?)['"]/)?.[1] || '';
  const messagingSenderId = content.match(/messagingSenderId:\s*['"](.*?)['"]/)?.[1] || '';
  const appId = content.match(/appId:\s*['"](.*?)['"]/)?.[1] || '';

  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
};

const firebaseConfig = extractConfig(firebaseConfigContent);

console.log('🔧 Probando conexión a Firestore...\n');
console.log('Configuración:');
console.log(`   Project ID: ${firebaseConfig.projectId}`);
console.log(`   Auth Domain: ${firebaseConfig.authDomain}`);
console.log();

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
  try {
    console.log('📝 Intentando crear un documento de prueba en "folders"...');

    const testDoc = {
      nombre: 'Test Carpeta',
      carpetaPadreId: null,
      autorId: 'test-system',
      autorNombre: 'Test',
      fechaCreacion: serverTimestamp(),
      tipo: 'carpeta'
    };

    const docRef = await addDoc(collection(db, 'folders'), testDoc);
    console.log('✅ Documento creado exitosamente!');
    console.log(`   ID: ${docRef.id}`);
    console.log();

    console.log('📖 Intentando leer documentos de "folders"...');
    const querySnapshot = await getDocs(collection(db, 'folders'));
    console.log(`✅ Se encontraron ${querySnapshot.size} documentos en "folders"`);

    querySnapshot.forEach((doc) => {
      console.log(`   - ${doc.id}: ${doc.data().nombre}`);
    });

    console.log('\n✅ ¡Conexión exitosa! Firestore está funcionando correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al conectar con Firestore:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code);
    console.error('\n📋 Posibles causas:');
    console.error('   1. Firestore no está habilitado en Firebase Console');
    console.error('   2. Las reglas de seguridad están bloqueando el acceso');
    console.error('   3. El proyecto Firebase no existe o está mal configurado');
    console.error('\n🔗 Accede a Firebase Console:');
    console.error(`   https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`);
    process.exit(1);
  }
}

testConnection();
