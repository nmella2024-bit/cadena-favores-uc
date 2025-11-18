const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function testReferralSystem() {
  try {
    console.log('🧪 Iniciando pruebas del sistema de referidos...\n');

    // Test 1: Verificar que los contadores están sincronizados
    console.log('Test 1: Verificar contadores sincronizados');
    console.log('='.repeat(50));

    const referidosSnapshot = await db.collection('referidos').get();
    const referralsByUser = {};

    referidosSnapshot.forEach(doc => {
      const data = doc.data();
      const referidoPor = data.referidoPor;

      if (!referralsByUser[referidoPor]) {
        referralsByUser[referidoPor] = [];
      }

      referralsByUser[referidoPor].push({
        id: doc.id,
        emailReferido: data.emailReferido,
        fechaRegistro: data.fechaRegistro
      });
    });

    let allCorrect = true;

    for (const [userId, referrals] of Object.entries(referralsByUser)) {
      const userDoc = await db.collection('usuarios').doc(userId).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const expectedCount = referrals.length;
        const actualCount = userData.totalReferidos || 0;

        if (expectedCount === actualCount) {
          console.log(`✅ ${userData.nombre}: ${actualCount} referidos (CORRECTO)`);
        } else {
          console.log(`❌ ${userData.nombre}: esperado ${expectedCount}, actual ${actualCount} (ERROR)`);
          allCorrect = false;
        }
      }
    }

    if (allCorrect) {
      console.log('\n✅ Todos los contadores están correctos\n');
    } else {
      console.log('\n❌ Algunos contadores están desincronizados\n');
    }

    // Test 2: Verificar estructura de referidos
    console.log('Test 2: Verificar estructura de documentos de referidos');
    console.log('='.repeat(50));

    let allReferralsValid = true;
    for (const docSnapshot of referidosSnapshot.docs) {
      const data = docSnapshot.data();
      const requiredFields = ['referidoPor', 'referido', 'codigoReferido', 'fechaRegistro', 'estado', 'emailReferido'];

      const missingFields = requiredFields.filter(field => !(field in data));

      if (missingFields.length === 0) {
        console.log(`✅ Referido ${docSnapshot.id}: Estructura válida`);
      } else {
        console.log(`❌ Referido ${docSnapshot.id}: Faltan campos: ${missingFields.join(', ')}`);
        allReferralsValid = false;
      }
    }

    if (allReferralsValid) {
      console.log('\n✅ Todos los referidos tienen la estructura correcta\n');
    } else {
      console.log('\n❌ Algunos referidos tienen estructura inválida\n');
    }

    // Test 3: Verificar códigos de referido
    console.log('Test 3: Verificar códigos de referido');
    console.log('='.repeat(50));

    const usersWithCode = await db.collection('usuarios')
      .where('codigoReferido', '!=', null)
      .get();

    console.log(`📊 Total de usuarios con código de referido: ${usersWithCode.size}`);

    usersWithCode.forEach(doc => {
      const data = doc.data();
      console.log(`✅ ${data.nombre}: ${data.codigoReferido} (${data.totalReferidos || 0} referidos)`);
    });

    // Test 4: Verificar que no hay auto-referidos
    console.log('\nTest 4: Verificar que no hay auto-referidos');
    console.log('='.repeat(50));

    let autoReferralsFound = false;
    for (const docSnapshot of referidosSnapshot.docs) {
      const data = docSnapshot.data();

      if (data.referidoPor === data.referido) {
        console.log(`❌ Auto-referido encontrado: ${docSnapshot.id}`);
        autoReferralsFound = true;
      }
    }

    if (!autoReferralsFound) {
      console.log('✅ No se encontraron auto-referidos\n');
    }

    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN GENERAL');
    console.log('='.repeat(50));
    console.log(`Total de referidos registrados: ${referidosSnapshot.size}`);
    console.log(`Usuarios con código de referido: ${usersWithCode.size}`);
    console.log(`Usuarios con al menos 1 referido: ${Object.keys(referralsByUser).length}`);

    if (allCorrect && allReferralsValid && !autoReferralsFound) {
      console.log('\n✅ ¡Sistema de referidos funcionando correctamente!');
    } else {
      console.log('\n⚠️  Se encontraron algunos problemas en el sistema de referidos.');
    }

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    throw error;
  } finally {
    process.exit();
  }
}

// Ejecutar las pruebas
testReferralSystem();
