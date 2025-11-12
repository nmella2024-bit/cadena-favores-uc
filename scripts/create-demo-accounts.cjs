/**
 * Script para crear cuentas demo verificadas para testing
 * Crea dos cuentas:
 * 1. demo-exclusivo@reduc.test - Rol: exclusivo
 * 2. demo-normal@reduc.test - Rol: normal
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

const DEMO_ACCOUNTS = [
  {
    email: 'demo-exclusivo@reduc.test',
    password: 'Demo123456',
    displayName: 'Usuario Demo Exclusivo',
    rol: 'exclusivo',
    carrera: 'Ingeniería Comercial',
    año: 3,
    telefono: '+56912345678',
    descripcion: 'Cuenta demo con rol exclusivo para testing de funcionalidades premium',
    intereses: ['Emprendimiento', 'Negocios', 'Material de estudio']
  },
  {
    email: 'demo-normal@reduc.test',
    password: 'Demo123456',
    displayName: 'Usuario Demo Normal',
    rol: 'normal',
    carrera: 'Enfermería',
    año: 2,
    telefono: '+56987654321',
    descripcion: 'Cuenta demo con rol normal para testing de funcionalidades básicas',
    intereses: ['Salud', 'Estudio', 'Ayuda mutua']
  }
];

async function createDemoAccount(accountData) {
  try {
    console.log(`\n🔧 Creando cuenta: ${accountData.email}`);

    // 1. Verificar si el usuario ya existe en Auth
    let user;
    try {
      user = await auth.getUserByEmail(accountData.email);
      console.log(`  ℹ️  Usuario ya existe en Auth (UID: ${user.uid})`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // 2. Crear usuario en Firebase Auth
        user = await auth.createUser({
          email: accountData.email,
          password: accountData.password,
          displayName: accountData.displayName,
          emailVerified: true // Marcar como verificado
        });
        console.log(`  ✅ Usuario creado en Auth (UID: ${user.uid})`);
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
      favoresPublicados: [],
      favoresCompletados: [],
      fechaRegistro: admin.firestore.FieldValue.serverTimestamp()
    };

    if (userDoc.exists) {
      await userRef.update(userData);
      console.log(`  ✅ Documento actualizado en Firestore`);
    } else {
      await userRef.set(userData);
      console.log(`  ✅ Documento creado en Firestore`);
    }

    console.log(`  📧 Email: ${accountData.email}`);
    console.log(`  🔑 Password: ${accountData.password}`);
    console.log(`  👤 Rol: ${accountData.rol}`);
    console.log(`  ✅ Email verificado: Sí`);

    return {
      success: true,
      uid: user.uid,
      email: accountData.email,
      rol: accountData.rol
    };
  } catch (error) {
    console.error(`  ❌ Error al crear cuenta ${accountData.email}:`, error.message);
    return {
      success: false,
      email: accountData.email,
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 Iniciando creación de cuentas demo...\n');
  console.log('=' .repeat(60));

  const results = [];

  for (const account of DEMO_ACCOUNTS) {
    const result = await createDemoAccount(account);
    results.push(result);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMEN DE CREACIÓN\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Cuentas creadas exitosamente: ${successful.length}`);
  successful.forEach(r => {
    console.log(`   - ${r.email} (${r.rol}) - UID: ${r.uid}`);
  });

  if (failed.length > 0) {
    console.log(`\n❌ Cuentas con errores: ${failed.length}`);
    failed.forEach(r => {
      console.log(`   - ${r.email}: ${r.error}`);
    });
  }

  console.log('\n📝 CREDENCIALES DE ACCESO:\n');
  DEMO_ACCOUNTS.forEach(account => {
    console.log(`${account.displayName}:`);
    console.log(`  Email: ${account.email}`);
    console.log(`  Password: ${account.password}`);
    console.log(`  Rol: ${account.rol}\n`);
  });

  console.log('✨ Proceso completado\n');
  process.exit(0);
}

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
