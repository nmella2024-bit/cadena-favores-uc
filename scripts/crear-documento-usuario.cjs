/**
 * Script para crear un documento de usuario en Firestore para un usuario que existe en Auth
 *
 * USO:
 * node scripts/crear-documento-usuario.js <email-del-usuario>
 *
 * Ejemplo:
 * node scripts/crear-documento-usuario.js usuario@uc.cl
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Crea un documento de usuario en Firestore basado en datos de Auth
 * @param {string} email - Email del usuario
 */
async function crearDocumentoUsuario(email) {
  try {
    console.log(`\n🔍 Buscando usuario en Firebase Auth: ${email}...\n`);

    // Buscar usuario en Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(email);

    console.log('✅ Usuario encontrado en Firebase Auth:');
    console.log(`   - UID: ${userRecord.uid}`);
    console.log(`   - Email: ${userRecord.email}`);
    console.log(`   - Nombre: ${userRecord.displayName || 'No especificado'}`);
    console.log(`   - Email verificado: ${userRecord.emailVerified}`);

    // Verificar si ya existe en Firestore
    console.log('\n🔍 Verificando si existe en Firestore...\n');
    const usuarioRef = db.collection('usuarios').doc(userRecord.uid);
    const usuarioDoc = await usuarioRef.get();

    if (usuarioDoc.exists()) {
      console.log('⚠️  El usuario ya tiene un documento en Firestore');
      const data = usuarioDoc.data();
      console.log('\n📋 Datos actuales:');
      console.log(`   - Nombre: ${data.nombre}`);
      console.log(`   - Email: ${data.email}`);
      console.log(`   - Rol: ${data.rol || 'No especificado'}`);
      console.log('\n💡 Para cambiar el rol:');
      console.log(`   node scripts/cambiar-rol.js ${email} admin`);
      process.exit(0);
    }

    // Crear documento en Firestore
    console.log('📝 Creando documento en Firestore...\n');

    const userData = {
      nombre: userRecord.displayName || 'Usuario',
      email: userRecord.email,
      carrera: '',
      año: 1,
      telefono: '',
      intereses: [],
      descripcion: '',
      rol: 'normal', // Rol por defecto
      reputacion: 5.0,
      totalCalificaciones: 0,
      favoresPublicados: [],
      favoresCompletados: [],
      fechaRegistro: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await usuarioRef.set(userData);

    console.log('🎉 ¡Documento de usuario creado exitosamente!');
    console.log('\n📋 Datos del usuario:');
    console.log(`   - ID: ${userRecord.uid}`);
    console.log(`   - Nombre: ${userData.nombre}`);
    console.log(`   - Email: ${userData.email}`);
    console.log(`   - Rol: ${userData.rol}`);
    console.log(`   - Reputación: ${userData.reputacion}`);

    console.log('\n💡 Para cambiar el rol del usuario:');
    console.log(`   node scripts/cambiar-rol.js ${email} admin`);
    console.log(`   node scripts/cambiar-rol.js ${email} exclusivo`);

    console.log('\n⚠️  IMPORTANTE:');
    console.log('   - El usuario debe cerrar sesión y volver a iniciar sesión');
    console.log('   - Los cambios se aplicarán inmediatamente después de iniciar sesión');

  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ ERROR: No existe un usuario con el email: ${email}`);
      console.log('\n💡 El usuario debe registrarse primero en la aplicación');
    } else {
      console.error('\n❌ Error al crear documento de usuario:', error);
    }
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
    console.log('   node scripts/crear-documento-usuario.js <email-del-usuario>');
    console.log('\n📝 Ejemplo:');
    console.log('   node scripts/crear-documento-usuario.js usuario@uc.cl\n');
    process.exit(1);
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error(`\n❌ Error: "${email}" no es un email válido\n`);
    process.exit(1);
  }

  try {
    await crearDocumentoUsuario(email);
    console.log('\n✅ Proceso completado exitosamente\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ El proceso falló\n');
    process.exit(1);
  }
}

// Ejecutar script
main();
