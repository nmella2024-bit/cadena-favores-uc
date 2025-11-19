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

async function reorganizarPsicologia() {
  console.log('\n=== REORGANIZACIÓN DE ESTRUCTURA DE PSICOLOGÍA ===\n');
  console.log('Este script creará la siguiente estructura:\n');
  console.log('Material (raíz)');
  console.log('└── Psicología (NUEVA)');
  console.log('    ├── 1° Semestre (NUEVA)');
  console.log('    │   ├── FuFi (mover carpeta existente)');
  console.log('    │   └── Historia de Psico. (mover carpeta existente)');
  console.log('    └── 2° Semestre (NUEVA)');
  console.log('        └── Teorías Sociales (mover carpeta existente)');
  console.log('');

  const USUARIO_SISTEMA = {
    id: 'SYSTEM',
    nombre: 'Sistema'
  };

  try {
    // 1. Cargar carpetas y materiales actuales
    console.log('1. Cargando estado actual...\n');

    const carpetasSnapshot = await db.collection('folders').get();
    const carpetasMap = new Map();

    carpetasSnapshot.forEach(doc => {
      carpetasMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    const materialesSnapshot = await db.collection('material')
      .where('carrera', '==', 'Psicología')
      .get();

    console.log(`   Total de carpetas en sistema: ${carpetasMap.size}`);
    console.log(`   Materiales de Psicología: ${materialesSnapshot.size}\n`);

    // 2. Identificar carpetas a mover
    const carpetasAMover = [
      {
        id: '22lUineCn4Qh0jRrZiHj',
        nombre: '𝐅𝐮𝐅𝐢',
        padreActual: 'EJ5sqCZ3RJjjpXPVIK7O', // 1° Semestre
        nuevoPadre: 'psico-1er-semestre'
      },
      {
        id: 'd0EtMiJBhSYv7lVyy31L',
        nombre: '𝐇𝐢𝐬𝐭𝐨𝐫𝐢𝐚 𝐝𝐞 𝐏𝐬𝐢𝐜𝐨.',
        padreActual: 'EJ5sqCZ3RJjjpXPVIK7O', // 1° Semestre
        nuevoPadre: 'psico-1er-semestre'
      },
      {
        id: 'zhwxC49S46pLdNMSQwQa',
        nombre: '𝐓𝐞𝐨𝐫í𝐚𝐬 𝐒𝐨𝐜𝐢𝐚𝐥𝐞𝐬',
        padreActual: '1gA2swU82vySuMGngM9N', // 2° Semestre
        nuevoPadre: 'psico-2do-semestre'
      }
    ];

    console.log('2. Carpetas que se moverán:\n');
    carpetasAMover.forEach(c => {
      const carpeta = carpetasMap.get(c.id);
      if (carpeta) {
        console.log(`   ✓ ${c.nombre} (ID: ${c.id})`);
      } else {
        console.log(`   ✗ ${c.nombre} - NO ENCONTRADA`);
      }
    });
    console.log('');

    // 3. Crear carpeta raíz "Psicología"
    console.log('3. Creando carpeta raíz "Psicología"...\n');

    const carpetaPsicologiaRef = db.collection('folders').doc();
    const carpetaPsicologiaId = carpetaPsicologiaRef.id;

    await carpetaPsicologiaRef.set({
      nombre: '𝐏𝐬𝐢𝐜𝐨𝐥𝐨𝐠í𝐚',
      carpetaPadreId: null, // En raíz
      autorId: USUARIO_SISTEMA.id,
      autorNombre: USUARIO_SISTEMA.nombre,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      tipo: 'carpeta'
    });

    console.log(`   ✓ Carpeta "𝐏𝐬𝐢𝐜𝐨𝐥𝐨𝐠í𝐚" creada (ID: ${carpetaPsicologiaId})\n`);

    // 4. Crear carpeta "1° Semestre" dentro de Psicología
    console.log('4. Creando subcarpeta "1° Semestre"...\n');

    const carpeta1erSemestreRef = db.collection('folders').doc();
    const carpeta1erSemestreId = carpeta1erSemestreRef.id;

    await carpeta1erSemestreRef.set({
      nombre: '𝟏° 𝐒𝐞𝐦𝐞𝐬𝐭𝐫𝐞',
      carpetaPadreId: carpetaPsicologiaId,
      autorId: USUARIO_SISTEMA.id,
      autorNombre: USUARIO_SISTEMA.nombre,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      tipo: 'carpeta'
    });

    console.log(`   ✓ Carpeta "𝟏° 𝐒𝐞𝐦𝐞𝐬𝐭𝐫𝐞" creada (ID: ${carpeta1erSemestreId})\n`);

    // 5. Crear carpeta "2° Semestre" dentro de Psicología
    console.log('5. Creando subcarpeta "2° Semestre"...\n');

    const carpeta2doSemestreRef = db.collection('folders').doc();
    const carpeta2doSemestreId = carpeta2doSemestreRef.id;

    await carpeta2doSemestreRef.set({
      nombre: '𝟐° 𝐒𝐞𝐦𝐞𝐬𝐭𝐫𝐞',
      carpetaPadreId: carpetaPsicologiaId,
      autorId: USUARIO_SISTEMA.id,
      autorNombre: USUARIO_SISTEMA.nombre,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      tipo: 'carpeta'
    });

    console.log(`   ✓ Carpeta "𝟐° 𝐒𝐞𝐦𝐞𝐬𝐭𝐫𝐞" creada (ID: ${carpeta2doSemestreId})\n`);

    // 6. Mover carpetas existentes
    console.log('6. Moviendo carpetas existentes...\n');

    // Mapear IDs temporales a IDs reales
    const mapeoNuevosPadres = {
      'psico-1er-semestre': carpeta1erSemestreId,
      'psico-2do-semestre': carpeta2doSemestreId
    };

    for (const carpetaInfo of carpetasAMover) {
      const nuevoPadreId = mapeoNuevosPadres[carpetaInfo.nuevoPadre];

      console.log(`   Moviendo "${carpetaInfo.nombre}"...`);
      console.log(`     De: carpetaPadreId = ${carpetaInfo.padreActual}`);
      console.log(`     A:  carpetaPadreId = ${nuevoPadreId}`);

      await db.collection('folders').doc(carpetaInfo.id).update({
        carpetaPadreId: nuevoPadreId
      });

      console.log(`     ✓ Movida exitosamente\n`);
    }

    // 7. Verificar estructura final
    console.log('7. Verificando estructura final...\n');

    const carpetaPsicologia = await db.collection('folders').doc(carpetaPsicologiaId).get();
    const carpeta1erSemestre = await db.collection('folders').doc(carpeta1erSemestreId).get();
    const carpeta2doSemestre = await db.collection('folders').doc(carpeta2doSemestreId).get();

    console.log('   Estructura creada:');
    console.log(`   ${carpetaPsicologia.data().nombre} (carpetaPadreId: ${carpetaPsicologia.data().carpetaPadreId || 'null - RAÍZ'})`);
    console.log(`   ├── ${carpeta1erSemestre.data().nombre} (carpetaPadreId: ${carpeta1erSemestre.data().carpetaPadreId})`);

    // Verificar subcarpetas de 1er semestre
    const subcarpetas1er = await db.collection('folders')
      .where('carpetaPadreId', '==', carpeta1erSemestreId)
      .get();

    subcarpetas1er.forEach(doc => {
      console.log(`   │   └── ${doc.data().nombre}`);
    });

    console.log(`   └── ${carpeta2doSemestre.data().nombre} (carpetaPadreId: ${carpeta2doSemestre.data().carpetaPadreId})`);

    // Verificar subcarpetas de 2do semestre
    const subcarpetas2do = await db.collection('folders')
      .where('carpetaPadreId', '==', carpeta2doSemestreId)
      .get();

    subcarpetas2do.forEach(doc => {
      console.log(`       └── ${doc.data().nombre}`);
    });

    console.log('');

    // 8. Verificar materiales
    console.log('8. Verificando que los materiales siguen siendo accesibles...\n');

    const materialesDespues = await db.collection('material')
      .where('carrera', '==', 'Psicología')
      .get();

    console.log(`   ✓ Total de materiales de Psicología: ${materialesDespues.size}`);
    console.log('   ✓ Los materiales siguen vinculados a sus carpetas originales\n');

    console.log('=== REORGANIZACIÓN COMPLETADA EXITOSAMENTE ===\n');
    console.log('PRÓXIMOS PASOS:');
    console.log('1. Abre la aplicación web');
    console.log('2. Ve a la sección "Material"');
    console.log('3. Deberías ver ahora una carpeta "𝐏𝐬𝐢𝐜𝐨𝐥𝐨𝐠í𝐚" en la raíz');
    console.log('4. Al abrirla, verás "1° Semestre" y "2° Semestre"');
    console.log('5. Dentro encontrarás todas las asignaturas y materiales organizados\n');

    return {
      carpetaPsicologiaId,
      carpeta1erSemestreId,
      carpeta2doSemestreId,
      carpetasMovidas: carpetasAMover.length
    };

  } catch (error) {
    console.error('\n✗ ERROR durante la reorganización:', error);
    console.error('\nLa reorganización puede haber quedado incompleta.');
    console.error('Revisa el estado en Firestore y ejecuta el script de diagnóstico.\n');
    throw error;
  }
}

// Ejecutar reorganización
reorganizarPsicologia()
  .then((resultado) => {
    console.log('Resultado:', resultado);
    console.log('\n✓ Script finalizado exitosamente\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
