# Guía de Búsqueda Inteligente

Sistema de búsqueda normalizada que interpreta correctamente lo que el usuario quiere buscar, incluso con errores de escritura o variaciones de formato.

## Características

### 1. Normalización de Errores de Escritura

El sistema tolera y corrige automáticamente:

- ✅ **Mayúsculas/minúsculas**: `CALCULO` = `cálculo` = `CaLcUlO`
- ✅ **Tildes/acentos**: `calculo` = `cálculo`
- ✅ **Espacios**: `algebralineal` = `álgebra lineal`
- ✅ **Separadores**: `Calculo-I` = `Calculo_I` = `Calculo.I` = `Calculo I`
- ✅ **Errores de teclado**: `ano` = `año`
- ✅ **Duplicación de caracteres**: `cálculoo` = `cálculo`

### 2. Equivalencias Numéricas

El sistema interpreta como equivalentes:

- ✅ **Arábigos ↔ Romanos**: `1` = `I`, `2` = `II`, `3` = `III`
- ✅ **Con punto**: `I` = `.I`
- ✅ **Número + letra**: `1A` = `IA` = `I A`
- ✅ **Ceros a la izquierda**: `MAT001` = `MAT1`
- ✅ **Formatos mixtos**: `I-1` = `1_I` = `I1`

### 3. Variaciones de Archivos

El sistema considera:

- ✅ **Extensiones**: `.pdf`, `.docx`, `.xlsx`
- ✅ **Versiones**: `v1`, `v2`, `final`, `final_definitivo`
- ✅ **Duplicados** en diferentes carpetas
- ✅ **Metadata**: fechas, semestres (C1 2023, C1 2024)

## Uso Básico

### Importar el servicio

```javascript
import { smartSearch } from '../services/smartSearchService';
```

### Búsqueda simple

```javascript
const results = smartSearch('calculo 1', materiales);

console.log(results);
// {
//   query: 'calculo 1',
//   normalized: 'calculo 1',
//   results: [...],
//   total: 15,
//   suggestions: []
// }
```

### Búsqueda con opciones

```javascript
const results = smartSearch('algebra lineal', materiales, {
  searchFields: ['titulo', 'descripcion', 'ramo', 'tags'],
  minRelevance: 20,
  maxResults: 50,
  includeMetadata: true
});
```

## Ejemplos de Búsquedas

### Ejemplo 1: Cálculo I

```javascript
// Todas estas búsquedas encuentran lo mismo:
smartSearch('Calculo I', materiales);
smartSearch('calculo 1', materiales);
smartSearch('Cálculo 1', materiales);
smartSearch('calculo-I', materiales);
smartSearch('CALCULO.I', materiales);
smartSearch('CalculoI', materiales);
```

### Ejemplo 2: Álgebra Lineal

```javascript
// Todas estas búsquedas encuentran lo mismo:
smartSearch('Algebra Lineal', materiales);
smartSearch('álgebra lineal', materiales);
smartSearch('algebralineal', materiales);
smartSearch('Algebra-Lineal', materiales);
```

### Ejemplo 3: Con errores

```javascript
// Con errores de teclado (sin ñ):
smartSearch('calculo ano 1', materiales);  // Encuentra "Cálculo Año 1"

// Con duplicaciones:
smartSearch('cálculoo', materiales);  // Encuentra "Cálculo"

// Sin espacios:
smartSearch('calculodiferencial', materiales);  // Encuentra "Cálculo Diferencial"
```

## Uso en Componentes React

### Hook personalizado

```javascript
import { useState, useMemo } from 'react';
import { smartSearch } from '../services/smartSearchService';

export const useSmartSearch = (items, searchFields) => {
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    return smartSearch(searchTerm, items, {
      searchFields,
      minRelevance: 10,
      maxResults: 50
    });
  }, [searchTerm, items, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    results: results.results,
    total: results.total,
    suggestions: results.suggestions
  };
};
```

### Ejemplo en componente

```javascript
import React from 'react';
import { useSmartSearch } from '../hooks/useSmartSearch';

const BuscadorMateriales = ({ materiales }) => {
  const {
    searchTerm,
    setSearchTerm,
    results,
    total,
    suggestions
  } = useSmartSearch(materiales, ['titulo', 'ramo', 'descripcion']);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar materiales..."
      />

      {results.length > 0 ? (
        <div>
          <p>Se encontraron {total} resultados</p>
          {results.map(material => (
            <div key={material.id}>
              <h3>{material.titulo}</h3>
              <p>Relevancia: {material._score.toFixed(0)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p>No se encontraron resultados</p>
          {suggestions.length > 0 && (
            <div>
              <p>¿Quizás buscabas?</p>
              <ul>
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

## Búsqueda en Estructura Jerárquica

Para buscar en estructuras con carpetas anidadas:

```javascript
import { searchInHierarchy } from '../services/smartSearchService';

