const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require(path.resolve(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const auth = admin.auth();

async function checkUserRole(email) {
    try {
        const userRecord = await auth.getUserByEmail(email);
        const userDoc = await db.collection('usuarios').doc(userRecord.uid).get();

        if (!userDoc.exists) {
            console.log(`❌ Usuario no encontrado en Firestore: ${email}`);
            return;
        }

        const userData = userDoc.data();
        console.log(`\n👤 Usuario: ${userData.nombre || userData.displayName}`);
        console.log(`📧 Email: ${userData.email}`);
        console.log(`🔑 Rol actual: ${userData.rol || 'No definido'}`);
        console.log(`🆔 UID: ${userRecord.uid}\n`);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

const email = process.argv[2];
if (!email) {
    console.log('Uso: node scripts/check-user-role.js <email>');
    process.exit(1);
}

checkUserRole(email);
