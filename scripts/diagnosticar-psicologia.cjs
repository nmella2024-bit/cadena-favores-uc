const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'coherent-flame-475215-f0.appspot.com'
  });
}

const db = admin.firestore();

async function diagnosticarPsicologia() {
  console.log('\n=== DIAGNÓSTICO DE ESTRUCTURA DE PSICOLOGÍA ===\n');

  try {
    // 1. Verificar carpetas de Psicología
    console.log('1. Buscando carpetas relacionadas con Psicología...\n');
    const carpetasSnapshot = await db.collection('folders').get();

    const carpetasPsicologia = [];
    const todasLasCarpetas = [];

    carpetasSnapshot.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      todasLasCarpetas.push(data);

      const nombre = data.nombre?.toLowerCase() || '';
      if (nombre.includes('psicolog') || nombre.includes('psicol')) {
        carpetasPsicologia.push(data);
      }
    });

    console.log(`   Total de carpetas en el sistema: ${todasLasCarpetas.length}`);
    console.log(`   Carpetas de Psicología encontradas: ${carpetasPsicologia.length}\n`);

    if (carpetasPsicologia.length > 0) {
      console.log('   Carpetas de Psicología:');
      carpetasPsicologia.forEach(carpeta => {
        console.log(`     - ${carpeta.nombre} (ID: ${carpeta.id})`);
        console.log(`       carpetaPadreId: ${carpeta.carpetaPadreId || 'null (raíz)'}`);
      });
      console.log('');
    }

    // 2. Verificar materiales de Psicología
    console.log('2. Buscando materiales de Psicología...\n');
    const materialesSnapshot = await db.collection('material')
      .where('carrera', '==', 'Psicología')
      .get();

    console.log(`   Materiales de Psicología encontrados: ${materialesSnapshot.size}\n`);

    if (materialesSnapshot.size > 0) {
      const carpetaIdCounts = {};
      const materialesPorCarpeta = {};

      materialesSnapshot.forEach(doc => {
        const data = doc.data();
        const carpetaId = data.carpetaId || 'null';

        carpetaIdCounts[carpetaId] = (carpetaIdCounts[carpetaId] || 0) + 1;

        if (!materialesPorCarpeta[carpetaId]) {
          materialesPorCarpeta[carpetaId] = [];
        }
        materialesPorCarpeta[carpetaId].push({
          id: doc.id,
          titulo: data.titulo,
          ramo: data.ramo,
          anio: data.anio
        });
      });

      console.log('   Distribución de materiales por carpetaId:');
      for (const [carpetaId, count] of Object.entries(carpetaIdCounts)) {
        console.log(`\n     carpetaId: ${carpetaId}`);
        console.log(`     Cantidad: ${count}`);

        // Verificar si la carpeta existe
        if (carpetaId !== 'null') {
          const carpetaExiste = todasLasCarpetas.find(c => c.id === carpetaId);
          if (carpetaExiste) {
            console.log(`     ✓ Carpeta existe: "${carpetaExiste.nombre}"`);
          } else {
            console.log(`     ✗ PROBLEMA: Carpeta NO existe (ID huérfano)`);
          }
        } else {
          console.log(`     ⚠ Materiales en raíz (sin carpeta asignada)`);
        }

        // Mostrar algunos materiales de ejemplo
        const ejemplos = materialesPorCarpeta[carpetaId].slice(0, 3);
        console.log(`     Ejemplos:`);
        ejemplos.forEach(m => {
          console.log(`       - ${m.titulo} (${m.ramo}, ${m.anio}°)`);
        });
      }
      console.log('');
    }

    // 3. Verificar estructura de carpetas raíz
    console.log('3. Verificando estructura de carpetas raíz (carpetaPadreId = null)...\n');
    const carpetasRaiz = todasLasCarpetas.filter(c => !c.carpetaPadreId);

    console.log(`   Carpetas en raíz: ${carpetasRaiz.length}`);
    carpetasRaiz.forEach(carpeta => {
      console.log(`     - ${carpeta.nombre} (ID: ${carpeta.id})`);
    });
    console.log('');

    // 4. Recomendaciones
    console.log('4. ANÁLISIS Y RECOMENDACIONES:\n');

    const problemasEncontrados = [];

    // Verificar si hay materiales huérfanos
    materialesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.carpetaId && data.carpetaId !== 'null') {
        const carpetaExiste = todasLasCarpetas.find(c => c.id === data.carpetaId);
        if (!carpetaExiste) {
          problemasEncontrados.push({
            tipo: 'CARPETA_HUERFANA',
            materialId: doc.id,
            materialTitulo: data.titulo,
            carpetaId: data.carpetaId
          });
        }
      }
    });

    if (problemasEncontrados.length > 0) {
      console.log(`   ✗ Se encontraron ${problemasEncontrados.length} materiales con carpetaId inválido:`);
      problemasEncontrados.slice(0, 5).forEach(p => {
        console.log(`     - Material: "${p.materialTitulo}"`);
        console.log(`       carpetaId inválido: ${p.carpetaId}`);
      });
      if (problemasEncontrados.length > 5) {
        console.log(`     ... y ${problemasEncontrados.length - 5} más\n`);
      }
      console.log('');
      console.log('   SOLUCIÓN: Ejecutar script de corrección que:');
      console.log('   1. Cree la estructura de carpetas para Psicología');
      console.log('   2. Asigne correctamente los materiales a sus carpetas');
      console.log('');
    } else {
      const materialesEnRaiz = materialesSnapshot.docs.filter(doc => !doc.data().carpetaId);
      if (materialesEnRaiz.length > 0) {
        console.log(`   ⚠ Hay ${materialesEnRaiz.length} materiales de Psicología en raíz`);
        console.log('   SOLUCIÓN: Crear estructura de carpetas y organizar materiales');
        console.log('');
      } else {
        console.log('   ✓ No se encontraron problemas evidentes');
        console.log('');
      }
    }

  } catch (error) {
    console.error('Error durante el diagnóstico:', error);
    throw error;
  }
}

// Ejecutar diagnóstico
diagnosticarPsicologia()
  .then(() => {
    console.log('=== FIN DEL DIAGNÓSTICO ===\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
