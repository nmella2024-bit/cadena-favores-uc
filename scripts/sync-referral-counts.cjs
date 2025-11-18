const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function syncReferralCounts() {
  try {
    console.log('🔄 Iniciando sincronización de contadores de referidos...\n');

    // Obtener todos los referidos
    const referidosSnapshot = await db.collection('referidos').get();

    console.log(`📊 Total de referidos en la base de datos: ${referidosSnapshot.size}\n`);

    // Agrupar referidos por usuario que refirió
    const referralsByUser = {};

    referidosSnapshot.forEach(doc => {
      const data = doc.data();
      const referidoPor = data.referidoPor;

      if (!referralsByUser[referidoPor]) {
        referralsByUser[referidoPor] = [];
      }

      referralsByUser[referidoPor].push({
        id: doc.id,
        ...data
      });
    });

    console.log(`👥 Usuarios con referidos: ${Object.keys(referralsByUser).length}\n`);

    // Actualizar cada usuario con su contador correcto
    let updatedCount = 0;
    const batch = db.batch();

    for (const [userId, referrals] of Object.entries(referralsByUser)) {
      const userRef = db.collection('usuarios').doc(userId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const currentCount = userData.totalReferidos || 0;
        const correctCount = referrals.length;

        if (currentCount !== correctCount) {
          batch.update(userRef, {
            totalReferidos: correctCount
          });

          console.log(`✅ ${userData.nombre} (${userData.email})`);
          console.log(`   Anterior: ${currentCount} → Nuevo: ${correctCount}`);
          console.log(`   Código: ${userData.codigoReferido}`);
          console.log(`   Referidos: ${referrals.map(r => r.emailReferido).join(', ')}`);
          console.log('');

          updatedCount++;
        } else {
          console.log(`✔️  ${userData.nombre} ya tenía el contador correcto (${correctCount})`);
        }
      } else {
        console.log(`⚠️  Usuario ${userId} no encontrado en la colección usuarios`);
      }
    }

    // Ejecutar el batch
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`\n🎉 Sincronización completada. ${updatedCount} usuarios actualizados.`);
    } else {
      console.log('\n✅ Todos los contadores ya estaban correctos. No se requirieron actualizaciones.');
    }

    // Resetear usuarios sin referidos a 0 si tienen un valor diferente
    console.log('\n🔍 Verificando usuarios sin referidos...');
    const allUsersSnapshot = await db.collection('usuarios')
      .where('codigoReferido', '!=', null)
      .get();

    let resetCount = 0;
    const resetBatch = db.batch();

    allUsersSnapshot.forEach(doc => {
      const userId = doc.id;
      const userData = doc.data();

      // Si el usuario no está en referralsByUser pero tiene totalReferidos > 0
      if (!referralsByUser[userId] && (userData.totalReferidos || 0) > 0) {
        resetBatch.update(doc.ref, { totalReferidos: 0 });
        console.log(`🔄 Reseteando contador de ${userData.nombre} (${userData.totalReferidos} → 0)`);
        resetCount++;
      }
    });

    if (resetCount > 0) {
      await resetBatch.commit();
      console.log(`\n✅ ${resetCount} usuarios sin referidos fueron reseteados a 0.`);
    } else {
      console.log('✅ No se encontraron usuarios que requieran reseteo.');
    }

    console.log('\n✅ Proceso completado exitosamente.');

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    throw error;
  } finally {
    process.exit();
  }
}

// Ejecutar la sincronización
syncReferralCounts();
