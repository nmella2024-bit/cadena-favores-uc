/**
 * Script para limpiar y corregir el CSV automáticamente
 *
 * USO:
 * node scripts/fix-csv.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_FILE = path.join(__dirname, '..', 'materiales.csv');
const BACKUP_FILE = path.join(__dirname, '..', 'materiales.csv.backup');
const FIXED_FILE = path.join(__dirname, '..', 'materiales-fixed.csv');

console.log('=================================================');
console.log('  LIMPIEZA AUTOMÁTICA DEL CSV');
console.log('=================================================\n');

// Verificar que existe el archivo
if (!fs.existsSync(CSV_FILE)) {
  console.error(`❌ Error: No se encontró el archivo ${CSV_FILE}\n`);
  process.exit(1);
}

// Crear backup
console.log('📦 Creando backup del archivo original...');
fs.copyFileSync(CSV_FILE, BACKUP_FILE);
console.log(`   ✅ Backup guardado en: materiales.csv.backup\n`);

// Leer el archivo
console.log('📖 Leyendo archivo CSV...');
const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
const lines = csvContent.split('\n');
console.log(`   Total de líneas: ${lines.length}\n`);

// Obtener header
const header = lines[0];
const expectedColumns = header.split(',').length;
console.log(`📋 Columnas esperadas: ${expectedColumns}\n`);

// Procesar líneas
console.log('🔧 Procesando y limpiando líneas...\n');

const fixedLines = [header]; // Empezar con el header
const problemLines = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();

  // Saltar líneas vacías
  if (line === '') {
    console.log(`   ⚠️  Línea ${i + 1}: Vacía - ELIMINADA`);
    problemLines.push({ line: i + 1, reason: 'Línea vacía' });
    continue;
  }

  // Contar columnas (esto es aproximado, no considera comillas correctamente)
  const columns = line.split(',').length;

  // Si tiene muy pocas columnas, probablemente está corrupta
  if (columns < expectedColumns / 2) {
    console.log(`   ⚠️  Línea ${i + 1}: Solo ${columns} columnas (se esperan ${expectedColumns}) - ELIMINADA`);
    console.log(`      Contenido: ${line.substring(0, 100)}...`);
    problemLines.push({ line: i + 1, reason: `Solo ${columns} columnas`, content: line.substring(0, 100) });
    continue;
  }

  // Línea parece válida
  fixedLines.push(line);
}

// Guardar archivo corregido
console.log(`\n💾 Guardando archivo corregido...\n`);
const fixedContent = fixedLines.join('\n');
fs.writeFileSync(FIXED_FILE, fixedContent, 'utf-8');

// Resumen
console.log('=================================================');
console.log('  RESUMEN');
console.log('=================================================');
console.log(`Líneas originales:     ${lines.length}`);
console.log(`Líneas corregidas:     ${fixedLines.length}`);
console.log(`Líneas eliminadas:     ${lines.length - fixedLines.length}`);
console.log('=================================================\n');

if (problemLines.length > 0) {
  console.log('📝 Líneas eliminadas:\n');
  problemLines.forEach(({ line, reason, content }) => {
    console.log(`   Línea ${line}: ${reason}`);
    if (content) {
      console.log(`   → ${content}...`);
    }
  });
  console.log('');
}

console.log('✅ Archivo corregido guardado en: materiales-fixed.csv\n');
console.log('📋 Próximos pasos:\n');
console.log('   1. Revisa el archivo materiales-fixed.csv');
console.log('   2. Si se ve bien, renómbralo a materiales.csv');
console.log('   3. Ejecuta: npm run validate:csv');
console.log('   4. Si todo está OK, ejecuta: npm run import:materiales\n');
console.log('💡 Si algo salió mal, tu archivo original está en materiales.csv.backup\n');
