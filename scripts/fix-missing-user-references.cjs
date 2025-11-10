/**
 * Script para crear documentos de usuario para todos los UIDs que aparecen
 * en contenido (favores, anuncios, materiales) pero no tienen documento de usuario
 *
 * USO:
 * node scripts/fix-missing-user-references.cjs
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Obtiene todos los UIDs únicos de una colección
 */
async function getUniqueUidsFromCollection(collectionName, uidField) {
  const uids = new Set();
  const snapshot = await db.collection(collectionName).get();

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data[uidField]) {
      uids.add(data[uidField]);
    }
  });

  return Array.from(uids);
}

/**
 * Verifica si un usuario existe en Firestore
 */
async function userExists(uid) {
  const userDoc = await db.collection('usuarios').doc(uid).get();
  return userDoc.exists;
}

/**
 * Crea un documento de usuario placeholder
 */
async function createPlaceholderUser(uid) {
  const userData = {
    nombre: 'Usuario Eliminado',
    email: `deleted-user-${uid}@placeholder.com`,
    carrera: '',
    año: 1,
    telefono: '',
    intereses: [],
    descripcion: 'Este usuario ya no existe en el sistema',
    rol: 'normal',
    reputacion: 5.0,
    totalCalificaciones: 0,
    favoresPublicados: [],
    favoresCompletados: [],
    isPlaceholder: true, // Marca especial para usuarios placeholder
    fechaRegistro: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('usuarios').doc(uid).set(userData);
}

/**
 * Procesa todas las colecciones y crea usuarios faltantes
 */
async function fixMissingUserReferences() {
  try {
    console.log('\n🔍 BUSCANDO REFERENCIAS DE USUARIOS EN CONTENIDO');
    console.log('═'.repeat(60));

    // Obtener UIDs de diferentes colecciones
    console.log('\n📦 Analizando colecciones...\n');

    const collections = [
      { name: 'favores', fields: ['usuarioId', 'autor'] },
      { name: 'anuncios', fields: ['autor', 'usuarioId'] },
      { name: 'materiales', fields: ['autorId', 'autor'] },
      { name: 'productos', fields: ['autor', 'vendedor'] }
    ];

    const allUids = new Set();

    for (const collection of collections) {
      console.log(`   🔎 Procesando colección: ${collection.name}`);
      const snapshot = await db.collection(collection.name).get();

      let count = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        collection.fields.forEach(field => {
          if (data[field]) {
            allUids.add(data[field]);
            count++;
          }
        });
      });

      console.log(`      ✓ ${count} referencias encontradas`);
    }

    console.log(`\n✅ Total de UIDs únicos encontrados: ${allUids.size}\n`);

    // Verificar cuáles usuarios existen
    console.log('🔍 Verificando existencia de documentos de usuario...\n');

    let existentes = 0;
    let faltantes = 0;
    let creados = 0;
    const uidsToCreate = [];

    for (const uid of allUids) {
      const exists = await userExists(uid);
      if (exists) {
        existentes++;
      } else {
        faltantes++;
        uidsToCreate.push(uid);
        console.log(`   ❌ Falta documento para UID: ${uid}`);
      }
    }

    console.log(`\n📊 Estado inicial:`);
    console.log(`   ✅ Usuarios existentes: ${existentes}`);
    console.log(`   ❌ Usuarios faltantes: ${faltantes}\n`);

    if (uidsToCreate.length > 0) {
      console.log('🔧 Creando documentos placeholder para usuarios faltantes...\n');

      for (const uid of uidsToCreate) {
        try {
          await createPlaceholderUser(uid);
          console.log(`   ✅ Documento creado para UID: ${uid}`);
          creados++;
        } catch (error) {
          console.error(`   ❌ Error creando documento para ${uid}:`, error.message);
        }
      }

      console.log('\n' + '─'.repeat(60));
      console.log('📊 RESUMEN FINAL:');
      console.log('─'.repeat(60));
      console.log(`   ✅ Usuarios existentes: ${existentes}`);
      console.log(`   ❌ Usuarios faltantes: ${faltantes}`);
      console.log(`   🔧 Documentos creados: ${creados}`);
      console.log('─'.repeat(60));

      if (creados > 0) {
        console.log('\n🎉 Se crearon documentos placeholder para usuarios eliminados');
        console.log('\n📝 Nota:');
        console.log('   - Los usuarios creados tienen el nombre "Usuario Eliminado"');
        console.log('   - Esto evitará errores al cargar contenido de usuarios eliminados');
        console.log('   - El contenido antiguo seguirá siendo visible');
      }
    } else {
      console.log('✅ Todos los usuarios referenciados tienen sus documentos\n');
    }

  } catch (error) {
    console.error('\n❌ Error al procesar referencias:', error);
    throw error;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('\n🔧 REPARACIÓN DE REFERENCIAS DE USUARIOS');
  console.log('═'.repeat(60));
  console.log('\nEste script:');
  console.log('1. Busca todos los UIDs en favores, anuncios, materiales, productos');
  console.log('2. Verifica si tienen documento en la colección "usuarios"');
  console.log('3. Crea documentos placeholder para los que faltan\n');

  try {
    await fixMissingUserReferences();
    console.log('\n✅ Proceso completado exitosamente\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ El proceso falló\n');
    process.exit(1);
  }
}

// Ejecutar script
main();
