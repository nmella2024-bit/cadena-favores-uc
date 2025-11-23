import { initFirebase, admin } from './utils/init-firebase.js';

const db = initFirebase();

/**
 * Muestra la ayuda del script
 */
function showHelp() {
    console.log(`
Uso: node scripts/manage-users.js <comando> [argumentos]

Comandos disponibles:
  list                    Lista los últimos 20 usuarios registrados
  get <email>             Obtiene información detallada de un usuario
  set-role <email> <rol>  Asigna un rol a un usuario (admin, exclusivo, normal)
  verify <email>          Verifica si un usuario existe y muestra su estado

Ejemplos:
  node scripts/manage-users.js list
  node scripts/manage-users.js get usuario@uc.cl
  node scripts/manage-users.js set-role admin@uc.cl admin
`);
}

/**
 * Lista usuarios recientes
 */
async function listUsers() {
    try {
        const snapshot = await db.collection('usuarios')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        if (snapshot.empty) {
            console.log('No se encontraron usuarios.');
            return;
        }

        console.log('\nÚltimos 20 usuarios registrados:');
        console.log('----------------------------------------------------------------');
        console.log('| ID | Nombre | Email | Rol | Fecha Registro |');
        console.log('----------------------------------------------------------------');

        snapshot.forEach(doc => {
            const data = doc.data();
            const fecha = data.createdAt ? data.createdAt.toDate().toLocaleDateString() : 'N/A';
            console.log(`| ${doc.id.padEnd(28)} | ${data.nombre?.padEnd(20).substring(0, 20)} | ${data.email?.padEnd(30)} | ${data.rol?.padEnd(10) || 'normal    '} | ${fecha} |`);
        });
        console.log('----------------------------------------------------------------\n');
    } catch (error) {
        console.error('Error al listar usuarios:', error);
    }
}

/**
 * Obtiene usuario por email
 */
async function getUserByEmail(email) {
    const snapshot = await db.collection('usuarios').where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0];
}

/**
 * Muestra detalles de un usuario
 */
async function getUser(email) {
    const userDoc = await getUserByEmail(email);
    if (!userDoc) {
        console.log(`❌ Usuario no encontrado: ${email}`);
        return;
    }

    const data = userDoc.data();
    console.log('\nDetalles del usuario:');
    console.log('---------------------');
    console.log(`ID: ${userDoc.id}`);
    console.log(`Nombre: ${data.nombre}`);
    console.log(`Email: ${data.email}`);
    console.log(`Rol: ${data.rol || 'normal'}`);
    console.log(`Créditos: ${data.creditos || 0}`);
    console.log(`Referido por: ${data.referidoPor || 'N/A'}`);
    console.log(`Código Referido: ${data.codigoReferido || 'N/A'}`);
    console.log(`Fecha Registro: ${data.createdAt ? data.createdAt.toDate().toLocaleString() : 'N/A'}`);
    console.log('---------------------\n');
}

/**
 * Asigna rol a un usuario
 */
async function setRole(email, role) {
    const validRoles = ['admin', 'exclusivo', 'normal'];
    if (!validRoles.includes(role)) {
        console.error(`❌ Rol inválido: ${role}. Roles permitidos: ${validRoles.join(', ')}`);
        return;
    }

    const userDoc = await getUserByEmail(email);
    if (!userDoc) {
        console.log(`❌ Usuario no encontrado: ${email}`);
        return;
    }

    try {
        await userDoc.ref.update({
            rol: role,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Rol '${role}' asignado exitosamente a ${email}`);
    } catch (error) {
        console.error('Error al actualizar rol:', error);
    }
}

// Procesar argumentos
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        showHelp();
        return;
    }

    switch (command) {
        case 'list':
            await listUsers();
            break;
        case 'get':
        case 'verify':
            if (!args[1]) {
                console.error('❌ Debes especificar un email');
                return;
            }
            await getUser(args[1]);
            break;
        case 'set-role':
            if (!args[1] || !args[2]) {
                console.error('❌ Debes especificar email y rol');
                return;
            }
            await setRole(args[1], args[2]);
            break;
        default:
            console.error(`❌ Comando desconocido: ${command}`);
            showHelp();
    }
}

main().catch(console.error);
