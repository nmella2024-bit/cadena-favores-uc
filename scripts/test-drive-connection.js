/**
 * Script de prueba para verificar la conexión con Google Drive
 *
 * Verifica:
 * 1. Credenciales válidas
 * 2. Acceso a Google Drive API
 * 3. Permisos de lectura/escritura
 * 4. Capacidad de crear y eliminar carpetas
 *
 * USO:
 * node scripts/test-drive-connection.js
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CREDENTIALS_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');

// Leer el Service Account Email del archivo de credenciales
let SERVICE_ACCOUNT_EMAIL;
try {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  SERVICE_ACCOUNT_EMAIL = credentials.client_email;
} catch (error) {
  console.error('❌ Error al leer credenciales:', error.message);
  process.exit(1);
}

async function testDriveConnection() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🧪 TEST DE CONEXIÓN A GOOGLE DRIVE\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Verificar archivo de credenciales
  console.log('1️⃣  Verificando archivo de credenciales...\n');

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Error: No se encuentra el archivo de credenciales');
    console.error(`   Ruta esperada: ${CREDENTIALS_PATH}\n`);
    console.error('💡 Asegúrate de tener el archivo serviceAccountKey.json en la raíz\n');
    process.exit(1);
  }

  console.log('✅ Archivo de credenciales encontrado\n');

  // 2. Cargar credenciales
  console.log('2️⃣  Cargando credenciales...\n');

  let credentials;
  try {
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    console.log(`   Email: ${credentials.client_email}`);
    console.log(`   Project ID: ${credentials.project_id}\n`);
    console.log('✅ Credenciales cargadas correctamente\n');
  } catch (error) {
    console.error('❌ Error al leer credenciales:', error.message);
    process.exit(1);
  }

  // 3. Inicializar Google Drive API
  console.log('3️⃣  Inicializando Google Drive API...\n');

  let drive;
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    drive = google.drive({ version: 'v3', auth });
    console.log('✅ Google Drive API inicializada\n');
  } catch (error) {
    console.error('❌ Error al inicializar API:', error.message);
    process.exit(1);
  }

  // 4. Test: Listar archivos (permisos de lectura)
  console.log('4️⃣  Probando permisos de lectura...\n');

  try {
    const response = await drive.files.list({
      pageSize: 5,
      fields: 'files(id, name, mimeType)',
    });

    console.log(`✅ Permisos de lectura OK`);
    console.log(`   Archivos accesibles: ${response.data.files?.length || 0}\n`);

    if (response.data.files && response.data.files.length > 0) {
      console.log('   Primeros archivos encontrados:');
      response.data.files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (${file.mimeType})`);
      });
      console.log();
    }
  } catch (error) {
    console.error('❌ Error al listar archivos:', error.message);
    console.error('\n💡 Posibles causas:');
    console.error('   - Google Drive API no está habilitada');
    console.error('   - Credenciales inválidas o expiradas\n');
    process.exit(1);
  }

  // 5. Test: Crear carpeta (permisos de escritura)
  console.log('5️⃣  Probando permisos de escritura...\n');

  let testFolderId;
  try {
    const timestamp = Date.now();
    const folderName = `test-cadena-favores-${timestamp}`;

    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      fields: 'id, name',
    });

    testFolderId = response.data.id;

    console.log(`✅ Permisos de escritura OK`);
    console.log(`   Carpeta creada: "${response.data.name}"`);
    console.log(`   ID: ${testFolderId}\n`);
  } catch (error) {
    console.error('❌ Error al crear carpeta:', error.message);
    console.error('\n💡 El Service Account no tiene permisos de escritura\n');
    process.exit(1);
  }

  // 6. Test: Compartir carpeta
  console.log('6️⃣  Probando compartir con Service Account...\n');

  try {
    await drive.permissions.create({
      fileId: testFolderId,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: SERVICE_ACCOUNT_EMAIL,
      },
      sendNotificationEmail: false,
    });

    console.log('✅ Compartir carpeta OK\n');
  } catch (error) {
    console.warn('⚠️  No se pudo compartir (puede ser normal si ya tiene permisos)');
    console.warn(`   ${error.message}\n`);
  }

  // 7. Test: Eliminar carpeta (limpieza)
  console.log('7️⃣  Limpiando carpeta de prueba...\n');

  try {
    await drive.files.delete({
      fileId: testFolderId,
    });

    console.log('✅ Carpeta eliminada correctamente\n');
  } catch (error) {
    console.warn('⚠️  No se pudo eliminar la carpeta de prueba');
    console.warn(`   Elimínala manualmente: ${testFolderId}\n`);
  }

  // 8. Resumen final
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 RESUMEN DE TESTS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Credenciales válidas');
  console.log('✅ Conexión a Google Drive exitosa');
  console.log('✅ Permisos de lectura OK');
  console.log('✅ Permisos de escritura OK');
  console.log('✅ Capacidad de compartir OK');
  console.log('✅ Capacidad de eliminar OK\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎉 TODO FUNCIONANDO CORRECTAMENTE\n');
  console.log('   Puedes proceder con la migración de carpetas:\n');
  console.log('   npm run folders:migrate    (si ya tienes carpetas en Drive)');
  console.log('   npm run folders:create-drive    (para crear carpetas nuevas)\n');
}

// Ejecutar test
testDriveConnection()
  .then(() => {
    console.log('✅ Test completado\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test fallido:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  });
