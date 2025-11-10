/**
 * Script para verificar si un usuario existe en Firestore y mostrar sus datos
 *
 * USO:
 * node scripts/verificar-usuario.js <email-del-usuario>
 *
 * Ejemplo:
 * node scripts/verificar-usuario.js usuario@uc.cl
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Verifica si un usuario existe en Firestore y muestra sus datos
 * @param {string} email - Email del usuario
 */
async function verificarUsuario(email) {
  try {
    console.log(`\n🔍 Buscando usuario con email: ${email}...\n`);

    // Buscar usuario en Firestore por email
    const usuariosRef = db.collection('usuarios');
    const querySnapshot = await usuariosRef.where('email', '==', email).get();

    if (querySnapshot.empty) {
      console.error(`❌ ERROR: No se encontró ningún usuario con el email: ${email}`);
      console.log('\n📝 Causas posibles:');
      console.log('   1. El usuario nunca completó el proceso de registro');
      console.log('   2. El email está mal escrito');
      console.log('   3. El usuario existe en Firebase Auth pero no en Firestore');
      console.log('\n💡 Soluciones:');
      console.log('   1. Verifica que el usuario se haya registrado completamente en la app');
      console.log('   2. Verifica el email en Firebase Console > Authentication');
      console.log('   3. Si el usuario existe en Auth pero no en Firestore, deberá registrarse nuevamente');

      // Intentar buscar en Firebase Auth
      console.log('\n🔎 Buscando en Firebase Authentication...\n');
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        console.log('✅ Usuario encontrado en Firebase Auth:');
        console.log(`   - UID: ${userRecord.uid}`);
        console.log(`   - Email: ${userRecord.email}`);
        console.log(`   - Email verificado: ${userRecord.emailVerified}`);
        console.log(`   - Fecha de creación: ${userRecord.metadata.creationTime}`);
        console.log('\n⚠️  El usuario existe en Auth pero NO en Firestore');
        console.log('   Esto indica que el registro no se completó correctamente');
        console.log('\n💡 Para crear el documento en Firestore:');
        console.log(`   node scripts/crear-documento-usuario.js ${email}`);
      } catch (authError) {
        console.log('❌ Usuario tampoco existe en Firebase Auth');
      }

      process.exit(1);
    }

    // Usuario encontrado
    const usuarioDoc = querySnapshot.docs[0];
    const usuarioId = usuarioDoc.id;
    const usuarioData = usuarioDoc.data();

    console.log('✅ USUARIO ENCONTRADO EN FIRESTORE\n');
    console.log('─'.repeat(60));
    console.log('📋 Información del usuario:');
    console.log('─'.repeat(60));
    console.log(`   ID (UID): ${usuarioId}`);
    console.log(`   Nombre: ${usuarioData.nombre || 'No especificado'}`);
    console.log(`   Email: ${usuarioData.email}`);
    console.log(`   Carrera: ${usuarioData.carrera || 'No especificada'}`);
    console.log(`   Año: ${usuarioData.año || 'No especificado'}`);
    console.log(`   Rol: ${usuarioData.rol || '❌ NO TIENE ROL (se asignará "normal")'}`);
    console.log(`   Reputación: ${usuarioData.reputacion || 5.0}`);
    console.log(`   Fecha registro: ${usuarioData.fechaRegistro ? usuarioData.fechaRegistro.toDate() : 'No disponible'}`);
    console.log('─'.repeat(60));

    // Verificar el campo rol
    if (!usuarioData.rol) {
      console.log('\n⚠️  ADVERTENCIA: Este usuario NO tiene el campo "rol"');
      console.log('   Se asignará "normal" por defecto al iniciar sesión');
      console.log('\n💡 Para asignar un rol específico:');
      console.log(`   node scripts/cambiar-rol.js ${email} admin`);
      console.log(`   node scripts/cambiar-rol.js ${email} exclusivo`);
      console.log(`   node scripts/cambiar-rol.js ${email} normal`);
    } else {
      console.log(`\n✅ El usuario tiene rol: "${usuarioData.rol}"`);

      if (usuarioData.rol === 'admin') {
        console.log('\n👑 PERMISOS DE ADMINISTRADOR:');
        console.log('   ✓ Eliminar cualquier contenido');
        console.log('   ✓ Fijar favores y anuncios');
        console.log('   ✓ Gestionar reportes');
        console.log('   ✓ Ver logs administrativos');
      } else if (usuarioData.rol === 'exclusivo') {
        console.log('\n⭐ PERMISOS DE EXCLUSIVO:');
        console.log('   ✓ Fijar anuncios');
        console.log('   ✓ Contenido destacado');
        console.log('   ✓ Funciones premium');
      } else {
        console.log('\n👤 PERMISOS DE USUARIO NORMAL:');
        console.log('   ✓ Publicar favores y anuncios');
        console.log('   ✓ Marketplace');
        console.log('   ✓ Interacciones básicas');
      }
    }

    // Verificar en Firebase Auth también
    console.log('\n🔎 Verificando en Firebase Authentication...\n');
    try {
      const userRecord = await admin.auth().getUser(usuarioId);
      console.log('✅ Usuario también existe en Firebase Auth:');
      console.log(`   - Email verificado: ${userRecord.emailVerified ? '✓ Sí' : '✗ No'}`);
      console.log(`   - Último inicio de sesión: ${userRecord.metadata.lastSignInTime || 'Nunca'}`);
    } catch (authError) {
      console.log('⚠️  Usuario NO encontrado en Firebase Auth (inconsistencia)');
    }

    console.log('\n✅ Verificación completa\n');

  } catch (error) {
    console.error('\n❌ Error al verificar usuario:', error);
    throw error;
  }
}

/**
 * Función principal
 */
async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('\n❌ Error: Debes proporcionar un email');
    console.log('\n📖 Uso:');
    console.log('   node scripts/verificar-usuario.js <email-del-usuario>');
    console.log('\n📝 Ejemplo:');
    console.log('   node scripts/verificar-usuario.js usuario@uc.cl\n');
    process.exit(1);
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error(`\n❌ Error: "${email}" no es un email válido\n`);
    process.exit(1);
  }

  try {
    await verificarUsuario(email);
    console.log('✅ Proceso completado\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ El proceso falló\n');
    process.exit(1);
  }
}

// Ejecutar script
main();
