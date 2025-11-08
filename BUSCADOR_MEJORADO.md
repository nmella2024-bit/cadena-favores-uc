# 🔍 Buscador Mejorado con Búsqueda por Carpetas

## Resumen de Cambios

El buscador global ahora busca materiales **por ruta de carpetas**, permitiendo encontrar materiales navegando por la jerarquía de carpetas.

---

## ✨ Nuevas Funcionalidades

### **1. Búsqueda por Nombre de Carpeta**

Ahora puedes buscar carpetas directamente:

**Ejemplos:**
- Buscar `"Cálculo"` → Encuentra la carpeta "Cálculo I" y todos sus materiales
- Buscar `"Macro"` → Encuentra "Macro Internacional" y su contenido
- Buscar `"Evaluaciones"` → Encuentra todas las carpetas de evaluaciones

### **2. Búsqueda por Ruta Completa**

El buscador analiza la ruta completa de cada carpeta:

**Ejemplo de ruta:**
```
Ing Comercial / 9° y 10° Semestre / Economía / Macro Internacional / Evaluaciones / 2024-1
```

**Búsquedas que funcionan:**
- `"Ing Comercial"` → Encuentra todo en Ingeniería Comercial
- `"9° Semestre"` → Encuentra materiales del 9° semestre
- `"Economía"` → Encuentra todas las carpetas de Economía
- `"Macro Internacional"` → Encuentra ese ramo específico
- `"2024-1"` → Encuentra materiales del semestre 2024-1

### **3. Navegación Directa**

Al hacer clic en un resultado de material:
- **Si el material está en una carpeta:** Te lleva directamente a esa carpeta
- **Si el material está en la raíz:** Te lleva a la vista de materiales

---

## 📊 Cómo Funciona Internamente

### **Paso 1: Construcción del Índice de Carpetas**

El sistema construye un mapa de todas las carpetas con sus rutas completas:

```javascript
// Ejemplo de datos construidos:
{
  id: "folder123",
  nombre: "Macro Internacional",
  rutaCompleta: "Ing Comercial / 9° y 10° Semestre / Economía / Macro Internacional"
}
```

### **Paso 2: Búsqueda Inteligente**

Cuando buscas un término (ejemplo: `"Macro"`), el sistema:

1. **Busca carpetas que coincidan:**
   - Busca en el `nombre` de cada carpeta
   - Busca en la `rutaCompleta` de cada carpeta

2. **Encuentra materiales de dos formas:**
   - **Coincidencia directa:** El título/descripción del material contiene el término
   - **Coincidencia por carpeta:** El material está en una carpeta que coincide

3. **Ordena los resultados:**
   - Primero: Materiales que coinciden directamente
   - Segundo: Materiales que coinciden por carpeta

### **Paso 3: Presentación de Resultados**

Cada resultado de material muestra:

```
📁 Ing Comercial / 9° y 10° Semestre / Economía / Macro Internacional / Evaluaciones
   Control 1.pdf
```

---

## 🎯 Ejemplos de Uso

### **Ejemplo 1: Buscar por Ramo**

**Búsqueda:** `"Macro"`

**Resultados:**
```
Material (15)
├── 📁 Ing Comercial / ... / Macro Internacional / Evaluaciones / 2024-1
│   ├── Control 1.pdf
│   ├── Prueba 1.pdf
│   └── Examen.pdf
├── 📁 Ing Comercial / ... / Macro Internacional / Apuntes
│   └── Resumen Macro.pdf
...
```

### **Ejemplo 2: Buscar por Semestre**

**Búsqueda:** `"2024-1"`

**Resultados:**
```
Material (120)
├── 📁 Ing Comercial / ... / Evaluaciones / 2024-1
│   ├── Control 1.pdf
│   └── Prueba 1.pdf
├── 📁 Ing Comercial / ... / Otra Materia / Evaluaciones / 2024-1
│   └── Examen.pdf
...
```

### **Ejemplo 3: Buscar por Carrera**

**Búsqueda:** `"Ing Comercial"`

**Resultados:**
```
Material (2651)
├── 📁 Ing Comercial / 9° y 10° Semestre / Economía / ...
│   ├── Control 1.pdf
│   ├── Prueba 1.pdf
...
```

---

## 🔧 Archivos Modificados

### **1. [src/services/searchService.js](src/services/searchService.js)**

**Cambios:**
- Agregado sistema de caché de carpetas
- Función `buildFolderPath()` para construir rutas completas
- Búsqueda mejorada que incluye coincidencias por carpeta
- Ordenamiento de resultados (directos primero, por carpeta después)

**Fragmento clave:**
```javascript
// Buscar carpetas que coincidan con el término de búsqueda
folderMap.forEach((folder, folderId) => {
  const folderPath = buildFolderPath(folderId);
  const searchableText = `${folder.nombre} ${folderPath}`.toLowerCase();

  if (searchableText.includes(searchLower)) {
    matchingFolders.push({
      id: folderId,
      ...folder,
      rutaCompleta: folderPath
    });
  }
});
```

### **2. [src/components/GlobalSearch.jsx](src/components/GlobalSearch.jsx)**

**Cambios:**
- Modificado para mostrar la ruta de carpeta en lugar de carrera/ramo
- Navegación mejorada que va directamente a la carpeta del material
- Icono 📁 para indicar visualmente la carpeta

**Fragmento clave:**
```javascript
{item.carpetaInfo ? (
  <p className="text-sm text-text-muted truncate mt-1">
    📁 {item.carpetaInfo.rutaCompleta}
  </p>
) : (
  <p className="text-sm text-text-muted truncate mt-1">
    {item.carrera && item.ramo ? `${item.carrera} • ${item.ramo}` : 'Sin categoría'}
  </p>
)}
```

