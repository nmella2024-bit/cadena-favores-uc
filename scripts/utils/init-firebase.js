import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta al archivo de credenciales (asumiendo que está en la raíz del proyecto)
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', '..', 'serviceAccountKey.json');

/**
 * Inicializa Firebase Admin SDK
 * @returns {admin.firestore.Firestore} Instancia de Firestore
 */
export function initFirebase() {
    try {
        if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
            throw new Error(`No se encontró el archivo de credenciales en: ${SERVICE_ACCOUNT_PATH}`);
        }

        const serviceAccount = JSON.parse(
            fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8')
        );

        // Verificar si ya está inicializada para evitar errores en tests o re-inicializaciones
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin inicializado correctamente');
        }

        return admin.firestore();
    } catch (error) {
        console.error('❌ Error al inicializar Firebase Admin:', error.message);
        process.exit(1);
    }
}

export { admin };
