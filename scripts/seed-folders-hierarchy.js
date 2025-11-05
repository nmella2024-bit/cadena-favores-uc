/**
 * Script para crear la estructura jerárquica de carpetas
 * Basado en la estructura de OneDrive de Apuntes de Solidaridad Ing
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer la configuración de Firebase desde firebaseConfig.js
const firebaseConfigPath = join(__dirname, '../src/firebaseConfig.js');
const firebaseConfigContent = readFileSync(firebaseConfigPath, 'utf-8');

// Extraer las variables de configuración del archivo
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

// Validar que tenemos configuración
if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
  console.error('❌ Error: No se pudo leer la configuración de Firebase');
  console.error('   Verifica que src/firebaseConfig.js existe y tiene los valores correctos');
  process.exit(1);
}

console.log('🔧 Configuración de Firebase cargada:');
console.log(`   Project ID: ${firebaseConfig.projectId}`);
console.log(`   Auth Domain: ${firebaseConfig.authDomain}`);
console.log();

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Conexión a Firestore establecida\n');
} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error.message);
  process.exit(1);
}

// ID de usuario del sistema (ajustar según tu configuración)
const SYSTEM_USER_ID = 'system';
const SYSTEM_USER_NAME = 'Sistema';

/**
 * Crea una carpeta en Firestore
 */
async function crearCarpeta(nombre, carpetaPadreId = null) {
  try {
    const carpetaData = {
      nombre,
      carpetaPadreId: carpetaPadreId || null,
      autorId: SYSTEM_USER_ID,
      autorNombre: SYSTEM_USER_NAME,
      fechaCreacion: serverTimestamp(),
      tipo: 'carpeta'
    };

    const docRef = await addDoc(collection(db, 'folders'), carpetaData);
    console.log(`✓ Carpeta creada: ${nombre} (ID: ${docRef.id})`);
    return docRef.id;
  } catch (error) {
    console.error(`✗ Error al crear carpeta "${nombre}":`, error.message);
    if (error.code) {
      console.error(`   Código de error: ${error.code}`);
    }
    throw error;
  }
}

/**
 * Verifica si una carpeta ya existe
 */
