# Importación de Materiales de Derecho

Este documento explica cómo importar los materiales de Derecho desde el archivo `DerechoUC.csv`.

## Requisitos Previos

1. Archivo `DerechoUC.csv` en la raíz del proyecto
2. Archivo `serviceAccountKey.json` en la raíz del proyecto
3. Configuración de Google Drive root folder ID (en los scripts o como variable de entorno)

## Proceso de Importación

### Paso 1: Crear la Estructura de Carpetas

Primero debes crear todas las carpetas en Firestore y Google Drive:

```bash
npm run derecho:create-folders
```

**¿Qué hace este script?**
- Lee el archivo `DerechoUC.csv`
- Extrae todas las rutas únicas de carpetas de la columna `rutaCarpeta`
- Crea la estructura jerárquica completa en:
  - Firestore (colección `folders`)
  - Google Drive (dentro de la carpeta Material)
- Maneja carpetas padre automáticamente (ej: si necesita crear "A/B/C", primero crea "A", luego "A/B", luego "A/B/C")

**Tiempo estimado:** 5-15 minutos dependiendo del número de carpetas

### Paso 2: Importar los Materiales

Una vez creadas las carpetas, importa los materiales:

```bash
npm run derecho:import
```

**¿Qué hace este script?**
- Lee el archivo `DerechoUC.csv`
- Pre-carga todas las carpetas en memoria para búsquedas rápidas
- Para cada registro:
  - Busca la carpeta correspondiente
  - Crea el material en Firestore (colección `material`)
  - Asigna el autor como "NexUC"
- Usa batch operations para optimizar la escritura

**Optimizaciones:**
- Pre-carga todas las carpetas en memoria (búsqueda instantánea)
- Batch writes cada 500 documentos
- Muestra progreso en tiempo real
- Limita warnings de carpetas no encontradas a los primeros 5

**Tiempo estimado:** 5-10 minutos para ~3000 registros

## Estructura del CSV

El archivo `DerechoUC.csv` debe tener estas columnas:

| Columna | Descripción | Requerido |
|---------|-------------|-----------|
| `titulo` | Nombre del archivo | ✅ Sí |
| `descripcion` | Descripción del material | ❌ No |
| `tipo` | Tipo de archivo (pdf, docx, etc.) | ⚠️ Detecta automáticamente |
| `carrera` | Carrera (ej: "Derecho") | ❌ No (default: "Derecho") |
| `anio` | Año académico | ❌ No |
| `ramo` | Nombre del ramo | ❌ No |
| `tags` | Tags separados por comas | ❌ No |
| `archivoUrl` | URL de Google Drive | ✅ Sí |
| `rutaCarpeta` | Ruta jerárquica (ej: "General/CIVIL/Hernández") | ⚠️ Recomendado |

## Ejemplo de Registro

```csv
titulo,descripcion,tipo,carrera,anio,ramo,tags,archivoUrl,rutaCarpeta
"Apuntes Civil I",,"pdf","Derecho",1,"Civil I","civil,obligaciones","https://drive.google.com/file/d/...",General/CIVIL/Hernández/Civil I
```

## Solución de Problemas

### El script se queda cargando

**Solución:** Los scripts ya están optimizados para evitar este problema:
- Pre-cargan carpetas en memoria
- Muestran progreso en tiempo real
- Usan batch operations

Si aún así se congela, verifica:
1. Conexión a Firebase
2. Permisos del Service Account
3. Que el archivo CSV no esté corrupto

### Carpetas no encontradas

Si ves warnings de "Carpeta no encontrada":
1. Verifica que ejecutaste primero `npm run derecho:create-folders`
2. Revisa que las rutas en el CSV coincidan exactamente (sensible a mayúsculas)
3. Verifica que no haya espacios extra o caracteres especiales

### Error de permisos en Google Drive

Si falla la creación de carpetas en Drive:
1. Verifica que `ROOT_FOLDER_ID` esté correctamente configurado
2. Confirma que el Service Account tenga permisos de "Editor" en la carpeta raíz
3. Revisa que las credenciales en `serviceAccountKey.json` sean válidas

## Verificación Post-Importación

Después de la importación, verifica:

```bash
# Ver estado de las carpetas
npm run folders:status

# O consulta Firestore directamente
```

**Consultas útiles en Firestore Console:**

```javascript
// Contar materiales de Derecho
db.collection('material')
  .where('carrera', '==', 'Derecho')
  .count()

// Ver carpetas de Derecho
db.collection('folders')
  .where('seccion', '==', 'material')
  .where('nombre', '>=', 'General')
  .limit(10)
```

## Configuración

### Cambiar el Autor

Edita [scripts/import-derecho-from-csv.js](scripts/import-derecho-from-csv.js#L32-L33):

```javascript
const AUTOR_ID = '2xItxJLvGPhYeB2xYfCWP6g5dIg2';
const AUTOR_NOMBRE = 'NexUC';
```

### Cambiar la Carpeta Raíz de Drive

Edita ambos scripts o usa variable de entorno:

```bash
# Variable de entorno (recomendado)
export GOOGLE_DRIVE_ROOT_FOLDER_ID='tu-folder-id'

# O edita en el script
const ROOT_FOLDER_ID = 'tu-folder-id';
```

## Resumen

1. ✅ Coloca `DerechoUC.csv` en la raíz
2. ✅ Ejecuta `npm run derecho:create-folders`
3. ✅ Ejecuta `npm run derecho:import`
4. ✅ Verifica en Firestore Console

¡Listo! Los materiales de Derecho ya están importados.
