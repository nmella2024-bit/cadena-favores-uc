/**
 * Script para limpiar filas incompletas del CSV
 *
 * USO:
 * node scripts/clean-incomplete-rows.js
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_FILE = path.join(__dirname, '..', 'materiales.csv');
const BACKUP_FILE = path.join(__dirname, '..', 'materiales.csv.backup');
const CLEANED_FILE = path.join(__dirname, '..', 'materiales-cleaned.csv');
const INCOMPLETE_FILE = path.join(__dirname, '..', 'materiales-incomplete.csv');

console.log('=================================================');
console.log('  LIMPIEZA DE FILAS INCOMPLETAS');
console.log('=================================================\n');

// Verificar que existe el archivo
if (!fs.existsSync(CSV_FILE)) {
  console.error(`❌ Error: No se encontró el archivo ${CSV_FILE}\n`);
  process.exit(1);
}

// Crear backup
console.log('📦 Creando backup...');
fs.copyFileSync(CSV_FILE, BACKUP_FILE);
console.log(`   ✅ Backup guardado: materiales.csv.backup\n`);

// Leer y parsear CSV
console.log('📖 Leyendo archivo CSV...');
const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');

const registros = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  relax_column_count: true,
  relax_quotes: true,
  escape: '"',
  quote: '"'
});

console.log(`   Total de registros: ${registros.length}\n`);

// Separar registros completos e incompletos
console.log('🔍 Analizando registros...\n');

const completos = [];
const incompletos = [];

registros.forEach((registro, index) => {
  const fila = index + 2; // +2 porque fila 1 es header
  const errores = [];

  if (!registro.titulo || registro.titulo.trim() === '') {
    errores.push('Falta título');
  }

  if (!registro.archivoUrl || registro.archivoUrl.trim() === '') {
    errores.push('Falta URL');
  }

  if (!registro.tipo || registro.tipo.trim() === '') {
    errores.push('Falta tipo');
  }

  if (errores.length > 0) {
    incompletos.push({
      fila,
      errores,
      registro
    });
  } else {
    completos.push(registro);
  }
});

// Mostrar resumen
console.log('📊 RESUMEN:\n');
console.log(`   ✅ Registros completos:    ${completos.length}`);
console.log(`   ⚠️  Registros incompletos: ${incompletos.length}\n`);

if (incompletos.length > 0) {
  console.log('📋 FILAS INCOMPLETAS:\n');

  // Mostrar primeros 10
  const mostrar = incompletos.slice(0, 10);
  mostrar.forEach(({ fila, errores, registro }) => {
    console.log(`   Fila ${fila}: ${errores.join(', ')}`);
    console.log(`   → Título: ${registro.titulo || '(vacío)'}`);
    console.log(`   → URL: ${registro.archivoUrl || '(vacío)'}`);
    console.log(`   → Tipo: ${registro.tipo || '(vacío)'}`);
    console.log('');
  });

  if (incompletos.length > 10) {
    console.log(`   ... y ${incompletos.length - 10} filas más\n`);
  }
}

// Guardar archivos
console.log('💾 Guardando archivos...\n');

// Header
const header = Object.keys(registros[0]);

// Guardar registros completos
const completosContent = stringify(completos, {
  header: true,
  columns: header
});
fs.writeFileSync(CLEANED_FILE, completosContent, 'utf-8');
console.log(`   ✅ Registros completos guardados en: materiales-cleaned.csv`);

// Guardar registros incompletos (para revisión)
if (incompletos.length > 0) {
  const incompletosData = incompletos.map(i => i.registro);
  const incompletosContent = stringify(incompletosData, {
    header: true,
    columns: header
  });
  fs.writeFileSync(INCOMPLETE_FILE, incompletosContent, 'utf-8');
  console.log(`   📝 Registros incompletos guardados en: materiales-incomplete.csv`);
}

// Resultado final
console.log('\n=================================================');
console.log('  RESULTADO');
console.log('=================================================\n');

if (incompletos.length === 0) {
  console.log('🎉 ¡Todos los registros están completos!\n');
  console.log('   Puedes ejecutar: npm run import:materiales\n');
} else {
  console.log(`✅ ${completos.length} registros listos para importar`);
  console.log(`⚠️  ${incompletos.length} registros incompletos (guardados para revisión)\n`);

  console.log('📋 OPCIONES:\n');
  console.log('   1. Importar solo los registros completos:');
  console.log('      - Renombra "materiales-cleaned.csv" a "materiales.csv"');
  console.log('      - Ejecuta: npm run import:materiales\n');

  console.log('   2. Completar los datos faltantes:');
  console.log('      - Abre "materiales-incomplete.csv"');
  console.log('      - Completa las URLs y tipos faltantes');
  console.log('      - Copia las filas corregidas a "materiales.csv"');
  console.log('      - Ejecuta: npm run import:materiales\n');

  console.log('   3. Ignorar los incompletos (recomendado):');
  console.log('      - Renombra "materiales-cleaned.csv" a "materiales.csv"');
  console.log('      - Ejecuta: npm run import:materiales\n');

  console.log('💡 RECOMENDACIÓN: Usa la opción 3 (ignorar incompletos)\n');
  console.log(`   Vas a importar ${completos.length} de ${registros.length} materiales (${((completos.length / registros.length) * 100).toFixed(1)}%)\n`);
}

console.log('🔙 Tu archivo original está seguro en: materiales.csv.backup\n');
