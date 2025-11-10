/**
 * Script para cambiar el rol de un usuario
 *
 * USO:
 * node scripts/cambiar-rol.js <email-del-usuario> <nuevo-rol>
 *
 * Ejemplos:
 * node scripts/cambiar-rol.js usuario@example.com admin
 * node scripts/cambiar-rol.js usuario@example.com exclusivo
 * node scripts/cambiar-rol.js usuario@example.com normal
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const ROLES_VALIDOS = ['admin', 'exclusivo', 'normal'];

const PERMISOS = {
  admin: [
    '✓ Eliminar cualquier contenido (favores, anuncios, materiales, productos)',
    '✓ Fijar favores y anuncios',
    '✓ Gestionar reportes',
    '✓ Ver logs de acciones administrativas',
    '✓ Todos los permisos del sistema'
  ],
  exclusivo: [
    '✓ Fijar anuncios',
    '✓ Publicar contenido destacado',
    '✓ Acceso a funciones premium'
  ],
  normal: [
    '✓ Publicar favores, anuncios y materiales',
    '✓ Comprar y vender en marketplace',
    '✓ Interactuar con otros usuarios'
  ]
};

/**
 * Cambia el rol de un usuario
 * @param {string} email - Email del usuario
 * @param {string} nuevoRol - Nuevo rol a asignar
 */
async function cambiarRol(email, nuevoRol) {
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

    // Obtener el usuario
    const usuarioDoc = querySnapshot.docs[0];
    const usuarioId = usuarioDoc.id;
    const usuarioData = usuarioDoc.data();
    const rolActual = usuarioData.rol || 'normal';

    console.log(`\n✅ Usuario encontrado:`);
    console.log(`   - ID: ${usuarioId}`);
    console.log(`   - Nombre: ${usuarioData.nombre}`);
    console.log(`   - Email: ${usuarioData.email}`);
    console.log(`   - Rol actual: ${rolActual}`);

    // Verificar si el rol es el mismo
    if (rolActual === nuevoRol) {
      console.log(`\n⚠️  Este usuario ya tiene el rol "${nuevoRol}"`);
      process.exit(0);
    }

    // Actualizar rol
    console.log(`\n🔄 Cambiando rol de "${rolActual}" a "${nuevoRol}"...`);
    await usuariosRef.doc(usuarioId).update({
      rol: nuevoRol,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`\n🎉 ¡Rol actualizado exitosamente!`);
    console.log(`\n📋 Permisos del rol "${nuevoRol.toUpperCase()}":`);
    PERMISOS[nuevoRol].forEach(permiso => console.log(`   ${permiso}`));

    console.log(`\n⚠️  IMPORTANTE:`);
    console.log(`   - El usuario debe cerrar sesión y volver a iniciar sesión`);
    console.log(`   - Los cambios se aplicarán inmediatamente después de iniciar sesión`);

  } catch (error) {
    console.error('\n❌ Error al cambiar rol:', error);
    throw error;
  }
}

/**
 * Función principal
 */
async function main() {
  // Verificar argumentos
  const email = process.argv[2];
  const nuevoRol = process.argv[3];

  if (!email || !nuevoRol) {
    console.error('\n❌ Error: Debes proporcionar email y nuevo rol');
    console.log('\n📖 Uso:');
    console.log('   node scripts/cambiar-rol.js <email> <rol>');
    console.log('\n📝 Roles disponibles:');
    console.log('   - admin     : Administrador con todos los permisos');
    console.log('   - exclusivo : Usuario con permisos especiales');
    console.log('   - normal    : Usuario regular');
    console.log('\n💡 Ejemplo:');
    console.log('   node scripts/cambiar-rol.js usuario@example.com admin\n');
    process.exit(1);
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error(`\n❌ Error: "${email}" no es un email válido\n`);
    process.exit(1);
  }

  // Validar rol
  if (!ROLES_VALIDOS.includes(nuevoRol)) {
    console.error(`\n❌ Error: "${nuevoRol}" no es un rol válido`);
    console.log('\n📝 Roles válidos:');
    ROLES_VALIDOS.forEach(rol => console.log(`   - ${rol}`));
    console.log('');
    process.exit(1);
  }

  try {
    await cambiarRol(email, nuevoRol);
    console.log('\n✅ Proceso completado exitosamente\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ El proceso falló\n');
    process.exit(1);
  }
}

// Ejecutar script
main();
