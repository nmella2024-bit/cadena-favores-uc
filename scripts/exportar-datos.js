/**
 * Script para exportar datos de Firestore del proyecto actual
 *
 * Este script exporta todas las colecciones de Firestore a archivos JSON
 * para poder importarlos posteriormente en un nuevo proyecto Firebase
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANTE: Reemplaza esto con tu configuración actual de Firebase
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

// Colecciones a exportar
const COLECCIONES = [
  'favores',
  'usuarios',
  'feedback',
  'anuncios',
  'calificaciones',
  'marketplace'
];

/**
 * Convierte timestamps de Firestore a formato serializable
 */
function serializarDatos(data) {
  if (data === null || data === undefined) return data;

  if (data.toDate && typeof data.toDate === 'function') {
    // Es un Timestamp de Firestore
    return {
      _type: 'timestamp',
      _seconds: data.seconds,
      _nanoseconds: data.nanoseconds
    };
  }

  if (Array.isArray(data)) {
    return data.map(item => serializarDatos(item));
  }

  if (typeof data === 'object') {
    const resultado = {};
    for (const [key, value] of Object.entries(data)) {
      resultado[key] = serializarDatos(value);
    }
    return resultado;
  }

  return data;
}

/**
 * Exporta una colección completa a JSON
 */
async function exportarColeccion(nombreColeccion) {
  try {
    console.log(`\n📦 Exportando colección: ${nombreColeccion}...`);

    const coleccionRef = collection(db, nombreColeccion);
    const snapshot = await getDocs(coleccionRef);

    const documentos = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      documentos.push({
        id: doc.id,
        data: serializarDatos(data)
      });
    });

    console.log(`   ✅ ${documentos.length} documentos encontrados`);
    return documentos;

  } catch (error) {
    console.error(`   ❌ Error al exportar ${nombreColeccion}:`, error.message);
    return [];
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando exportación de datos de Firebase...\n');
  console.log('================================================');

  // Crear carpeta de exportación
  const exportDir = path.join(__dirname, '..', 'firebase-export');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const exportPath = path.join(exportDir, `export-${timestamp}`);

  if (!fs.existsSync(exportPath)) {
    fs.mkdirSync(exportPath, { recursive: true });
  }

  // Exportar cada colección
  const resultados = {};

  for (const coleccion of COLECCIONES) {
    const datos = await exportarColeccion(coleccion);
    resultados[coleccion] = datos;

    // Guardar archivo individual por colección
    const archivoColeccion = path.join(exportPath, `${coleccion}.json`);
    fs.writeFileSync(
      archivoColeccion,
      JSON.stringify(datos, null, 2),
      'utf-8'
    );
    console.log(`   💾 Guardado en: ${archivoColeccion}`);
  }

  // Guardar archivo consolidado
  const archivoCompleto = path.join(exportPath, 'datos-completos.json');
  fs.writeFileSync(
    archivoCompleto,
    JSON.stringify(resultados, null, 2),
    'utf-8'
  );

  // Guardar metadatos
  const metadatos = {
    fechaExportacion: new Date().toISOString(),
    proyecto: firebaseConfig.projectId,
    colecciones: Object.keys(resultados),
    totalDocumentos: Object.values(resultados).reduce((sum, arr) => sum + arr.length, 0),
    estadisticas: Object.fromEntries(
      Object.entries(resultados).map(([key, value]) => [key, value.length])
    )
  };

  const archivoMetadatos = path.join(exportPath, 'metadatos.json');
  fs.writeFileSync(
    archivoMetadatos,
    JSON.stringify(metadatos, null, 2),
    'utf-8'
  );

  console.log('\n================================================');
  console.log('✅ Exportación completada exitosamente!\n');
  console.log('📊 Resumen:');
  console.log(`   - Total de documentos: ${metadatos.totalDocumentos}`);
  console.log('   - Documentos por colección:');
  Object.entries(metadatos.estadisticas).forEach(([col, count]) => {
    console.log(`     • ${col}: ${count}`);
  });
  console.log(`\n📁 Archivos guardados en: ${exportPath}`);
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   - Los usuarios de Firebase Auth deben exportarse por separado');
  console.log('   - Las imágenes de Storage deben descargarse manualmente');
  console.log('   - Revisa los archivos JSON antes de importarlos');

  process.exit(0);
}

// Ejecutar
main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