const estructura = {
  nombre: 'Materiales',
  hijos: [
    {
      nombre: 'Ingeniería Comercial',
      hijos: [
        {
          nombre: 'Cálculo I',
          archivos: [
            { nombre: 'Pauta_C1_2023.pdf', tipo: 'archivo' },
            { nombre: 'Pauta_C2_2023.pdf', tipo: 'archivo' }
          ]
        }
      ]
    }
  ]
};

const results = searchInHierarchy('calculo 1 pauta', estructura);

console.log(results);
// {
//   query: 'calculo 1 pauta',
//   results: [
//     {
//       path: ['Materiales', 'Ingeniería Comercial', 'Cálculo I', 'Pauta_C1_2023.pdf'],
//       fullPath: 'Materiales > Ingeniería Comercial > Cálculo I > Pauta_C1_2023.pdf',
//       score: 85,
//       type: 'archivo'
//     }
//   ]
// }
```

## Búsqueda Rápida (Sin Scoring)

Para búsquedas simples sin calcular relevancia:

```javascript
import { quickSearch } from '../services/smartSearchService';

// Filtrado rápido
const filtered = quickSearch('calculo', materiales, ['titulo']);
```

## Utilidades de Normalización

Puedes usar las utilidades de normalización directamente:

```javascript
import {
  normalizeText,
  romanToArabic,
  arabicToRoman,
  generateSearchVariations
} from '../utils/searchNormalizer';

// Normalizar texto
normalizeText('Cálculo I');  // 'calculo i'

// Convertir números
romanToArabic('Cálculo II');  // 'Calculo 2'
arabicToRoman('Calculo 2');   // 'Calculo II'

// Generar variaciones
generateSearchVariations('Cálculo I');
// ['Cálculo I', 'calculo i', 'calculo 1', 'calculo I', ...]
```

## Formato de Resultados

Cada resultado incluye:

```javascript
{
  ...itemOriginal,           // Todos los campos del item original
  _score: 85,                // Puntuación de relevancia (0-100+)
  _bestField: 'titulo',      // Campo donde se encontró la mejor coincidencia
  _searchMeta: {             // Metadata de búsqueda
    matchedVariation: 'calculo 1',
    searchTokens: ['calculo', '1'],
    hasExactMatch: true
  }
}
```

## Algoritmo de Relevancia

El sistema calcula la relevancia basándose en:

1. **Coincidencia exacta** (100 puntos)
2. **Coincidencia de palabras completas** (20 puntos por palabra)
3. **Coincidencia de substring** (50 puntos)
4. **Similitud general** (0-30 puntos)
5. **Bonus por nombre de archivo** (+10 puntos)
6. **Bonus por extensión común** (+5 puntos)
7. **Penalización por nombres genéricos** (-20 puntos)

## Sugerencias

Cuando hay menos de 3 resultados, el sistema genera sugerencias automáticamente basándose en coincidencias parciales.

## Performance

- ✅ **Búsqueda en memoria**: ~1-5ms para 1000 items
- ✅ **Múltiples variaciones**: Genera 10-15 variaciones por término
- ✅ **Caching**: Los resultados pueden ser cacheados con `useMemo`

## Testing

```javascript
import { smartSearch } from '../services/smartSearchService';

// Datos de prueba
const testData = [
  { id: 1, titulo: 'Cálculo I - Pauta C1', ramo: 'Cálculo I' },
  { id: 2, titulo: 'Calculo 2 - Apuntes', ramo: 'Cálculo II' },
  { id: 3, titulo: 'Álgebra Lineal', ramo: 'Álgebra Lineal' }
];

// Test 1: Búsqueda con número romano
const test1 = smartSearch('calculo 1', testData);
console.assert(test1.total >= 1, 'Debe encontrar Cálculo I');

// Test 2: Búsqueda sin tilde
const test2 = smartSearch('algebra', testData);
console.assert(test2.total >= 1, 'Debe encontrar Álgebra');

// Test 3: Búsqueda sin espacios
const test3 = smartSearch('calculoI', testData);
console.assert(test3.total >= 1, 'Debe encontrar Cálculo I');
```

## Limitaciones

- No soporta búsquedas con operadores booleanos (AND, OR, NOT)
- No soporta búsquedas con comodines (* o ?)
- No soporta búsquedas por expresiones regulares
- El máximo es 15 variaciones por término para mantener performance

## Próximos Pasos

Posibles mejoras futuras:

1. **Búsqueda fonética**: Interpretar palabras que suenan similar
2. **Aprendizaje**: Mejorar resultados basándose en clics del usuario
3. **Sinónimos**: Expandir búsqueda con sinónimos comunes
4. **Búsqueda semántica**: Usar embeddings para búsqueda por significado

## Soporte

Si encuentras problemas o tienes sugerencias, contacta al equipo de desarrollo.
