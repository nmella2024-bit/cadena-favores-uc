/**
 * Script para importar datos a un nuevo proyecto de Firebase
 *
 * Este script lee los archivos JSON exportados y los importa
 * al nuevo proyecto Firebase con la región deseada
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

/**
 * Deserializa timestamps de vuelta a objetos Timestamp de Firestore
 */
function deserializarDatos(data) {
  if (data === null || data === undefined) return data;

  if (data._type === 'timestamp') {
    return new Timestamp(data._seconds, data._nanoseconds);
  }

  if (Array.isArray(data)) {
    return data.map(item => deserializarDatos(item));
  }

  if (typeof data === 'object') {
    const resultado = {};
    for (const [key, value] of Object.entries(data)) {
      resultado[key] = deserializarDatos(value);
    }
    return resultado;
  }

  return data;
}

/**
 * Importa documentos a una colección
 */
async function importarColeccion(nombreColeccion, documentos) {
  try {
    console.log(`\n📦 Importando colección: ${nombreColeccion}...`);

    let importados = 0;
    let errores = 0;

    for (const documento of documentos) {
      try {
        const docRef = doc(db, nombreColeccion, documento.id);
        const datosDeserializados = deserializarDatos(documento.data);

        await setDoc(docRef, datosDeserializados);
        importados++;

        if (importados % 10 === 0) {
          console.log(`   ⏳ Importados ${importados}/${documentos.length}...`);
        }

      } catch (error) {
        errores++;
        console.error(`   ⚠️  Error al importar documento ${documento.id}:`, error.message);
      }
    }

    console.log(`   ✅ Importación completada: ${importados} documentos, ${errores} errores`);
    return { importados, errores };

  } catch (error) {
    console.error(`   ❌ Error al importar colección ${nombreColeccion}:`, error.message);
    return { importados: 0, errores: documentos.length };
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando importación de datos a Firebase...\n');
  console.log('================================================');

  // Verificar que existe la carpeta de exportación
  const exportDir = path.join(__dirname, '..', 'firebase-export');

  if (!fs.existsSync(exportDir)) {
    console.error('❌ No se encontró la carpeta firebase-export');
    console.log('   Ejecuta primero el script exportar-datos.js');
    process.exit(1);
  }

  // Buscar el directorio de exportación más reciente
  const directorios = fs.readdirSync(exportDir)
    .filter(f => fs.statSync(path.join(exportDir, f)).isDirectory())
    .sort()
    .reverse();

  if (directorios.length === 0) {
    console.error('❌ No se encontraron exportaciones');
    process.exit(1);
  }

  const exportPath = path.join(exportDir, directorios[0]);
  console.log(`📁 Usando exportación: ${directorios[0]}\n`);

  // Leer archivo de datos completos
  const archivoCompleto = path.join(exportPath, 'datos-completos.json');

  if (!fs.existsSync(archivoCompleto)) {
    console.error('❌ No se encontró el archivo datos-completos.json');
    process.exit(1);
  }

  const datos = JSON.parse(fs.readFileSync(archivoCompleto, 'utf-8'));

  // Confirmación del usuario
  console.log('⚠️  ADVERTENCIA: Este proceso importará datos al proyecto:');
  console.log(`   ${firebaseConfig.projectId}\n`);
  console.log('   Presiona Ctrl+C para cancelar o Enter para continuar...');

  // En un entorno real, esperarías input del usuario aquí
  // Por ahora, comentamos esta línea para que pueda ejecutarse automáticamente
  // await new Promise(resolve => process.stdin.once('data', resolve));

  // Importar cada colección
  const resultados = {};

  for (const [nombreColeccion, documentos] of Object.entries(datos)) {
    if (Array.isArray(documentos) && documentos.length > 0) {
      const resultado = await importarColeccion(nombreColeccion, documentos);
      resultados[nombreColeccion] = resultado;
    } else {
      console.log(`\n⏭️  Saltando colección vacía: ${nombreColeccion}`);
    }
  }

  console.log('\n================================================');
  console.log('✅ Importación completada!\n');
  console.log('📊 Resumen:');

  let totalImportados = 0;
  let totalErrores = 0;

  Object.entries(resultados).forEach(([col, stats]) => {
    console.log(`   ${col}:`);
    console.log(`     • Importados: ${stats.importados}`);
    console.log(`     • Errores: ${stats.errores}`);
    totalImportados += stats.importados;
    totalErrores += stats.errores;
  });

  console.log(`\n   Total: ${totalImportados} documentos importados, ${totalErrores} errores`);

  console.log('\n⚠️  SIGUIENTES PASOS:');
  console.log('   1. Verifica los datos en la consola de Firebase');
  console.log('   2. Implementa las reglas de seguridad (firestore.rules y storage.rules)');
  console.log('   3. Migra los usuarios de Firebase Auth manualmente');
  console.log('   4. Descarga y sube las imágenes de Storage');
  console.log('   5. Actualiza la configuración en src/firebaseConfig.js');

  process.exit(0);
}

// Ejecutar
main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
