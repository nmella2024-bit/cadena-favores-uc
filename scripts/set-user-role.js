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

async function setUserRole(email, role) {
    try {
        const userRecord = await auth.getUserByEmail(email);
        const userRef = db.collection('usuarios').doc(userRecord.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.log(`❌ Usuario no encontrado en Firestore: ${email}`);
            return;
        }

        await userRef.update({ rol: role });
        console.log(`\n✅ Rol actualizado exitosamente para ${email}`);
        console.log(`   Nuevo rol: ${role}\n`);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
    console.log('Uso: node scripts/set-user-role.js <email> <rol>');
    console.log('Roles válidos: admin, exclusivo, normal');
    process.exit(1);
}

setUserRole(email, role);