### **3. [src/pages/Material.jsx](src/pages/Material.jsx)**

**Cambios:**
- Agregado soporte para parámetro `?folder=ID` en la URL
- useEffect que detecta el parámetro y navega a la carpeta
- Limpia el parámetro después de navegar

**Fragmento clave:**
```javascript
useEffect(() => {
  const folderId = searchParams.get('folder');
  if (folderId) {
    obtenerCarpetaPorId(folderId).then(carpeta => {
      if (carpeta) {
        setCarpetaActual(carpeta);
      }
    });
    setSearchParams({});
  }
}, [searchParams, setSearchParams]);
```

---

## 📈 Ventajas del Nuevo Sistema

### **1. Búsqueda más Intuitiva**
- Los usuarios buscan por lo que conocen: nombres de carpetas
- No necesitan saber el año o carrera exacta

### **2. Navegación Directa**
- Al hacer clic en un resultado, vas directamente a la carpeta
- Ahorra clics y tiempo

### **3. Compatible con Materiales sin Metadata**
- Funciona perfectamente con materiales que no tienen `carrera` o `ramo`
- Se basa en la estructura de carpetas que siempre existe

### **4. Escalable**
- Funciona con cualquier cantidad de niveles de carpetas
- Construye rutas dinámicamente

---

## 🎨 Interfaz de Usuario

### **Antes:**
```
Control 1.pdf
Ingeniería Civil • Cálculo I
```

### **Después:**
```
Control 1.pdf
📁 Ing Comercial / 9° y 10° Semestre / Economía / Macro Internacional / Evaluaciones / 2024-1
```

**Ventajas:**
- Muestra la ubicación exacta del material
- Más contexto visual
- Fácil de entender la jerarquía

---

## ⚡ Rendimiento

### **Optimizaciones Implementadas:**

1. **Caché de Carpetas:**
   - Se construye una sola vez por búsqueda
   - Reutiliza el mapa de carpetas

2. **Construcción de Rutas:**
   - Usa un algoritmo eficiente que recorre hacia arriba
   - Evita búsquedas repetidas

3. **Límite de Resultados:**
   - Limita a 200 materiales por búsqueda (configurable)
   - Solo muestra los primeros 5 resultados por defecto

---

## 🧪 Cómo Probar

### **Prueba 1: Búsqueda Simple**
1. Abre el buscador global (barra superior)
2. Busca: `"Macro"`
3. Verifica que aparezcan materiales de "Macro Internacional"
4. Haz clic en un resultado
5. Verifica que te lleva a la carpeta correcta

### **Prueba 2: Búsqueda por Semestre**
1. Busca: `"2024-1"`
2. Verifica que aparezcan materiales del semestre 2024-1
3. Verifica que la ruta muestre "2024-1"

### **Prueba 3: Búsqueda por Carrera**
1. Busca: `"Ing Comercial"`
2. Verifica que aparezcan solo materiales de esa carrera
3. Verifica que las rutas empiecen con "Ing Comercial"

### **Prueba 4: Navegación**
1. Busca cualquier término
2. Haz clic en un resultado de material
3. Verifica que la página de Material:
   - Se carga con la carpeta correcta abierta
   - Muestra el breadcrumb correcto
   - Muestra los materiales de esa carpeta

---

## 🐛 Solución de Problemas

### **Problema: No aparecen resultados**

**Causas posibles:**
1. Los materiales no tienen `carpetaId`
2. Las carpetas no existen en Firestore

**Solución:**
- Verifica que los materiales tengan el campo `carpetaId`
- Ejecuta: `npm run folders:status` para ver el estado de las carpetas

### **Problema: La navegación no funciona**

**Causa:**
- La carpeta no existe o fue eliminada

**Solución:**
- Verifica en Firestore que la carpeta existe
- Verifica que el `carpetaId` del material sea correcto

### **Problema: Las rutas se ven incompletas**

**Causa:**
- Algunas carpetas tienen `carpetaPadreId` inválido

**Solución:**
- Ejecuta el script de validación de carpetas
- Revisa la jerarquía en Firestore

---

## 🔮 Mejoras Futuras Posibles

1. **Búsqueda Fuzzy:**
   - Permitir errores de tipeo
   - Ejemplo: "Calculo" → "Cálculo"

2. **Autocompletado:**
   - Sugerir nombres de carpetas mientras escribes

3. **Historial de Búsquedas:**
   - Guardar búsquedas recientes
   - Sugerir búsquedas populares

4. **Filtros Adicionales:**
   - Filtrar por tipo de archivo (PDF, DOCX, etc.)
   - Filtrar por fecha de subida

5. **Búsqueda por Tags:**
   - Si los materiales tienen tags, buscar por ellos

---

## 📝 Notas Técnicas

### **Complejidad:**
- Construcción de índice: O(n) donde n = número de carpetas
- Búsqueda: O(m) donde m = número de materiales
- Construcción de ruta: O(d) donde d = profundidad de carpeta (típicamente < 10)

### **Memoria:**
- Se mantiene un mapa de carpetas en memoria durante la búsqueda
- Se libera automáticamente al terminar

### **Firestore Queries:**
- 2 queries por búsqueda:
  1. Obtener todas las carpetas
  2. Obtener materiales (limitado a 200)

---

¿Necesitas alguna modificación o mejora adicional? El sistema está listo para usar.
