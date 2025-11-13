/**
 * Script para agregar material de ejemplo a la colección 'material' en Firestore
 *
 * USO:
 * node scripts/seed-material.js
 *
 * Este script agrega documentos de ejemplo para probar la funcionalidad de Material
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
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

// Datos de ejemplo para material académico
const materialesEjemplo = [
  {
    titulo: "Resumen Álgebra Lineal - 2024",
    descripcion: "Apunte completo con ejercicios resueltos de matrices, vectores y espacios vectoriales.",
    carrera: "Ingeniería",
    anio: 1,
    ramo: "Álgebra Lineal",
    archivoUrl: "https://example.com/algebra-lineal-resumen.pdf",
    autorId: "admin",
    autorNombre: "Equipo Red UC",
    fechaSubida: new Date().toISOString(),
    tags: ["matrices", "vectores", "resumen", "uc", "algebra"],
    tipo: "PDF"
  },
  {
    titulo: "Guía Cálculo I - Derivadas",
    descripcion: "Guía de ejercicios de derivadas con soluciones paso a paso.",
    carrera: "Ingeniería",
    anio: 1,
    ramo: "Cálculo I",
    archivoUrl: "https://example.com/calculo-1-derivadas.pdf",
    autorId: "admin",
    autorNombre: "Prof. Juan Pérez",
    fechaSubida: new Date().toISOString(),
    tags: ["calculo", "derivadas", "ejercicios", "matematicas"],
    tipo: "PDF"
  },
  {
    titulo: "Apuntes Física I - Mecánica",
    descripcion: "Apuntes completos de mecánica clásica con ejemplos y diagramas.",
    carrera: "Ingeniería",
    anio: 1,
    ramo: "Física I",
    archivoUrl: "https://example.com/fisica-1-mecanica.pdf",
    autorId: "admin",
    autorNombre: "Laboratorio de Física",
    fechaSubida: new Date().toISOString(),
    tags: ["fisica", "mecanica", "newton", "fuerzas"],
    tipo: "PDF"
  },
  {
    titulo: "Resumen Historia de la Arquitectura",
    descripcion: "Resumen de los principales movimientos arquitectónicos desde la antigüedad hasta el siglo XX.",
    carrera: "Arquitectura",
    anio: 2,
    ramo: "Historia de la Arquitectura",
    archivoUrl: "https://example.com/historia-arquitectura.pdf",
    autorId: "admin",
    autorNombre: "María González",
    fechaSubida: new Date().toISOString(),
    tags: ["arquitectura", "historia", "movimientos", "estilos"],
    tipo: "PDF"
  },
  {
    titulo: "Microeconomía - Teoría del Consumidor",
    descripcion: "Apunte detallado sobre la teoría del consumidor, curvas de indiferencia y utilidad.",
    carrera: "Economía",
    anio: 2,
    ramo: "Microeconomía",
    archivoUrl: "https://example.com/microeconomia-consumidor.pdf",
    autorId: "admin",
    autorNombre: "Dpto. Economía",
    fechaSubida: new Date().toISOString(),
    tags: ["economia", "microeconomia", "consumidor", "utilidad"],
    tipo: "PDF"
  },
  {
    titulo: "Programación - Estructuras de Datos",
    descripcion: "Guía completa de estructuras de datos: listas, pilas, colas, árboles y grafos.",
    carrera: "Ingeniería",
    anio: 2,
    ramo: "Estructuras de Datos",
    archivoUrl: "https://example.com/estructuras-datos.pdf",
    autorId: "admin",
    autorNombre: "Lab. Computación",
    fechaSubida: new Date().toISOString(),
    tags: ["programacion", "estructuras", "algoritmos", "codigo"],
    tipo: "PDF"
  },
  {
    titulo: "Cálculo II - Integrales",
    descripcion: "Material de estudio con ejercicios resueltos de integrales definidas e indefinidas.",
    carrera: "Ingeniería",
    anio: 1,
    ramo: "Cálculo II",
    archivoUrl: "https://example.com/calculo-2-integrales.pdf",
    autorId: "admin",
    autorNombre: "Prof. Ana Martínez",
    fechaSubida: new Date().toISOString(),
    tags: ["calculo", "integrales", "matematicas", "ejercicios"],
    tipo: "PDF"
  },
  {
    titulo: "Filosofía - Introducción a la Ética",
    descripcion: "Resumen de las principales corrientes éticas y sus representantes.",
    carrera: "College",
    anio: 1,
    ramo: "Filosofía",
    archivoUrl: "https://example.com/filosofia-etica.pdf",
    autorId: "admin",
    autorNombre: "Prof. Carlos Rojas",
    fechaSubida: new Date().toISOString(),
    tags: ["filosofia", "etica", "moral", "pensamiento"],
    tipo: "PDF"
  },
  {
    titulo: "Química General - Reacciones Químicas",
    descripcion: "Guía de laboratorio con experimentos y reacciones químicas fundamentales.",
    carrera: "Ingeniería",
    anio: 1,
    ramo: "Química General",
    archivoUrl: "https://example.com/quimica-reacciones.pdf",
    autorId: "admin",
    autorNombre: "Lab. Química",
    fechaSubida: new Date().toISOString(),
    tags: ["quimica", "reacciones", "laboratorio", "experimentos"],
    tipo: "PDF"
  },
  {
    titulo: "Macroeconomía - PIB y Crecimiento",
    descripcion: "Material sobre indicadores macroeconómicos, PIB, inflación y políticas económicas.",
    carrera: "Economía",
    anio: 2,
    ramo: "Macroeconomía",
    archivoUrl: "https://example.com/macroeconomia-pib.pdf",
    autorId: "admin",
    autorNombre: "Prof. Laura Silva",
    fechaSubida: new Date().toISOString(),
    tags: ["economia", "macroeconomia", "pib", "indicadores"],
    tipo: "PDF"
  }
];

// Función para agregar materiales a Firestore
async function seedMaterial() {
  console.log('🚀 Iniciando carga de material de ejemplo...\n');

  try {
    const materialRef = collection(db, 'material');
    let count = 0;

    for (const material of materialesEjemplo) {
      const docRef = await addDoc(materialRef, material);
      count++;
      console.log(`✅ [${count}/${materialesEjemplo.length}] Agregado: ${material.titulo}`);
      console.log(`   📚 ${material.carrera} - ${material.ramo} (${material.anio}º año)`);
      console.log(`   🆔 ID: ${docRef.id}\n`);
    }

    console.log(`\n✨ ¡Proceso completado! Se agregaron ${count} materiales a Firestore.`);
    console.log('\n📝 Puedes ver los materiales en:');
    console.log('   https://console.firebase.google.com/project/red-uc-eeuu/firestore/data/material');

  } catch (error) {
    console.error('❌ Error al agregar materiales:', error);
  }
}

// Ejecutar el script
seedMaterial()
  .then(() => {
    console.log('\n👋 Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
