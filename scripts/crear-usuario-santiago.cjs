/**
 * Script para crear cuenta verificada para Santiago Diez
 * Usuario normal sin email UC
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require(path.resolve(__dirname, '..', 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function crearUsuarioSantiago() {
  try {
    console.log('\n🔧 Creando cuenta para Santiago Diez...\n');

    const accountData = {
      email: 'santiago.diez@ejemplo.com', // Email genérico ya que no tiene UC
      password: 'Santiago123456',
      displayName: 'Santiago Diez',
      rol: 'normal',
      carrera: '',
      año: 1,
      telefono: '',
      descripcion: 'Usuario sin email UC',
      intereses: []
    };

    // 1. Verificar si el usuario ya existe en Auth
    let user;
    try {
      user = await auth.getUserByEmail(accountData.email);
      console.log(`  ℹ️  Usuario ya existe en Auth (UID: ${user.uid})`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // 2. Crear usuario en Firebase Auth con email verificado
        user = await auth.createUser({
          email: accountData.email,
          password: accountData.password,
          displayName: accountData.displayName,
          emailVerified: true // Marcar como verificado automáticamente
        });
        console.log(`  ✅ Usuario creado en Auth (UID: ${user.uid})`);
        console.log(`  ✅ Email marcado como verificado`);
      } else {
        throw error;
      }
    }

    // 3. Crear/actualizar documento en Firestore
    const userRef = db.collection('usuarios').doc(user.uid);
    const userDoc = await userRef.get();

    const userData = {
      nombre: accountData.displayName,
      email: accountData.email,
      carrera: accountData.carrera,
      año: accountData.año,
      telefono: accountData.telefono,
      intereses: accountData.intereses,
      descripcion: accountData.descripcion,
      rol: accountData.rol,
      reputacion: 5.0,
      totalCalificaciones: 0,
      favoresPublicados: [],
      favoresCompletados: [],
      fechaRegistro: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (userDoc.exists) {
      await userRef.update(userData);
      console.log(`  ✅ Documento actualizado en Firestore`);
    } else {
      await userRef.set(userData);
      console.log(`  ✅ Documento creado en Firestore`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ CUENTA CREADA EXITOSAMENTE\n');
    console.log('📋 Información de la cuenta:');
    console.log('─'.repeat(60));
    console.log(`  👤 Nombre: ${accountData.displayName}`);
    console.log(`  📧 Email: ${accountData.email}`);
    console.log(`  🔑 Password: ${accountData.password}`);
    console.log(`  🎭 Rol: ${accountData.rol}`);
    console.log(`  ✅ Email verificado: Sí`);
    console.log(`  🆔 UID: ${user.uid}`);
    console.log('─'.repeat(60));
    console.log('\n💡 El usuario puede iniciar sesión inmediatamente');
    console.log('   No necesita verificar el email\n');

    return {
      success: true,
      uid: user.uid,
      email: accountData.email,
      password: accountData.password
    };

  } catch (error) {
    console.error('\n❌ Error al crear la cuenta:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await crearUsuarioSantiago();
    console.log('✨ Proceso completado\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ El proceso falló\n');
    process.exit(1);
  }
}

// Ejecutar
main();
