# Guía de Migración a Google Drive

Esta guía te ayudará a migrar tus carpetas de Firestore a Google Drive automáticamente.

---

## 📋 Antes de Empezar

### Requisitos:

1. ✅ Archivo de credenciales en la raíz del proyecto:
   ```
   coherent-flame-475215-f0-4fff3af9eaec.json
   ```

2. ✅ Dependencias instaladas:
   ```bash
   npm install
   ```

---

## 🎯 Escenarios de Migración

Hay **3 escenarios** posibles. Elige el que corresponda a tu situación:

### Escenario 1: Ya tienes las carpetas en Google Drive ✨

**Situación:** Tus carpetas ya existen en Google Drive con los mismos nombres que en Firestore.

**Script a usar:** `migrate-folders-to-drive.js`

**Qué hace:**
- ✅ Busca cada carpeta de Firestore en Google Drive (por nombre)
- ✅ Agrega el campo `googleDriveFolderId` a Firestore
- ✅ Comparte automáticamente con el bot
- ✅ Respeta la jerarquía de carpetas

**Comando:**
```bash
npm run folders:migrate
```

---

### Escenario 2: No tienes las carpetas en Drive 🏗️

**Situación:** Las carpetas solo existen en Firestore y quieres crearlas automáticamente en Drive.

**Script a usar:** `create-drive-folders-from-firestore.js`

**Qué hace:**
- ✅ Crea todas las carpetas en Google Drive
- ✅ Mantiene la jerarquía (padre → hijo)
- ✅ Comparte automáticamente con el bot
- ✅ Actualiza Firestore con los IDs

**Comando:**
```bash
npm run folders:create-drive
```

---

### Escenario 3: Situación mixta 🔄

**Situación:** Algunas carpetas ya existen en Drive, otras no.

**Solución:** Ejecutar primero el Escenario 1, luego revisar y ejecutar el Escenario 2 si es necesario.

---

## 📊 Revisar Estado Actual

Antes de migrar, revisa qué carpetas ya tienen `googleDriveFolderId`:

```bash
npm run folders:status
```

**Salida esperada:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ESTADO DE CARPETAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total de carpetas: 150

✅ Con Google Drive ID: 75
⚠️  Sin Google Drive ID: 75
```

---

## 🚀 Pasos de Migración

### Paso 1: Revisar Estado

```bash
npm run folders:status
```

Esto te mostrará cuántas carpetas necesitan migrarse.

---

### Paso 2A: Migrar Carpetas Existentes (Escenario 1)

Si tus carpetas YA existen en Google Drive:

```bash
npm run folders:migrate
```

**Output esperado:**
```
🚀 INICIANDO MIGRACIÓN DE CARPETAS

📂 Obteniendo carpetas de Firestore...
   Encontradas 150 carpetas en Firestore

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 PROCESANDO CARPETAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/150] 📁 Ingeniería Civil / Cálculo I
   🔍 Buscando en Google Drive...
   ✓ Encontrada: 1ABC123XYZ456
   🔗 Compartiendo con el bot...
   ✓ Compartida exitosamente
   💾 Actualizando Firestore...
   ✅ Migración exitosa

[2/150] 📁 Ingeniería Civil / Física II
   🔍 Buscando en Google Drive...
   ✓ Encontrada: 1DEF456UVW789
   🔗 Compartiendo con el bot...
   ✓ Compartida exitosamente
   💾 Actualizando Firestore...
   ✅ Migración exitosa

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMEN DE MIGRACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total procesadas:        150
✅ Migradas exitosamente: 145
ℹ️  Ya tenían Drive ID:    0
⚠️  No encontradas:        5
❌ Errores:               0

🎉 Migración completada!
```

---

### Paso 2B: Crear Carpetas Nuevas (Escenario 2)

Si necesitas CREAR las carpetas en Google Drive:

```bash
npm run folders:create-drive
```

**⚠️ IMPORTANTE:** Por defecto, las carpetas se crean en la raíz de "My Drive" del Service Account.

**Para crear en una carpeta específica:**

1. Abre [scripts/create-drive-folders-from-firestore.js](scripts/create-drive-folders-from-firestore.js)
2. Encuentra la línea:
   ```javascript
   const ROOT_FOLDER_ID = null;
   ```
3. Cámbiala por el ID de tu carpeta raíz:
   ```javascript
   const ROOT_FOLDER_ID = '1ABC123XYZ456'; // ID de tu carpeta en Drive
   ```

**Output esperado:**
```
🏗️  CREANDO ESTRUCTURA EN GOOGLE DRIVE

📂 Obteniendo carpetas de Firestore...
   Encontradas 150 carpetas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 CREANDO CARPETAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/150] 📁 Ingeniería Civil
   🏗️  Creando en Google Drive...
   ✓ Creada: 1ABC123XYZ456
   🔗 Compartiendo con el bot...
   ✓ Compartida
   💾 Actualizando Firestore...
   ✅ Completado

[2/150] 📁 Ingeniería Civil / Cálculo I
   🏗️  Creando en Google Drive...
   ✓ Creada: 1DEF456UVW789
   🔗 Compartiendo con el bot...
   ✓ Compartida
   💾 Actualizando Firestore...
   ✅ Completado

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total procesadas:    150
✅ Creadas:           150
ℹ️  Ya existían:       0
❌ Errores:           0

