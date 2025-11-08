/**
 * Script para corregir el nombre de columna en comercial - Hoja 1.csv
 *
 * Cambia: archivUrl → archivoUrl
 *
 * USO: npm run comercial:fix-csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_FILE = path.join(__dirname, '..', 'comercial - Hoja 1.csv');
const BACKUP_FILE = path.join(__dirname, '..', 'comercial - Hoja 1.csv.backup');

console.log('=================================================================');
console.log('  CORRECCIÓN DE CSV COMERCIAL');
console.log('=================================================================\n');

// 1. Verificar que existe el archivo
if (!fs.existsSync(CSV_FILE)) {
  console.error(`❌ Error: No se encontró el archivo: ${CSV_FILE}`);
  process.exit(1);
}

// 2. Leer el contenido
console.log('📖 Leyendo archivo...');
const content = fs.readFileSync(CSV_FILE, 'utf-8');
const lines = content.split('\n');

console.log(`   Total de líneas: ${lines.length}`);

// 3. Verificar la primera línea (header)
const header = lines[0];
console.log(`   Header original: ${header.substring(0, 80)}...\n`);

// 4. Verificar si necesita corrección
if (!header.includes('archivUrl')) {
  console.log('✅ El CSV ya tiene el formato correcto (archivoUrl)');
  console.log('   No se necesitan cambios.\n');
  process.exit(0);
}

// 5. Crear backup
console.log('💾 Creando backup...');
fs.copyFileSync(CSV_FILE, BACKUP_FILE);
console.log(`   Backup guardado en: ${BACKUP_FILE}\n`);

// 6. Corregir el header
console.log('🔧 Corrigiendo header...');
const newHeader = header.replace('archivUrl', 'archivoUrl');
lines[0] = newHeader;

// 7. Guardar el archivo corregido
console.log('💾 Guardando archivo corregido...');
const newContent = lines.join('\n');
fs.writeFileSync(CSV_FILE, newContent, 'utf-8');

console.log('   Header corregido: ' + newHeader.substring(0, 80) + '...\n');

console.log('=================================================================');
console.log('  ✅ ARCHIVO CORREGIDO EXITOSAMENTE');
console.log('=================================================================');
console.log(`Archivo:  ${CSV_FILE}`);
console.log(`Backup:   ${BACKUP_FILE}`);
console.log(`Cambio:   archivUrl → archivoUrl`);
console.log('=================================================================\n');

console.log('📋 Próximos pasos:\n');
console.log('   1. Ejecuta: npm run comercial:create-folders');
console.log('   2. Ejecuta: npm run comercial:import');
console.log('   3. ¡Listo!\n');

process.exit(0);
