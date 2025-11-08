# 📚 Guía de Importación: "comercial - Hoja 1.csv"

## Resumen

Esta guía te ayudará a importar materiales masivamente desde tu archivo CSV "comercial - Hoja 1.csv" a la sección de Materiales de tu aplicación.

---

## 🎯 Lo que se ha creado

Se han creado **scripts personalizados** específicos para tu CSV:

1. **[scripts/create-folders-from-comercial.js](scripts/create-folders-from-comercial.js)**
   - Crea automáticamente toda la estructura de carpetas del CSV
   - Respeta la jerarquía de carpetas (padre → hijos)
   - Evita duplicados usando cache

2. **[scripts/import-materiales-from-comercial.js](scripts/import-materiales-from-comercial.js)**
   - Importa todos los materiales del CSV a Firestore
   - Asigna cada material a su carpeta correspondiente
   - Procesa en batches de 500 para optimizar rendimiento

3. **Comandos npm nuevos:**
   - `npm run comercial:create-folders` - Crea las carpetas
   - `npm run comercial:import` - Importa los materiales

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:

- ✅ Tu archivo CSV: **`comercial - Hoja 1.csv`** en la raíz del proyecto
- ✅ Archivo de credenciales: **`serviceAccountKey.json`** en la raíz del proyecto
- ✅ El CSV debe tener estas columnas:

```csv
titulo,descripcion,tipo,carrera,anio,ramo,tags,archivoUrl,carpetaRuta,profesor,semestre
```

### Columnas obligatorias:
- **titulo**: Nombre del material
- **tipo**: Formato del archivo (PDF, .xlsx, .docx, etc.)
- **archivoUrl**: URL de Google Drive del archivo

### Columnas opcionales:
- descripcion, carrera, anio, ramo, tags, carpetaRuta, profesor, semestre

---

## 🚀 Pasos de Importación

### **Paso 1: Colocar tu archivo CSV**

1. Guarda tu archivo CSV con el nombre exacto: **`comercial - Hoja 1.csv`**
2. Colócalo en la raíz del proyecto:
   ```
   c:\Users\nmell\cadena-favores-uc\comercial - Hoja 1.csv
   ```

### **Paso 2: Verificar que tienes las credenciales**

Asegúrate de que existe el archivo:
```
c:\Users\nmell\cadena-favores-uc\serviceAccountKey.json
```

Si no lo tienes, descárgalo desde Firebase Console:
1. Ve a Firebase Console → Project Settings
2. Service Accounts → Generate new private key
3. Guárdalo como `serviceAccountKey.json` en la raíz

### **Paso 3: Crear la estructura de carpetas**

Abre una terminal en la raíz del proyecto y ejecuta:

```bash
npm run comercial:create-folders
```

**¿Qué hace este comando?**
- Lee todas las rutas del CSV (columna `carpetaRuta`)
- Extrae las rutas únicas
- Crea automáticamente toda la jerarquía de carpetas
- Si una carpeta ya existe, la reutiliza
- Muestra el progreso en tiempo real

**Salida esperada:**

```
=================================================================
  CREACIÓN DE CARPETAS DESDE "comercial - Hoja 1.csv"
=================================================================

✅ Firebase Admin inicializado correctamente

📖 Leyendo CSV...
   Total de registros: 1234

📁 Rutas únicas encontradas: 45

🔨 Creando estructura de carpetas...

   ✓ Creada: Primer Semestre
   ✓ Creada: Primer Semestre/Matemáticas
   ✓ Creada: Primer Semestre/Matemáticas/Cálculo I
   ○ Ya existe: Primer Semestre
   ✓ Creada: Primer Semestre/Física
   ...

=================================================================
  RESUMEN
=================================================================
Rutas procesadas:       45
Carpetas creadas:       38
Carpetas ya existentes: 7
Total en cache:         38
=================================================================

✅ ¡Estructura de carpetas creada exitosamente!

📋 Próximos pasos:

   1. Verifica las carpetas en tu aplicación (/material)
   2. Ejecuta: npm run comercial:import
   3. Esto importará los materiales a sus carpetas
```

**Tiempo estimado:** 1-5 minutos

---

### **Paso 4: Importar los materiales**

Una vez creadas las carpetas, ejecuta:

```bash
npm run comercial:import
```

**¿Qué hace este comando?**
- Lee todos los registros del CSV
- Valida que tengan los campos obligatorios
- Busca la carpeta correspondiente para cada material
- Crea los materiales en Firestore
- Procesa en batches de 500 para optimizar

**Salida esperada:**

