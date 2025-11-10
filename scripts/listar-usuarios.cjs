/**
 * Script para listar usuarios y sus roles
 *
 * USO:
 * node scripts/listar-usuarios.js [rol]
 *
 * Ejemplos:
 * node scripts/listar-usuarios.js           # Lista todos los usuarios
 * node scripts/listar-usuarios.js admin     # Lista solo admins
 * node scripts/listar-usuarios.js exclusivo # Lista solo exclusivos
 * node scripts/listar-usuarios.js normal    # Lista solo usuarios normales
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Lista usuarios con sus roles
 * @param {string} rolFiltro - Rol para filtrar (opcional)
 */
async function listarUsuarios(rolFiltro = null) {
  try {
    console.log('\n🔍 Buscando usuarios...\n');

    let query = db.collection('usuarios');

    // Aplicar filtro de rol si se especifica
    if (rolFiltro) {
      query = query.where('rol', '==', rolFiltro);
      console.log(`📋 Filtrando por rol: ${rolFiltro.toUpperCase()}\n`);
    }

    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      if (rolFiltro) {
        console.log(`⚠️  No se encontraron usuarios con rol "${rolFiltro}"`);
      } else {
        console.log('⚠️  No hay usuarios en la base de datos');
      }
      return;
    }

    // Agrupar usuarios por rol
    const usuariosPorRol = {
      admin: [],
      exclusivo: [],
      normal: []
    };

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const rol = data.rol || 'normal';

      usuariosPorRol[rol].push({
        id: doc.id,
        nombre: data.nombre,
        email: data.email,
        carrera: data.carrera || 'No especificada',
        rol: rol
      });
    });

    // Mostrar estadísticas
    const totalUsuarios = querySnapshot.size;
    console.log(`📊 Total de usuarios: ${totalUsuarios}\n`);

    // Mostrar admins
    if (usuariosPorRol.admin.length > 0) {
      console.log('👑 ADMINISTRADORES:');
      console.log('─'.repeat(80));
      usuariosPorRol.admin.forEach((user, index) => {
        console.log(`${index + 1}. ${user.nombre}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Carrera: ${user.carrera}`);
        console.log(`   ID: ${user.id}`);
        console.log('');
      });
    }

    // Mostrar exclusivos
    if (usuariosPorRol.exclusivo.length > 0) {
      console.log('⭐ USUARIOS EXCLUSIVOS:');
      console.log('─'.repeat(80));
      usuariosPorRol.exclusivo.forEach((user, index) => {
        console.log(`${index + 1}. ${user.nombre}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Carrera: ${user.carrera}`);
        console.log(`   ID: ${user.id}`);
        console.log('');
      });
    }

    // Mostrar usuarios normales (solo primeros 10 si hay muchos)
    if (usuariosPorRol.normal.length > 0) {
      console.log('👤 USUARIOS NORMALES:');
      console.log('─'.repeat(80));
      const mostrar = rolFiltro ? usuariosPorRol.normal : usuariosPorRol.normal.slice(0, 10);

      mostrar.forEach((user, index) => {
        console.log(`${index + 1}. ${user.nombre}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Carrera: ${user.carrera}`);
        console.log(`   ID: ${user.id}`);
        console.log('');
      });

      if (!rolFiltro && usuariosPorRol.normal.length > 10) {
        console.log(`   ... y ${usuariosPorRol.normal.length - 10} usuarios más`);
        console.log(`   (Usa: node scripts/listar-usuarios.js normal para ver todos)\n`);
      }
    }

    // Resumen
    console.log('─'.repeat(80));
    console.log('📈 RESUMEN:');
    console.log(`   👑 Admins: ${usuariosPorRol.admin.length}`);
    console.log(`   ⭐ Exclusivos: ${usuariosPorRol.exclusivo.length}`);
    console.log(`   👤 Normales: ${usuariosPorRol.normal.length}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Error al listar usuarios:', error);
    throw error;
  }
}

/**
 * Función principal
 */
async function main() {
  const rolFiltro = process.argv[2];

  // Validar rol si se especifica
  if (rolFiltro && !['admin', 'exclusivo', 'normal'].includes(rolFiltro)) {
    console.error('\n❌ Error: Rol inválido');
    console.log('\n📖 Roles válidos:');
    console.log('   - admin');
    console.log('   - exclusivo');
    console.log('   - normal');
    console.log('\n📝 Ejemplo:');
    console.log('   node scripts/listar-usuarios.js admin\n');
    process.exit(1);
  }

  try {
    await listarUsuarios(rolFiltro);
    console.log('✅ Proceso completado\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ El proceso falló\n');
    process.exit(1);
  }
}

// Ejecutar script
main();