🎉 Estructura creada exitosamente!
```

---

### Paso 3: Verificar Resultados

Vuelve a revisar el estado:

```bash
npm run folders:status
```

Deberías ver:
```
✅ Con Google Drive ID: 150
⚠️  Sin Google Drive ID: 0
```

---

## 🔧 Troubleshooting

### Error: "Permission denied"

**Causa:** El Service Account no tiene permisos en las carpetas.

**Solución:** Los scripts comparten automáticamente. Si falla, comparte manualmente:
1. Abre la carpeta en Google Drive
2. Click derecho → Compartir
3. Agrega: `bot-subida-drive@coherent-flame-475215-f0.iam.gserviceaccount.com`
4. Permiso: **Editor**

---

### Error: "Folder not found"

**Causa:** La carpeta no existe en Google Drive o el nombre no coincide exactamente.

**Solución:**
1. Verifica que el nombre en Drive coincide EXACTAMENTE con Firestore (mayúsculas, espacios, etc.)
2. O usa el script de **Escenario 2** para crear las carpetas automáticamente

---

### Algunas carpetas no se migran

**Causa:** Pueden tener caracteres especiales o nombres problemáticos.

**Solución:**
1. Revisa el output del script para ver cuáles fallaron
2. Migra manualmente esas carpetas:
   - Obtén el ID de la carpeta en Drive
   - Ve a Firebase Console → Firestore → `folders`
   - Edita el documento y agrega:
     ```
     googleDriveFolderId: "1ABC123XYZ456"
     ```

---

### Script se queda "colgado"

**Causa:** Límites de rate limit de Google Drive API.

**Solución:** El script procesa carpetas secuencialmente para evitar esto, pero si tienes MUCHAS carpetas (500+):
1. Detén el script (Ctrl+C)
2. Espera 1 minuto
3. Vuelve a ejecutar (ya no procesará las que tengan `googleDriveFolderId`)

---

## 📝 Cómo Funcionan los Scripts

### migrate-folders-to-drive.js

```javascript
Para cada carpeta en Firestore:
  1. Si ya tiene googleDriveFolderId → Skip
  2. Buscar carpeta en Drive por nombre
  3. Si encuentra:
     - Compartir con bot
     - Guardar ID en Firestore
  4. Si no encuentra:
     - Reportar como "no encontrada"
```

### create-drive-folders-from-firestore.js

```javascript
Para cada carpeta en Firestore (ordenadas por nivel):
  1. Si ya tiene googleDriveFolderId → Skip
  2. Determinar carpeta padre en Drive
  3. Crear nueva carpeta
  4. Compartir con bot
  5. Guardar ID en Firestore
```

---

## 🎯 Después de la Migración

Una vez completada la migración:

1. ✅ **Verifica en la app:**
   - Ve a la sección Material
   - Intenta subir un archivo en una carpeta
   - Debería usar Google Drive automáticamente

2. ✅ **Revisa los logs del navegador:**
   ```
   🚀 Usando Google Drive para subir archivo
   📤 Subiendo archivo a Google Drive: documento.pdf
   ✅ Archivo subido exitosamente: https://drive.google.com/...
   ```

3. ✅ **Verifica en Google Drive:**
   - El archivo debe aparecer en la carpeta correcta
   - Debe estar compartido públicamente (Anyone with the link)

---

## 💡 Tips y Mejores Prácticas

### 1. Haz una prueba primero

Antes de migrar todo, prueba con una carpeta:

```javascript
// En migrate-folders-to-drive.js, después de línea 173
const carpetas = carpetasSnapshot.docs
  .map(doc => ({id: doc.id, ...doc.data()}))
  .slice(0, 5); // Solo las primeras 5
```

### 2. Backup de Firestore

Antes de ejecutar los scripts, haz un backup:
1. Firebase Console → Firestore Database
2. Exportar/importar datos

### 3. Organiza en Drive primero

Si usas **Escenario 1**, organiza bien tus carpetas en Drive antes:
- Nombres exactos
- Jerarquía clara
- Sin duplicados

### 4. Monitorea el proceso

Los scripts son verbosos (muestran TODO). Útil para:
- Detectar problemas
- Verificar progreso
- Debug

---

## 📞 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run folders:status` | Ver estado de carpetas |
| `npm run folders:migrate` | Migrar carpetas existentes |
| `npm run folders:create-drive` | Crear carpetas nuevas |

---

## ⚠️ Limitaciones

1. **Google Drive API Quota:**
   - 1,000 requests por 100 segundos por usuario
   - Los scripts están diseñados para no exceder esto

2. **Nombres de carpetas:**
   - Deben coincidir EXACTAMENTE (case-sensitive)
   - Evita caracteres especiales raros

3. **Jerarquía:**
   - Se procesa de arriba hacia abajo (padres antes que hijos)
   - Si falla un padre, los hijos se saltarán

---

## 🎉 ¿Todo listo?

Si todo salió bien:

✅ Todas las carpetas tienen `googleDriveFolderId`
✅ Están compartidas con el bot
✅ Los archivos nuevos se suben a Drive automáticamente
✅ La app funciona perfectamente

**¡Felicitaciones! 🎊**

Ahora configura la variable de entorno en Vercel y haz deploy:
- Ver [INSTRUCCIONES_BACKEND_UPLOAD.md](INSTRUCCIONES_BACKEND_UPLOAD.md)
