/**
 * Script para detectar el proyecto correcto de Firebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🔍 DETECTANDO CONFIGURACIÓN DE FIREBASE\n');

// 1. Leer firebaseConfig.js para obtener el project ID
const firebaseConfigPath = path.join(__dirname, '..', 'src', 'firebaseConfig.js');

if (!fs.existsSync(firebaseConfigPath)) {
  console.error('❌ No se encuentra src/firebaseConfig.js');
  process.exit(1);
}

const configContent = fs.readFileSync(firebaseConfigPath, 'utf-8');
const projectIdMatch = configContent.match(/projectId:\s*['"](.*?)['"]/);

if (!projectIdMatch) {
  console.error('❌ No se pudo extraer projectId de firebaseConfig.js');
  process.exit(1);
}

const firebaseProjectId = projectIdMatch[1];
console.log(`✅ Proyecto Firebase detectado: ${firebaseProjectId}\n`);

// 2. Buscar archivo de credenciales
const possibleFiles = [
  `${firebaseProjectId}-*.json`,
  'red-uc-*.json',
  '*-service-account.json',
  'serviceAccountKey.json'
];

const files = fs.readdirSync(path.join(__dirname, '..'))
  .filter(f => f.endsWith('.json') && f.includes('service') || f.includes('coherent') || f.includes('red-uc'));

console.log('📁 Archivos de credenciales encontrados:');
files.forEach((f, i) => {
  console.log(`   ${i + 1}. ${f}`);
});
console.log();

// 3. Verificar cada archivo
for (const file of files) {
  const filePath = path.join(__dirname, '..', file);
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    console.log(`\n🔍 Verificando: ${file}`);
    console.log(`   Project ID: ${content.project_id}`);
    console.log(`   Client Email: ${content.client_email}`);

    if (content.project_id === firebaseProjectId) {
      console.log(`   ✅ COINCIDE con tu proyecto Firebase!`);
      console.log(`\n💡 Usa este archivo para los scripts:\n   ${file}\n`);
    } else {
      console.log(`   ⚠️  Proyecto diferente (esperado: ${firebaseProjectId})`);
    }
  } catch (e) {
    console.log(`   ❌ Error al leer: ${e.message}`);
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📝 RECOMENDACIONES:\n');
console.log(`1. Si NO tienes un archivo con project_id="${firebaseProjectId}":`);
console.log('   → Crea un Service Account en ese proyecto');
console.log(`   → URL: https://console.cloud.google.com/iam-admin/serviceaccounts?project=${firebaseProjectId}\n`);

console.log('2. Si SÍ tienes el archivo correcto:');
console.log('   → Actualiza los scripts para usar ese archivo\n');

console.log('3. Para habilitar Google Drive API en el proyecto correcto:');
console.log(`   → URL: https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=${firebaseProjectId}\n`);
