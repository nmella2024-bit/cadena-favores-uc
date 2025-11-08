/**
 * Script para depurar líneas específicas del CSV
 *
 * USO:
 * node scripts/debug-csv-line.js 67
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_FILE = path.join(__dirname, '..', 'materiales.csv');

// Obtener número de línea desde argumentos
const lineNumber = parseInt(process.argv[2]) || 67;

console.log('=================================================');
console.log(`  DEPURACIÓN DE LÍNEA ${lineNumber} DEL CSV`);
console.log('=================================================\n');

// Verificar que existe el archivo
if (!fs.existsSync(CSV_FILE)) {
  console.error(`❌ Error: No se encontró el archivo ${CSV_FILE}\n`);
  process.exit(1);
}

// Leer el archivo línea por línea
const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
const lines = csvContent.split('\n');

console.log(`📊 Total de líneas en el archivo: ${lines.length}\n`);

if (lineNumber > lines.length) {
  console.error(`❌ Error: El archivo solo tiene ${lines.length} líneas\n`);
  process.exit(1);
}

// Mostrar header
console.log('📋 HEADER (Línea 1):');
console.log('─'.repeat(80));
console.log(lines[0]);
console.log('─'.repeat(80));

const headerColumns = lines[0].split(',');
console.log(`\nColumnas esperadas: ${headerColumns.length}`);
console.log('Columnas:');
headerColumns.forEach((col, i) => {
  console.log(`  ${i + 1}. ${col.trim()}`);
});

// Mostrar la línea problemática
console.log(`\n🔍 LÍNEA ${lineNumber}:`);
console.log('─'.repeat(80));
console.log(lines[lineNumber - 1]);
console.log('─'.repeat(80));

// Analizar la línea
const problematicLine = lines[lineNumber - 1];
const columnsFound = problematicLine.split(',').length;

console.log(`\n📊 ANÁLISIS:`);
console.log(`   Columnas esperadas: ${headerColumns.length}`);
console.log(`   Columnas encontradas: ${columnsFound}`);

if (columnsFound !== headerColumns.length) {
  console.log(`\n❌ ERROR: La línea tiene ${columnsFound} columnas pero se esperan ${headerColumns.length}`);

  if (columnsFound < headerColumns.length) {
    console.log('\n💡 Posibles causas:');
    console.log('   1. Faltan campos al final de la línea');
    console.log('   2. La línea está incompleta');
    console.log('   3. Hay campos vacíos sin comas');
  } else {
    console.log('\n💡 Posibles causas:');
    console.log('   1. Algún campo tiene comas pero no está entre comillas');
    console.log('   2. Hay un campo de descripción con comas sin comillas');
  }
}

// Mostrar contexto (líneas anteriores y posteriores)
console.log('\n📝 CONTEXTO (3 líneas antes y después):');
console.log('─'.repeat(80));

for (let i = Math.max(1, lineNumber - 3); i <= Math.min(lines.length, lineNumber + 3); i++) {
  const prefix = i === lineNumber ? '>>> ' : '    ';
  const lineNum = String(i).padStart(4, ' ');
  console.log(`${prefix}${lineNum} | ${lines[i - 1].substring(0, 100)}${lines[i - 1].length > 100 ? '...' : ''}`);
}
console.log('─'.repeat(80));

// Buscar caracteres problemáticos
console.log('\n🔎 CARACTERES ESPECIALES EN LA LÍNEA:');

const specialChars = {
  '\r': 'Retorno de carro (\\r)',
  '\n': 'Nueva línea (\\n)',
  '\t': 'Tabulación (\\t)',
  '"': 'Comilla doble (")',
  "'": "Comilla simple (')",
  ',': 'Coma (,)'
};

let foundSpecial = false;
for (const [char, name] of Object.entries(specialChars)) {
  const count = (problematicLine.match(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (count > 0) {
    console.log(`   ${name}: ${count} veces`);
    foundSpecial = true;
  }
}

if (!foundSpecial) {
  console.log('   No se encontraron caracteres especiales');
}

// Soluciones sugeridas
console.log('\n✅ SOLUCIONES SUGERIDAS:\n');

if (columnsFound === 1 && headerColumns.length > 1) {
  console.log('⚠️  La línea parece tener solo 1 columna. Esto puede indicar que:');
  console.log('   1. El delimitador no es una coma (tal vez sea ; o \\t)');
  console.log('   2. Toda la fila está dentro de comillas incorrectamente');
  console.log('\n   Solución:');
  console.log('   - Elimina esta línea del CSV');
  console.log('   - O corrige el formato para que tenga todas las columnas');
} else if (columnsFound < headerColumns.length) {
  console.log('⚠️  Faltan columnas en esta línea.');
  console.log('\n   Solución:');
  console.log('   - Completa los campos faltantes con valores o déjalos vacíos con comas');
  console.log(`   - Ejemplo: titulo,descripcion,tipo,,,,,,,, (${headerColumns.length} columnas)`);
} else {
  console.log('⚠️  Hay más columnas de las esperadas.');
  console.log('\n   Solución:');
  console.log('   - Encierra entre comillas dobles los campos que contengan comas');
  console.log('   - Ejemplo: "Descripción, con comas"');
  console.log('   - Asegúrate de usar " y no « o »');
}

console.log('\n   Luego vuelve a ejecutar: npm run validate:csv\n');
