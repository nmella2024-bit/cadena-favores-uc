/**
 * Script para validar el CSV antes de importar
 *
 * USO:
 * npm run validate:csv
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_FILE = path.join(__dirname, '..', 'materiales.csv');

console.log('=================================================');
console.log('  VALIDACIÓN DE CSV');
console.log('=================================================\n');

// Verificar que existe el archivo
if (!fs.existsSync(CSV_FILE)) {
  console.error(`❌ Error: No se encontró el archivo ${CSV_FILE}`);
  console.error('   Coloca tu archivo materiales.csv en la raíz del proyecto\n');
  process.exit(1);
}

// Leer y parsear
console.log('📖 Leyendo archivo CSV...\n');
const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');

let registros;
try {
  registros = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true, // Permite filas con diferente número de columnas
    relax_quotes: true, // Más tolerante con las comillas
    escape: '"',
    quote: '"'
  });
  console.log(`✅ CSV parseado correctamente\n`);
} catch (error) {
  console.error('❌ Error al parsear el CSV:', error.message);
  console.error('\n💡 Posibles causas:');
  console.error('   1. Hay saltos de línea (Enter) dentro de algún campo');
  console.error('   2. Algún campo tiene comas pero no está entre comillas');
  console.error('   3. El archivo no está en formato UTF-8');
  console.error('\n📝 Revisa la línea mencionada en el error y verifica que:');
  console.error('   - Los campos con comas estén entre comillas dobles');
  console.error('   - No haya saltos de línea dentro de los campos');
  console.error('   - El archivo se exportó correctamente desde Google Sheets\n');
  process.exit(1);
}

// Mostrar estadísticas
console.log('📊 ESTADÍSTICAS DEL CSV:\n');
console.log(`   Total de filas: ${registros.length}`);

// Analizar columnas
if (registros.length > 0) {
  const columnas = Object.keys(registros[0]);
  console.log(`   Columnas encontradas: ${columnas.length}`);
  console.log('\n   Columnas:');
  columnas.forEach(col => console.log(`      - ${col}`));
}

// Validar columnas requeridas
console.log('\n🔍 VALIDACIÓN DE COLUMNAS REQUERIDAS:\n');

const columnasRequeridas = ['titulo', 'archivoUrl', 'tipo'];
const columnasOpcionales = ['descripcion', 'carrera', 'anio', 'ramo', 'tags', 'carpetaRuta', 'profesor', 'semestre'];

const columnas = registros.length > 0 ? Object.keys(registros[0]) : [];

columnasRequeridas.forEach(col => {
  if (columnas.includes(col)) {
    console.log(`   ✅ ${col}`);
  } else {
    console.log(`   ❌ ${col} - FALTA (obligatoria)`);
  }
});

console.log('\n   Columnas opcionales presentes:');
columnasOpcionales.forEach(col => {
  if (columnas.includes(col)) {
    console.log(`   ✅ ${col}`);
  }
});

// Validar datos
console.log('\n🔎 VALIDACIÓN DE DATOS:\n');

const errores = [];
const advertencias = [];

registros.forEach((registro, index) => {
  const fila = index + 2; // +2 porque empezamos en 1 y la fila 1 es el header

  // Validar campos obligatorios
  if (!registro.titulo || registro.titulo.trim() === '') {
    errores.push(`Fila ${fila}: Falta el título`);
  }

  if (!registro.archivoUrl || registro.archivoUrl.trim() === '') {
    errores.push(`Fila ${fila}: Falta la URL del archivo`);
  }

  if (!registro.tipo || registro.tipo.trim() === '') {
    errores.push(`Fila ${fila}: Falta el tipo de material`);
  }

  // Validar URL
  if (registro.archivoUrl) {
    const url = registro.archivoUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      advertencias.push(`Fila ${fila}: La URL no parece válida (${registro.titulo})`);
    }
  }

  // Validar año
  if (registro.anio) {
    const anio = parseInt(registro.anio);
    if (isNaN(anio) || anio < 1 || anio > 7) {
      advertencias.push(`Fila ${fila}: Año inválido (${registro.anio}) - debe ser 1-7`);
    }
  }

  // Validar tipo
  if (registro.tipo) {
    const tiposValidos = ['PDF', 'Word', 'PowerPoint', 'Excel', 'Video', 'Audio', 'Imagen', 'Otro'];
    if (!tiposValidos.includes(registro.tipo.trim())) {
      advertencias.push(`Fila ${fila}: Tipo no reconocido (${registro.tipo})`);
    }
  }
});

// Mostrar errores
if (errores.length > 0) {
  console.log('   ❌ ERRORES ENCONTRADOS:\n');
  errores.forEach(error => console.log(`      ${error}`));
  console.log(`\n   Total de errores: ${errores.length}`);
} else {
  console.log('   ✅ No se encontraron errores críticos');
}

// Mostrar advertencias
if (advertencias.length > 0) {
  console.log('\n   ⚠️  ADVERTENCIAS:\n');
  advertencias.slice(0, 10).forEach(adv => console.log(`      ${adv}`));
  if (advertencias.length > 10) {
    console.log(`      ... y ${advertencias.length - 10} advertencias más`);
  }
  console.log(`\n   Total de advertencias: ${advertencias.length}`);
} else {
  console.log('\n   ✅ No se encontraron advertencias');
}

// Análisis de carpetas
console.log('\n📁 ANÁLISIS DE CARPETAS:\n');

const carpetas = new Set();
registros.forEach(registro => {
  if (registro.carpetaRuta && registro.carpetaRuta.trim() !== '') {
    carpetas.add(registro.carpetaRuta.trim());
  }
});

console.log(`   Total de carpetas únicas mencionadas: ${carpetas.size}`);

if (carpetas.size > 0) {
  console.log('\n   Primeras 10 carpetas:');
  Array.from(carpetas).slice(0, 10).forEach(carpeta => {
    console.log(`      - ${carpeta}`);
  });
  if (carpetas.size > 10) {
    console.log(`      ... y ${carpetas.size - 10} carpetas más`);
  }
}

const sinCarpeta = registros.filter(r => !r.carpetaRuta || r.carpetaRuta.trim() === '').length;
console.log(`\n   Materiales sin carpeta asignada: ${sinCarpeta}`);

// Análisis de tipos
console.log('\n📄 ANÁLISIS DE TIPOS DE MATERIAL:\n');

const tiposCounts = {};
registros.forEach(registro => {
  const tipo = registro.tipo ? registro.tipo.trim() : 'Sin especificar';
  tiposCounts[tipo] = (tiposCounts[tipo] || 0) + 1;
});

Object.entries(tiposCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([tipo, count]) => {
    console.log(`   ${tipo}: ${count} archivos`);
  });

// Análisis de carreras
console.log('\n🎓 ANÁLISIS DE CARRERAS:\n');

const carrerasCounts = {};
registros.forEach(registro => {
  const carrera = registro.carrera ? registro.carrera.trim() : 'Sin especificar';
  carrerasCounts[carrera] = (carrerasCounts[carrera] || 0) + 1;
});

Object.entries(carrerasCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([carrera, count]) => {
    console.log(`   ${carrera}: ${count} materiales`);
  });

// Resultado final
console.log('\n=================================================');
console.log('  RESULTADO DE VALIDACIÓN');
console.log('=================================================\n');

if (errores.length === 0) {
  console.log('✅ El CSV está listo para importar');
  console.log('\n   Para importar, ejecuta:');
  console.log('   npm run import:materiales\n');
} else {
  console.log('❌ El CSV tiene errores que deben corregirse');
  console.log('\n   Por favor corrige los errores y vuelve a validar.\n');
  process.exit(1);
}
