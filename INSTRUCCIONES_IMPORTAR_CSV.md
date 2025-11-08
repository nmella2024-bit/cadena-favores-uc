# Guía Completa: Importar 4000 Materiales desde Google Sheets

Esta guía te llevará paso a paso para importar todos tus materiales desde un archivo CSV de Google Sheets a Firestore.

⏱️ **Tiempo estimado:** 30-40 minutos (configuración) + 2-5 minutos (importación)

---

## 📋 FASE 1: Preparar el CSV (10 minutos)

### 1.1 Formato Requerido

Tu Google Sheet **DEBE** tener estas columnas (en este orden):

| Columna | Obligatoria | Descripción | Ejemplo |
|---------|------------|-------------|---------|
| `titulo` | ✅ Sí | Título del material | "Resumen Cálculo I - Primer Parcial" |
| `descripcion` | ❌ No | Descripción breve | "Resumen de los capítulos 1 al 5" |
| `tipo` | ✅ Sí | Tipo de archivo | "PDF", "Word", "PowerPoint", "Excel", "Otro" |
| `carrera` | ❌ No | Carrera asociada | "Ingeniería Civil", "Medicina", etc. |
| `anio` | ❌ No | Año académico | 1, 2, 3, 4, 5 |
| `ramo` | ❌ No | Nombre del ramo | "Cálculo I", "Física General", etc. |
| `tags` | ❌ No | Etiquetas separadas por comas | "calculo,matematicas,parcial" |
| `archivoUrl` | ✅ Sí | URL de Google Drive | "https://drive.google.com/file/d/1ABC..." |
| `carpetaRuta` | ❌ No | Ruta de la carpeta | "1° Semestre/Ingeniería Civil/Cálculo I" |
| `profesor` | ❌ No | Nombre del profesor | "Dr. Juan Pérez" |
| `semestre` | ❌ No | Semestre | "2024-1", "2023-2" |

### 1.2 Ejemplo de Datos

```csv
titulo,descripcion,tipo,carrera,anio,ramo,tags,archivoUrl,carpetaRuta,profesor,semestre
Resumen Cálculo I,Resumen completo del primer parcial,PDF,Ingeniería Civil,1,Cálculo I,calculo;matematicas;parcial,https://drive.google.com/file/d/1ABC123DEF456/view,1° Semestre/Ingeniería Civil/Cálculo I,Dr. Juan Pérez,2024-1
Guía Física General,Ejercicios resueltos de cinemática,PDF,Ingeniería Civil,1,Física I,fisica;cinematica;ejercicios,https://drive.google.com/file/d/1XYZ789GHI012/view,1° Semestre/Ingeniería Civil/Física I,Dra. María López,2024-1
```

### 1.3 ⚠️ Notas Importantes sobre URLs de Google Drive

Si tus URLs están en formato de Google Drive, asegúrate de que sean **compartidas públicamente**:

1. **URL Original (de Google Sheets):**
   ```
   https://drive.google.com/file/d/1ABC123DEF456GHI789/view?usp=sharing
   ```

2. **URL que necesitas (sin cambios):**
   ```
   https://drive.google.com/file/d/1ABC123DEF456GHI789/view
   ```

3. **Hacer el archivo público:**
   - Click derecho en el archivo → "Compartir"
   - "Cualquier persona con el enlace"
   - Permisos: "Lector"

### 1.4 Exportar a CSV

1. Abre tu Google Sheet
2. Ve a: **Archivo → Descargar → Valores separados por comas (.csv)**
3. Guarda el archivo como: `materiales.csv`
4. Coloca el archivo en la raíz de tu proyecto:
   ```
   c:\Users\nmell\cadena-favores-uc\materiales.csv
   ```

---

## 🔐 FASE 2: Obtener Credenciales de Firebase (15 minutos)

### 2.1 Descargar Service Account Key

1. **Abre Firebase Console:**
   ```
   https://console.firebase.google.com/project/red-uc-eeuu/settings/serviceaccounts/adminsdk
   ```

2. **Click en la pestaña "Cuentas de servicio"**

3. **Scroll hasta abajo** y verás un botón:
   ```
   "Generar nueva clave privada"
   ```

4. **Click en el botón** y confirma

5. Se descargará un archivo JSON con un nombre largo como:
   ```
   red-uc-eeuu-firebase-adminsdk-abc123-def456789.json
   ```

6. **Renombra el archivo** a:
   ```
   serviceAccountKey.json
   ```