```
=================================================================
  IMPORTACIÓN DE MATERIALES DESDE "comercial - Hoja 1.csv"
=================================================================

✅ Firebase Admin inicializado correctamente

📖 Leyendo archivo CSV...
✅ CSV parseado correctamente: 1234 registros encontrados

🔍 Validando registros...
✅ Todos los registros son válidos

✅ Autor verificado: NexUC

📥 Iniciando importación...

   ✓ Procesados 500/1234 materiales...
   ✓ Procesados 1000/1234 materiales...

=================================================================
  RESUMEN DE IMPORTACIÓN
=================================================================
Total de registros:    1234
✅ Importados:         1234
❌ Fallidos:           0
⚠️  Advertencias:       0
=================================================================

🎉 ¡Importación completada exitosamente!

📋 Próximos pasos:

   1. Ve a tu aplicación web → Sección Materiales
   2. Verifica que las carpetas y materiales estén correctos
   3. ¡Listo para usar!
```

**Tiempo estimado:** 5-15 minutos (dependiendo del número de materiales)

---

### **Paso 5: Verificar la importación**

1. **Abre tu aplicación web:**
   ```
   http://localhost:5173/material
   ```

2. **Verifica que aparezcan:**
   - Las nuevas carpetas en el árbol de carpetas
   - Los materiales dentro de cada carpeta
   - Los enlaces de Google Drive funcionando

3. **Si algo falta:**
   - Revisa los mensajes de advertencia en la consola
   - Verifica que las rutas del CSV coincidan con las carpetas creadas
   - Verifica en Firebase Console → Firestore Database

---

## 📊 Estructura de Datos Creada

### En Firestore - Colección `folders`:

```javascript
{
  id: "abc123",
  nombre: "Cálculo I",
  carpetaPadreId: "xyz789",  // ID de la carpeta padre
  autorId: "wuLb7RmRy3hJFmpYkPacQoUbZun1",
  autorNombre: "NexUC",
  fechaCreacion: Timestamp
}
```

### En Firestore - Colección `material`:

```javascript
{
  id: "def456",
  titulo: "Resumen de Límites",
  descripcion: "Resumen completo del capítulo 2",
  tipo: "PDF",
  carrera: "Ingeniería Civil",
  anio: 1,
  ramo: "Cálculo I",
  tags: ["límites", "continuidad"],
  archivoUrl: "https://drive.google.com/file/d/...",
  nombreArchivo: "Resumen de Límites",
  carpetaId: "abc123",  // ID de la carpeta donde está
  autorId: "wuLb7RmRy3hJFmpYkPacQoUbZun1",
  autorNombre: "NexUC",
  fijado: false,
  fechaSubida: Timestamp,
  profesor: "Dr. Pérez",
  semestre: "2024-1"
}
```

---

## ⚠️ Consideraciones Importantes

### 1. **No ejecutes los scripts dos veces sin limpiar**
   - Si ejecutas `npm run comercial:import` dos veces, se crearán materiales duplicados
   - Para limpiar duplicados, usa: `npm run clean:materiales`

### 2. **Carpetas no encontradas**
   - Si un material tiene una ruta de carpeta que no existe, se guardará en la raíz
   - Aparecerá una advertencia en consola: `⚠️ Fila X: Carpeta no encontrada`

### 3. **Campos vacíos en el CSV**
   - Los campos opcionales pueden estar vacíos
   - El script asignará valores por defecto:
     - carrera: "Otra"
     - ramo: "Todos los ramos"
     - tags: [] (array vacío)

### 4. **Formato de las rutas**
   - Las rutas deben usar `/` como separador
   - Ejemplo correcto: `"Primer Año/Matemáticas/Cálculo I"`
   - Ejemplo incorrecto: `"Primer Año\Matemáticas\Cálculo I"` (usa backslash)

### 5. **URLs de Google Drive**
   - Deben ser URLs públicas o compartidas
   - Formatos válidos:
     - `https://drive.google.com/file/d/ABC123/view`
     - `https://docs.google.com/document/d/ABC123/edit`
     - `https://docs.google.com/spreadsheets/d/ABC123/edit`

---

## 🔧 Solución de Problemas

### ❌ Error: "No se encontró el archivo"

```
❌ Error: No se encontró el archivo: comercial - Hoja 1.csv
```

**Solución:**
- Verifica que el archivo esté en la raíz del proyecto
- Verifica que el nombre sea exactamente: `comercial - Hoja 1.csv`
- Verifica que tenga extensión `.csv`

---

### ❌ Error: "Error al parsear el CSV"

```
❌ Error al parsear el CSV: Invalid Record Length...
```

**Solución:**
- Abre el CSV en un editor de texto (no Excel)
- Verifica que tenga las columnas correctas
- Verifica que no haya comas extra en los datos
- Guarda como CSV UTF-8

---

### ❌ Error: "Falta el título" o "Falta la URL"

