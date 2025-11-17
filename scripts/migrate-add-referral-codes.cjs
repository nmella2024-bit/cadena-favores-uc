/**
 * Script para migrar usuarios existentes y agregarles códigos de referido
 *
 * Este script:
 * 1. Lee todos los usuarios existentes en Firestore
 * 2. Genera códigos de referido para usuarios que no tengan
 * 3. Actualiza los documentos con los nuevos campos
 *
 * Uso: node scripts/migrate-add-referral-codes.cjs
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * Genera un código de referido basado en el userId
 * Usa los primeros 6 caracteres del UID en mayúsculas
 */
function generateReferralCode(userId) {
  return userId.substring(0, 6).toUpperCase();
}

async function migrateUsers() {
  try {
    console.log('🚀 Iniciando migración de códigos de referido...\n');

    // Obtener todos los usuarios
    const usersSnapshot = await db.collection('usuarios').get();
    const totalUsers = usersSnapshot.size;

    console.log(`📊 Total de usuarios encontrados: ${totalUsers}\n`);

    if (totalUsers === 0) {
      console.log('⚠️  No hay usuarios para migrar');
      return;
    }

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Procesar cada usuario
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      try {
        // Verificar si ya tiene código de referido
        if (userData.codigoReferido) {
          console.log(`⏭️  Usuario ${userData.nombre} (${userId}) ya tiene código: ${userData.codigoReferido}`);
          skipped++;
          continue;
        }

        // Generar código de referido
        const referralCode = generateReferralCode(userId);

        // Actualizar documento
        await db.collection('usuarios').doc(userId).update({
          codigoReferido: referralCode,
          totalReferidos: 0,
          fechaGeneracionCodigo: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ Usuario ${userData.nombre} (${userId}) actualizado con código: ${referralCode}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error al actualizar usuario ${userId}:`, error.message);
        errors++;
      }
    }

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📈 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`Total de usuarios:        ${totalUsers}`);
    console.log(`Actualizados:            ${updated}`);
    console.log(`Omitidos (ya tenían):    ${skipped}`);
    console.log(`Errores:                 ${errors}`);
    console.log('='.repeat(60) + '\n');

    if (updated > 0) {
      console.log('✨ Migración completada exitosamente!');
    } else {
      console.log('ℹ️  No se actualizaron usuarios (todos ya tenían códigos)');
    }
  } catch (error) {
    console.error('❌ Error fatal durante la migración:', error);
    process.exit(1);
  } finally {
    // Cerrar la app de admin
    await admin.app().delete();
    process.exit(0);
  }
}

// Ejecutar migración
migrateUsers();
