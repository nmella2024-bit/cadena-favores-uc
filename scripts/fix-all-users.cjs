/**
 * Script para crear documentos de Firestore para todos los usuarios que existen en Auth
 * pero no tienen documento en Firestore
 *
 * USO:
 * node scripts/fix-all-users.cjs
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Obtiene todos los usuarios de Firebase Auth
 */
async function getAllAuthUsers() {
  const users = [];
  let nextPageToken;

  do {
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    listUsersResult.users.forEach((userRecord) => {
      users.push(userRecord);
    });
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  return users;
}

/**
 * Verifica y crea documentos faltantes
 */
async function fixAllUsers() {
  try {
    console.log('\n🔍 Obteniendo todos los usuarios de Firebase Auth...\n');
    const authUsers = await getAllAuthUsers();
    console.log(`✅ Encontrados ${authUsers.length} usuarios en Firebase Auth\n`);

    console.log('🔍 Verificando documentos en Firestore...\n');

    let usuariosCorrectos = 0;
    let usuariosFaltantes = 0;
    let usuariosCreados = 0;
    let errores = 0;

    for (const userRecord of authUsers) {
      try {
        const uid = userRecord.uid;
        const usuarioRef = db.collection('usuarios').doc(uid);
        const usuarioDoc = await usuarioRef.get();

        if (usuarioDoc.exists) {
          // Verificar que tenga el campo rol
          const userData = usuarioDoc.data();
          if (!userData.rol) {
            console.log(`⚠️  Usuario ${userRecord.email} no tiene rol, asignando 'normal'`);
            await usuarioRef.update({
              rol: 'normal',
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
          usuariosCorrectos++;
        } else {
          // Usuario no tiene documento en Firestore, crear uno
          console.log(`❌ Falta documento para: ${userRecord.email} (${uid})`);
          usuariosFaltantes++;

          const userData = {
            nombre: userRecord.displayName || 'Usuario',
            email: userRecord.email,
            carrera: '',
            año: 1,
            telefono: '',
            intereses: [],
            descripcion: '',
            rol: 'normal',
            reputacion: 5.0,
            totalCalificaciones: 0,
            favoresPublicados: [],
            favoresCompletados: [],
            fechaRegistro: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          await usuarioRef.set(userData);
          console.log(`   ✅ Documento creado para ${userRecord.email}\n`);
          usuariosCreados++;
        }
      } catch (error) {
        console.error(`❌ Error procesando usuario ${userRecord.email}:`, error.message);
        errores++;
      }
    }

    console.log('\n' + '─'.repeat(60));
    console.log('📊 RESUMEN:');
    console.log('─'.repeat(60));
    console.log(`   ✅ Usuarios correctos: ${usuariosCorrectos}`);
    console.log(`   ❌ Usuarios sin documento: ${usuariosFaltantes}`);
    console.log(`   🔧 Documentos creados: ${usuariosCreados}`);
    console.log(`   ⚠️  Errores: ${errores}`);
    console.log('─'.repeat(60));

    if (usuariosCreados > 0) {
      console.log('\n🎉 Se crearon documentos para todos los usuarios faltantes');
      console.log('\n⚠️  IMPORTANTE:');
      console.log('   - Todos los usuarios deben cerrar sesión y volver a iniciar sesión');
      console.log('   - Los documentos se crearon con rol "normal" por defecto');
      console.log('\n💡 Para cambiar roles específicos:');
      console.log('   node scripts/cambiar-rol.cjs usuario@uc.cl admin');
    } else if (usuariosFaltantes === 0) {
      console.log('\n✅ Todos los usuarios tienen sus documentos correctamente configurados');
    }

  } catch (error) {
    console.error('\n❌ Error al procesar usuarios:', error);
    throw error;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('\n🔧 REPARACIÓN AUTOMÁTICA DE USUARIOS');
  console.log('════════════════════════════════════\n');
  console.log('Este script verificará todos los usuarios de Firebase Auth');
  console.log('y creará documentos en Firestore para los que no lo tengan.\n');

  try {
    await fixAllUsers();
    console.log('\n✅ Proceso completado exitosamente\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ El proceso falló\n');
    process.exit(1);
  }
}

// Ejecutar script
main();