7. **Mueve el archivo** a la raíz del proyecto:
   ```
   c:\Users\nmell\cadena-favores-uc\serviceAccountKey.json
   ```

### 2.2 ⚠️ SEGURIDAD IMPORTANTE

Este archivo contiene credenciales sensibles. **NUNCA** lo compartas ni lo subas a Git.

Ya está protegido en el `.gitignore`, pero verifica:

```bash
# Verifica que NO aparezca en git status
git status
```

Si aparece `serviceAccountKey.json`, **NO HAGAS COMMIT**. Asegúrate de que esté en `.gitignore`.

---

## 👤 FASE 3: Obtener tu User ID (5 minutos)

El script necesita saber qué usuario será el "autor" de todos los materiales importados.

### Opción A: Desde la Aplicación (MÁS FÁCIL) ⭐ RECOMENDADO

1. **Inicia sesión** en tu aplicación: `http://localhost:5173`

2. **Ve a la sección Material:** `http://localhost:5173/material`

3. **Verás una tarjeta azul** en la esquina inferior derecha que dice "Tu User ID (para el script)"

4. **Click en "Copiar User ID"** y listo!

   ![Screenshot mostrando el componente MostrarUserID](screenshot-aqui)

5. **Pégalo directamente** en el script (siguiente paso)

> **Nota:** Este componente es temporal y se eliminará después de obtener el ID.

### Opción B: Desde Firebase Console

1. Ve a:
   ```
   https://console.firebase.google.com/project/red-uc-eeuu/firestore/data/usuarios
   ```

2. Click en **tu documento de usuario** (busca por tu email)

3. Copia el **ID del documento** que aparece arriba
   - Está justo después de "usuarios/" en la URL
   - Se ve como: `ABC123def456GHI789xyz`

Ejemplo visual:
```
Firestore > usuarios > ABC123def456GHI789xyz
                       ↑
                       Este es tu User ID
```

### 3.1 Actualizar el Script

Abre el archivo: `scripts/import-materiales-from-csv.js`

Busca la línea 21:
```javascript
const AUTOR_ID = 'TU_USER_ID_AQUI'; // ⚠️ CAMBIAR ESTO
```

Reemplázala con tu ID:
```javascript
const AUTOR_ID = 'ABC123DEF456GHI789'; // Tu ID real
```

También puedes cambiar el nombre del autor (línea 22):
```javascript
const AUTOR_NOMBRE = 'Equipo Material UC'; // Como quieras que aparezca
```

---

## 📦 FASE 4: Instalar Dependencias (5 minutos)

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install firebase-admin csv-parse
```

Esto instalará:
- `firebase-admin`: SDK de Firebase para Node.js
- `csv-parse`: Librería para parsear archivos CSV

---

## 🚀 FASE 5: Ejecutar la Importación (2-5 minutos)

### 5.1 Verificación Previa

Antes de ejecutar, verifica que tienes estos archivos:

```
c:\Users\nmell\cadena-favores-uc\
├── materiales.csv ✅
├── serviceAccountKey.json ✅
└── scripts/
    └── import-materiales-from-csv.js ✅
```

### 5.2 Ejecutar el Script

```bash
npm run import:materiales
```

### 5.3 ¿Qué Verás?

El script mostrará algo como esto:

```
=================================================
  IMPORTACIÓN MASIVA DE MATERIALES DESDE CSV
=================================================

✅ Firebase Admin inicializado correctamente

📖 Leyendo archivo CSV...
✅ CSV parseado correctamente: 4000 registros encontrados

🔍 Validando registros...
✅ Todos los registros son válidos

✅ Autor verificado: Tu Nombre

📥 Iniciando importación...

   ✓ Procesados 500/4000 materiales...
   ✓ Procesados 1000/4000 materiales...
   ✓ Procesados 1500/4000 materiales...
   ✓ Procesados 2000/4000 materiales...
   ✓ Procesados 2500/4000 materiales...
   ✓ Procesados 3000/4000 materiales...
   ✓ Procesados 3500/4000 materiales...
   ✓ Procesados 4000/4000 materiales...

=================================================
  RESUMEN DE IMPORTACIÓN
=================================================
Total de registros:    4000
✅ Importados:         3987
❌ Fallidos:           0
⚠️  Advertencias:       13
=================================================

🎉 ¡Importación completada exitosamente!

