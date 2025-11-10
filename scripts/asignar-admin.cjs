/**
 * Script para asignar rol de administrador a un usuario
 *
 * USO:
 * node scripts/asignar-admin.js <email-del-usuario>
 *
 * Ejemplo:
 * node scripts/asignar-admin.js admin@example.com
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Asigna rol de admin a un usuario por email
 * @param {string} email - Email del usuario
 */
async function asignarRolAdmin(email) {
  try {
    console.log(`\n🔍 Buscando usuario con email: ${email}...`);

    // Buscar usuario en Firestore por email
    const usuariosRef = db.collection('usuarios');
    const querySnapshot = await usuariosRef.where('email', '==', email).get();

    if (querySnapshot.empty) {
      console.error(`❌ No se encontró ningún usuario con el email: ${email}`);
      console.log('\n💡 Asegúrate de que:');
      console.log('   1. El usuario se haya registrado en la aplicación');
      console.log('   2. El email esté escrito correctamente');
      process.exit(1);
    }

    // Obtener el primer usuario encontrado (debería ser único por email)
    const usuarioDoc = querySnapshot.docs[0];
    const usuarioId = usuarioDoc.id;
    const usuarioData = usuarioDoc.data();

    console.log(`\n✅ Usuario encontrado:`);
    console.log(`   - ID: ${usuarioId}`);
    console.log(`   - Nombre: ${usuarioData.nombre}`);
    console.log(`   - Email: ${usuarioData.email}`);
    console.log(`   - Rol actual: ${usuarioData.rol || 'normal'}`);

    // Verificar si ya es admin
    if (usuarioData.rol === 'admin') {
      console.log(`\n⚠️  Este usuario ya tiene rol de administrador`);
      process.exit(0);
    }

    // Actualizar rol a admin
    console.log(`\n🔄 Asignando rol de administrador...`);
    await usuariosRef.doc(usuarioId).update({
      rol: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`\n🎉 ¡Rol de administrador asignado exitosamente!`);
    console.log(`\n📋 Permisos otorgados:`);
    console.log(`   ✓ Eliminar cualquier favor, anuncio, material o producto`);
    console.log(`   ✓ Fijar favores`);
    console.log(`   ✓ Fijar anuncios (junto con rol exclusivo)`);
    console.log(`   ✓ Gestionar reportes`);
    console.log(`   ✓ Ver logs de acciones administrativas`);

    console.log(`\n⚠️  IMPORTANTE:`);
    console.log(`   - El usuario debe cerrar sesión y volver a iniciar sesión`);
    console.log(`   - Los cambios se aplicarán inmediatamente después de iniciar sesión`);

  } catch (error) {
    console.error('\n❌ Error al asignar rol de admin:', error);
    throw error;
  }
}

/**
 * Función principal
 */
async function main() {
  // Verificar argumentos
  const email = process.argv[2];

  if (!email) {
    console.error('\n❌ Error: Debes proporcionar un email');
    console.log('\n📖 Uso:');
    console.log('   node scripts/asignar-admin.js <email-del-usuario>');
    console.log('\n📝 Ejemplo:');
    console.log('   node scripts/asignar-admin.js admin@example.com');
    process.exit(1);
  }

  // Validar formato de email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error(`\n❌ Error: "${email}" no es un email válido`);
    process.exit(1);
  }

  try {
    await asignarRolAdmin(email);
    console.log('\n✅ Proceso completado exitosamente\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ El proceso falló\n');
    process.exit(1);
  }
}

// Ejecutar script
main();