async function carpetaExiste(nombre, carpetaPadreId = null) {
  const q = query(
    collection(db, 'folders'),
    where('nombre', '==', nombre),
    where('carpetaPadreId', '==', carpetaPadreId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty ? snapshot.docs[0].id : null;
}

/**
 * Crea una carpeta solo si no existe
 */
async function crearCarpetaSiNoExiste(nombre, carpetaPadreId = null) {
  const existente = await carpetaExiste(nombre, carpetaPadreId);
  if (existente) {
    console.log(`ℹ Carpeta ya existe: ${nombre} (ID: ${existente})`);
    return existente;
  }
  return await crearCarpeta(nombre, carpetaPadreId);
}

/**
 * Estructura jerárquica completa
 */
async function crearEstructuraCompleta() {
  console.log('🚀 Iniciando creación de estructura de carpetas...\n');

  try {
    // 1° Semestre
    const primerSemestre = await crearCarpetaSiNoExiste('1° Semestre');

    // Nivelación Cálculo
    const nivelacionCalculo = await crearCarpetaSiNoExiste('Nivelación Cálculo', primerSemestre);

    // Química para Ingeniería (QIM100E)
    const quimica = await crearCarpetaSiNoExiste('Química para Ingeniería (QIM100E)', primerSemestre);
    await crearCarpetaSiNoExiste('Pruebas anteriores', quimica);
    const quimicaTaller = await crearCarpetaSiNoExiste('Taller', quimica);
    await crearCarpetaSiNoExiste('T1', quimicaTaller);
    await crearCarpetaSiNoExiste('T2', quimicaTaller);
    await crearCarpetaSiNoExiste('T3', quimicaTaller);
    await crearCarpetaSiNoExiste('T4', quimicaTaller);
    await crearCarpetaSiNoExiste('T5', quimicaTaller);
    await crearCarpetaSiNoExiste('Otros', quimicaTaller);
    await crearCarpetaSiNoExiste('Clases', quimica);

    // Cálculo 1 (MAT1610)
    const calculo1 = await crearCarpetaSiNoExiste('Cálculo 1 (MAT1610)', primerSemestre);
    await crearCarpetaSiNoExiste('Pruebas Anteriores', calculo1);
    await crearCarpetaSiNoExiste('Controles y Guías', calculo1);
    await crearCarpetaSiNoExiste('Libros', calculo1);
    await crearCarpetaSiNoExiste('Ayudantías', calculo1);

    // Álgebra Lineal (MAT1203)
    const algebraLineal = await crearCarpetaSiNoExiste('Álgebra Lineal (MAT1203)', primerSemestre);
    const algebraPruebas = await crearCarpetaSiNoExiste('Pruebas Anteriores', algebraLineal);
    await crearCarpetaSiNoExiste('I1', algebraPruebas);
    await crearCarpetaSiNoExiste('I2', algebraPruebas);
    await crearCarpetaSiNoExiste('I3', algebraPruebas);
    await crearCarpetaSiNoExiste('Examen', algebraPruebas);
    await crearCarpetaSiNoExiste('Ejercicios', algebraPruebas);
    await crearCarpetaSiNoExiste('Apuntes, Libro y Ejercicios', algebraLineal);
    await crearCarpetaSiNoExiste('Catedra', algebraLineal);

    // 2° Semestre
    const segundoSemestre = await crearCarpetaSiNoExiste('2° Semestre');

    // Cálculo 2 (MAT1620)
    const calculo2 = await crearCarpetaSiNoExiste('Cálculo 2 (MAT1620)', segundoSemestre);
    await crearCarpetaSiNoExiste('Materia-Apuntes-Ayudantías', calculo2);
    const calculo2Pruebas = await crearCarpetaSiNoExiste('Pruebas Anteriores', calculo2);
    await crearCarpetaSiNoExiste('I1', calculo2Pruebas);
    await crearCarpetaSiNoExiste('I2', calculo2Pruebas);
    await crearCarpetaSiNoExiste('I3', calculo2Pruebas);
    await crearCarpetaSiNoExiste('Examen', calculo2Pruebas);

    // Dinámica (FIS1514)
    const dinamica = await crearCarpetaSiNoExiste('Dinámica (FIS1514)', segundoSemestre);
    await crearCarpetaSiNoExiste('Libro problemas resueltos', dinamica);
    await crearCarpetaSiNoExiste('Apuntes', dinamica);
    await crearCarpetaSiNoExiste('Ayudantías', dinamica);
    await crearCarpetaSiNoExiste('Interrogaciones Anteriores (FIS)', dinamica);
    await crearCarpetaSiNoExiste('Zegard (ICE)', dinamica);
    await crearCarpetaSiNoExiste('Controles', dinamica);

    // Intro a la Economía (ICS1513)
    const economia = await crearCarpetaSiNoExiste('Intro a la Economía (ICS1513)', segundoSemestre);
    await crearCarpetaSiNoExiste('Juan Sepúlveda', economia);
    await crearCarpetaSiNoExiste('Emil Namur', economia);
    await crearCarpetaSiNoExiste('Manuel Pérez', economia);
    await crearCarpetaSiNoExiste('Miguel Pérez de Arce', economia);
    await crearCarpetaSiNoExiste('Romy Álamo-Cristóbal Bisso 2025-1', economia);

    // Intro a la Progra (IIC1103)
    const progra = await crearCarpetaSiNoExiste('Intro a la Progra (IIC1103)', segundoSemestre);
    const prograClases = await crearCarpetaSiNoExiste('Clases Francisca Cattan', progra);
    for (let i = 1; i <= 14; i++) {
      await crearCarpetaSiNoExiste(`Semana ${i}`, prograClases);
    }
    await crearCarpetaSiNoExiste('Repasos', prograClases);
    const jorgeMunoz = await crearCarpetaSiNoExiste('Jorge Muñoz 2024-2', progra);
    await crearCarpetaSiNoExiste('Clases', jorgeMunoz);
    await crearCarpetaSiNoExiste('Descontinuado', progra);

    // 3° Semestre
    const tercerSemestre = await crearCarpetaSiNoExiste('3° Semestre');

    // Cálculo 3 (MAT1630)
    const calculo3 = await crearCarpetaSiNoExiste('Cálculo 3 (MAT1630)', tercerSemestre);
    await crearCarpetaSiNoExiste('Libro Guía', calculo3);
    await crearCarpetaSiNoExiste('Compilado Ejercicios', calculo3);
    await crearCarpetaSiNoExiste('Controles', calculo3);
    await crearCarpetaSiNoExiste('Pruebas Anteriores', calculo3);
    await crearCarpetaSiNoExiste('Cátedras', calculo3);
    await crearCarpetaSiNoExiste('Ayudantías', calculo3);

    // EDO (MAT1640)
    const edo = await crearCarpetaSiNoExiste('EDO (MAT1640)', tercerSemestre);
    await crearCarpetaSiNoExiste('Libro Guía', edo);
    await crearCarpetaSiNoExiste('Compilado Ejercicios', edo);
    await crearCarpetaSiNoExiste('Pruebas Anteriores', edo);
    await crearCarpetaSiNoExiste('Cátedras', edo);

    // Termodinámica
    const termo = await crearCarpetaSiNoExiste('Termodinámica (FIS1523 y IIQ1003)', tercerSemestre);
    await crearCarpetaSiNoExiste('Termo FIS (FIS1523)', termo);
    await crearCarpetaSiNoExiste('Termo QIM (IIQ1003)', termo);

    // 4° Semestre
    const cuartoSemestre = await crearCarpetaSiNoExiste('4° Semestre');

    // Proba (EYP1113)
    const proba = await crearCarpetaSiNoExiste('Proba (EYP1113)', cuartoSemestre);
    await crearCarpetaSiNoExiste('Libro guía', proba);
    await crearCarpetaSiNoExiste('Pruebas anteriores', proba);

    // Electricidad y Magnetismo (FIS1533)
    const electro = await crearCarpetaSiNoExiste('Electricidad y Magnetismo (FIS1533)', cuartoSemestre);
    await crearCarpetaSiNoExiste('Libro Guía', electro);
    await crearCarpetaSiNoExiste('Pruebas Anteriores', electro);
    await crearCarpetaSiNoExiste('Compilado Ejercicios', electro);
    await crearCarpetaSiNoExiste('Apuntes Cádiz', electro);
    await crearCarpetaSiNoExiste('Ayudantías', electro);

    // Majors
    const majors = await crearCarpetaSiNoExiste('Majors');
    await crearCarpetaSiNoExiste('Transporte y Logística (ICT)', majors);
    await crearCarpetaSiNoExiste('Hidráulica y Ambiental (ICH)', majors);
    await crearCarpetaSiNoExiste('Propiedad y Resistencia de Materiales', majors);
    await crearCarpetaSiNoExiste('Industrial (ICS)', majors);
    const mecanicaFluidos = await crearCarpetaSiNoExiste('Mecánica de Fluidos (ICH1104)', majors);
    await crearCarpetaSiNoExiste('I1', mecanicaFluidos);
    await crearCarpetaSiNoExiste('I2', mecanicaFluidos);
    await crearCarpetaSiNoExiste('I3', mecanicaFluidos);
    await crearCarpetaSiNoExiste('Examen', mecanicaFluidos);
    await crearCarpetaSiNoExiste('Tareas 1-3', mecanicaFluidos);
    await crearCarpetaSiNoExiste('Estructural y Geotecnia', majors);
    await crearCarpetaSiNoExiste('Diseño Gráfico (ICM2313)', majors);
    await crearCarpetaSiNoExiste('Departamento de Ciencias de la Computación', majors);
    await crearCarpetaSiNoExiste('Ing y Gestión de la Construcción', majors);
    await crearCarpetaSiNoExiste('Química y Biológica', majors);

    // Red apoyo Fundamenta
    const redApoyo = await crearCarpetaSiNoExiste('Red apoyo Fundamenta');
    const ejerciciosExamenes = await crearCarpetaSiNoExiste('Ejercicios y Exámenes pasados', redApoyo);
    await crearCarpetaSiNoExiste('Examenes Pasados', ejerciciosExamenes);
    await crearCarpetaSiNoExiste('Ejercicios', ejerciciosExamenes);
    await crearCarpetaSiNoExiste('Resúmenes', redApoyo);
    await crearCarpetaSiNoExiste('Videos + Repasos', redApoyo);

    // Examen de Comunicación Escrita VRA 100C
    await crearCarpetaSiNoExiste('Examen de Comunicación Escrita VRA 100C');

    // Exploratorios
    const exploratorios = await crearCarpetaSiNoExiste('Exploratorios');
    await crearCarpetaSiNoExiste('Diseño Gráfico en Ingeniería Mecánica', exploratorios);

    console.log('\n✅ Estructura de carpetas creada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('- 1° Semestre: 4 ramos principales');
    console.log('- 2° Semestre: 4 ramos principales');
    console.log('- 3° Semestre: 3 ramos principales');
    console.log('- 4° Semestre: 2 ramos principales');
    console.log('- Majors: 10 especialidades');
    console.log('- Red de apoyo y materiales adicionales');

  } catch (error) {
    console.error('\n❌ Error al crear la estructura:', error);
    throw error;
  }
}

// Ejecutar el script
console.log('='.repeat(60));
console.log('Script de creación de estructura de carpetas');
console.log('OneDrive de Apuntes de Solidaridad Ing');
console.log('='.repeat(60));
console.log();

crearEstructuraCompleta()
  .then(() => {
    console.log('\n🎉 Proceso completado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