✅ Script finalizado
```

### 5.4 Interpretando el Resultado

- **✅ Importados:** Materiales agregados exitosamente
- **❌ Fallidos:** Errores críticos (título vacío, URL vacía, etc.)
- **⚠️ Advertencias:** Carpeta no encontrada (se guarda en raíz)

---

## ✅ FASE 6: Verificar la Importación (5 minutos)

### 6.1 Verificar en Firebase Console

1. Ve a:
   ```
   https://console.firebase.google.com/project/red-uc-eeuu/firestore/data/material
   ```

2. Deberías ver ~4000 documentos

3. Click en algunos para verificar que los datos sean correctos

### 6.2 Verificar en la Aplicación

1. Ve a: `http://localhost:5173/material`

2. Navega por las carpetas

3. Verifica que los materiales aparezcan en sus carpetas correspondientes

4. Prueba descargar algunos archivos

---

## 🐛 Troubleshooting (Solución de Problemas)

### Error: "No se encontró el archivo materiales.csv"

**Solución:**
- Verifica que el archivo esté en la raíz del proyecto
- Verifica que se llame exactamente `materiales.csv` (sin espacios ni mayúsculas)

### Error: "Missing or insufficient permissions"

**Causa:** Service Account Key incorrecto o no configurado

**Solución:**
1. Verifica que `serviceAccountKey.json` esté en la raíz
2. Verifica que sea el archivo correcto de tu proyecto Firebase
3. Descarga nuevamente desde Firebase Console

### Error: "El AUTOR_ID especificado no existe"

**Solución:**
1. Verifica que copiaste el ID correcto
2. Verifica que el usuario exista en Firestore (colección `usuarios`)
3. Usa un usuario con rol `exclusivo` si es posible

### Error: "CSV parsing failed"

**Causa:** Formato del CSV incorrecto

**Solución:**
1. Abre `materiales.csv` en un editor de texto
2. Verifica que la primera línea sea el header con los nombres de columnas
3. Verifica que no haya caracteres extraños
4. Exporta nuevamente desde Google Sheets

### Advertencias: "Carpeta no encontrada"

**Causa:** La ruta en `carpetaRuta` no existe en Firestore

**Solución:**
1. Verifica que las carpetas existan en `/material`
2. Verifica que los nombres coincidan exactamente (mayúsculas, acentos, espacios)
3. Los materiales se guardarán en la raíz, puedes moverlos después

### Importación Muy Lenta

**Causa:** Problemas de red o conexión lenta

**Solución:**
- El script usa batches de 500, debería ser rápido
- Si tarda más de 10 minutos, presiona Ctrl+C y vuelve a ejecutar
- Los materiales ya importados no se duplicarán

---

## 📊 ¿Qué Hace el Script Internamente?

1. **Lee el CSV** y parsea cada fila
2. **Valida** que tengan título, URL y tipo
3. **Busca la carpeta** por su ruta completa
4. **Crea el documento** en Firestore con todos los campos
5. **Usa batches** de 500 para optimizar la velocidad
6. **Muestra progreso** cada 500 materiales
7. **Genera un resumen** al final

---

## 🔄 ¿Puedo Ejecutarlo Varias Veces?

**Sí, PERO:**
- No verifica duplicados
- Si lo ejecutas 2 veces, tendrás los materiales duplicados

**Para evitar duplicados:**
1. Exporta los materiales actuales de Firestore
2. Elimina la colección `material` completa
3. Ejecuta el script nuevamente

O usa este script para limpiar antes de importar:

```bash
# Crear un script para limpiar (opcional)
node scripts/clean-material-collection.js
```

---

## 📝 Campos Adicionales en el CSV

Puedes agregar estos campos opcionales al CSV:

- `vistas`: Número de vistas (default: 0)
- `descargas`: Número de descargas (default: 0)
- `calificacion`: Calificación promedio (default: 0)
- `comentarios`: Número de comentarios (default: 0)

Solo agrégalos como columnas y el script los incluirá automáticamente.

---

## 🎯 Resumen de Comandos

```bash
# 1. Instalar dependencias
npm install firebase-admin csv-parse

# 2. Ejecutar importación
npm run import:materiales

# 3. Verificar en la app
npm run dev
# Ir a http://localhost:5173/material
```

---

## 📞 Soporte

Si tienes problemas:

1. Revisa el log del script (tiene mensajes detallados)
2. Verifica los archivos CSV y serviceAccountKey.json
3. Consulta la sección de Troubleshooting arriba
4. Revisa la consola de Firebase para ver si hay errores de reglas

---

¡Listo! Con esto deberías poder importar tus 4000 materiales sin problemas. 🎉
