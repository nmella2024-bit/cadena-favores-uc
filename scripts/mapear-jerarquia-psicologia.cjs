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

// Función para construir el árbol de carpetas desde una carpeta hacia arriba
function buildPathToRoot(carpetaId, carpetasMap) {
  const path = [];
  let currentId = carpetaId;

  while (currentId) {
    const carpeta = carpetasMap.get(currentId);
    if (!carpeta) break;

    path.unshift({
      id: carpeta.id,
      nombre: carpeta.nombre,
      carpetaPadreId: carpeta.carpetaPadreId
    });

    currentId = carpeta.carpetaPadreId;
  }

  return path;
}

async function mapearJerarquiaPsicologia() {
  console.log('\n=== MAPEANDO JERARQUÍA DE CARPETAS DE PSICOLOGÍA ===\n');

  try {
    // 1. Cargar todas las carpetas
    console.log('1. Cargando todas las carpetas...\n');
    const carpetasSnapshot = await db.collection('folders').get();

    const carpetasMap = new Map();
    carpetasSnapshot.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      carpetasMap.set(doc.id, data);
    });

    console.log(`   Total de carpetas: ${carpetasMap.size}\n`);

    // 2. Cargar materiales de Psicología
    console.log('2. Cargando materiales de Psicología...\n');
    const materialesSnapshot = await db.collection('material')
      .where('carrera', '==', 'Psicología')
      .get();

    console.log(`   Total de materiales: ${materialesSnapshot.size}\n`);

    // 3. Mapear rutas de carpetas usadas
    console.log('3. Mapeando rutas de carpetas usadas por materiales de Psicología:\n');

    const carpetasUsadas = new Set();
    materialesSnapshot.forEach(doc => {
      const carpetaId = doc.data().carpetaId;
      if (carpetaId) {
        carpetasUsadas.add(carpetaId);
      }
    });

    console.log(`   Carpetas únicas usadas: ${carpetasUsadas.size}\n`);

    // 4. Construir rutas completas
    const rutasCompletas = new Map();

    for (const carpetaId of carpetasUsadas) {
      const ruta = buildPathToRoot(carpetaId, carpetasMap);
      rutasCompletas.set(carpetaId, ruta);

      console.log(`   Ruta para carpeta "${carpetasMap.get(carpetaId)?.nombre}":`);
      console.log(`     Raíz -> ${ruta.map(c => c.nombre).join(' > ')}`);
      console.log(`     IDs: ${ruta.map(c => c.id).join(' > ')}`);

      // Verificar si llega a raíz
      if (ruta.length > 0 && ruta[0].carpetaPadreId) {
        console.log(`     ⚠ NO LLEGA A RAÍZ - Carpeta padre faltante: ${ruta[0].carpetaPadreId}`);
      }
      console.log('');
    }

    // 5. Identificar problemas
    console.log('4. ANÁLISIS DE PROBLEMAS:\n');

    const problemasEncontrados = [];

    for (const [carpetaId, ruta] of rutasCompletas) {
      if (ruta.length > 0 && ruta[0].carpetaPadreId) {
        problemasEncontrados.push({
          carpetaId,
          carpetaNombre: carpetasMap.get(carpetaId)?.nombre,
          ruta,
          carpetaPadreFaltante: ruta[0].carpetaPadreId
        });
      }
    }

    if (problemasEncontrados.length > 0) {
      console.log(`   ✗ Se encontraron ${problemasEncontrados.length} rutas incompletas:\n`);

      const carpetasPadresFaltantes = new Set();
      problemasEncontrados.forEach(p => {
        carpetasPadresFaltantes.add(p.carpetaPadreFaltante);
      });

      console.log(`   Carpetas padre faltantes (IDs):`);
      carpetasPadresFaltantes.forEach(id => {
        console.log(`     - ${id}`);

        // Intentar encontrar información sobre esta carpeta
        const carpetaInfo = carpetasMap.get(id);
        if (carpetaInfo) {
          console.log(`       Nombre: ${carpetaInfo.nombre}`);
          console.log(`       carpetaPadreId: ${carpetaInfo.carpetaPadreId || 'null'}`);
        } else {
          console.log(`       ✗ Esta carpeta NO existe en Firestore`);
        }
      });

      console.log('\n   SOLUCIÓN NECESARIA:');
      console.log('   Se deben crear o reconectar las carpetas padre faltantes');
      console.log('   para completar la jerarquía hasta la raíz.');
    } else {
      console.log('   ✓ Todas las rutas llegan correctamente a la raíz\n');
    }

    // 6. Mostrar estructura deseada
    console.log('\n5. ESTRUCTURA RECOMENDADA PARA PSICOLOGÍA:\n');
    console.log('   Material (raíz virtual)');
    console.log('   └── 2° Semestre');
    console.log('       └── Psicología');
    console.log('           └── Teorías Sociales');
    console.log('               ├── Textos');
    console.log('               ├── Unidad 1');
    console.log('               ├── Unidad 2');
    console.log('               ├── Unidad 3');
    console.log('               ├── Unidad 4');
    console.log('               └── Unidad 5');
    console.log('');

  } catch (error) {
    console.error('Error durante el mapeo:', error);
    throw error;
  }
}

// Ejecutar mapeo
mapearJerarquiaPsicologia()
  .then(() => {
    console.log('=== FIN DEL MAPEO ===\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