```
❌ Fila 25: Falta el título
❌ Fila 30: Falta la URL del archivo
```

**Solución:**
- Abre el CSV y ve a la fila indicada
- Completa los campos obligatorios: titulo, tipo, archivoUrl
- Guarda y vuelve a ejecutar

---

### ⚠️ Advertencia: "Carpeta no encontrada"

```
⚠️ Fila 42: Carpeta no encontrada, se guardará en la raíz
```

**Causa:**
- La ruta especificada en `carpetaRuta` no existe
- Puede ser un error de tipeo en la ruta

**Solución:**
- Si quieres que esté en la raíz: ignora la advertencia
- Si quieres que esté en una carpeta:
  1. Verifica la ruta en el CSV (fila 42)
  2. Verifica que el Paso 3 haya creado esa carpeta
  3. Corrige la ruta y vuelve a ejecutar solo el Paso 4

---

### ❌ Error: "AUTOR_ID no existe"

```
❌ Error: El AUTOR_ID especificado no existe en la base de datos
```

**Solución:**
1. Ve a Firebase Console → Firestore Database
2. Colección `usuarios` → busca un usuario con rol exclusivo
3. Copia su ID
4. Edita [scripts/import-materiales-from-comercial.js:24](scripts/import-materiales-from-comercial.js#L24)
5. Reemplaza el AUTOR_ID con el ID correcto

---

## 📝 Ejemplo de CSV Válido

```csv
titulo,descripcion,tipo,carrera,anio,ramo,tags,archivoUrl,carpetaRuta,profesor,semestre
Resumen Límites,Resumen completo del capítulo 2,PDF,Ingeniería Civil,1,Cálculo I,limites,https://drive.google.com/file/d/ABC123/view,Primer Año/Matemáticas/Cálculo I,Dr. Juan Pérez,2024-1
Guía Derivadas,Ejercicios resueltos,PDF,Ingeniería Civil,1,Cálculo I,derivadas,https://drive.google.com/file/d/XYZ789/view,Primer Año/Matemáticas/Cálculo I,Dr. Juan Pérez,2024-1
Apuntes Vectores,,PDF,,,,,https://drive.google.com/file/d/DEF456/view,Primer Año/Física,,
```

**Notas del ejemplo:**
- Fila 2 y 3: Tienen todos los campos completos
- Fila 4: Tiene solo los campos obligatorios (titulo, tipo, archivoUrl, carpetaRuta)

---

## 🎯 Comandos Útiles

```bash
# Ver el estado de las carpetas creadas
npm run folders:status

# Limpiar la colección de materiales (¡cuidado!)
npm run clean:materiales

# Validar un CSV antes de importar
npm run validate:csv

# Ver los logs de Firestore
npm run test:firestore
```

---

## 📚 Archivos Relacionados

- [scripts/create-folders-from-comercial.js](scripts/create-folders-from-comercial.js) - Script de creación de carpetas
- [scripts/import-materiales-from-comercial.js](scripts/import-materiales-from-comercial.js) - Script de importación
- [package.json](package.json) - Configuración de comandos npm
- [COMO_FUNCIONA_UPLOAD_DRIVE.md](COMO_FUNCIONA_UPLOAD_DRIVE.md) - Cómo funciona la subida a Drive

---

## ✅ Checklist de Importación

Usa esta lista para verificar que todo esté listo:

- [ ] Tengo el archivo `comercial - Hoja 1.csv` en la raíz del proyecto
- [ ] Tengo el archivo `serviceAccountKey.json` en la raíz del proyecto
- [ ] El CSV tiene las columnas correctas (titulo, tipo, archivoUrl son obligatorias)
- [ ] Ejecuté: `npm run comercial:create-folders`
- [ ] Vi el resumen de carpetas creadas sin errores
- [ ] Ejecuté: `npm run comercial:import`
- [ ] Vi el resumen de importación sin errores
- [ ] Verifiqué en la aplicación web que las carpetas existen
- [ ] Verifiqué que los materiales están en sus carpetas
- [ ] Probé que los enlaces de Drive funcionan

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún problema:

1. **Revisa los mensajes de error en la consola**
2. **Busca el error en la sección "Solución de Problemas"**
3. **Verifica el checklist de arriba**
4. **Revisa los archivos en Firebase Console**

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tus materiales estarán importados y listos para usar en la aplicación.

**Próximos pasos sugeridos:**
- Crear subcarpetas adicionales si es necesario
- Organizar los materiales por semestre/año
- Añadir más metadata a los materiales (tags, descripciones, etc.)
- Integrar con Google Drive para nuevas subidas (ver [COMO_FUNCIONA_UPLOAD_DRIVE.md](COMO_FUNCIONA_UPLOAD_DRIVE.md))
