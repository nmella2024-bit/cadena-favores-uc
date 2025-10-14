# 🔒 Guía de Seguridad - Red UC

## ⚠️ Archivos que NUNCA deben subirse a GitHub

### 1. Variables de Entorno (`.env`)
- ✅ **Incluido en `.gitignore`**
- Contiene credenciales de Firebase
- Si se filtra, cualquiera puede acceder a tu base de datos

### 2. Configuraciones Locales
- ✅ `.claude/` - Configuración personal de Claude Code
- ✅ `dataconnect/` - Configuraciones locales de Firebase
- ✅ `codebase1/` - Carpetas temporales generadas
- ✅ `node_modules/` - Dependencias (se pueden reinstalar)

### 3. Archivos Temporales
- ✅ `*.tmp`, `*.temp`, `*.local.json`
- ✅ `nul` - Archivo temporal de Windows

### 4. Configuraciones de Firebase
- ✅ `.firebaserc` - Configuración local del proyecto
- ✅ `firebase-debug.log*` - Logs de depuración

## 🛡️ Mejores Prácticas Implementadas

### 1. `.gitignore` Actualizado
Hemos configurado el archivo [.gitignore](.gitignore) para proteger:
- Variables de entorno
- Configuraciones locales
- Archivos temporales
- Logs y cache
- Credenciales de Firebase

### 2. Plantilla de Variables de Entorno
Creamos [.env.example](.env.example) que:
- ✅ Muestra qué variables se necesitan
- ✅ NO contiene valores reales
- ✅ Sirve de documentación para otros desarrolladores

### 3. Reglas de Seguridad de Firestore
En [firestore.rules](firestore.rules):
- ✅ Validación de permisos por usuario
- ✅ Solo el creador puede editar/eliminar sus favores
- ✅ Solo usuarios autenticados pueden crear favores
- ✅ Lectura pública de favores (para mostrar en la página)

## 🔐 Cómo Proteger tus Credenciales

### Opción 1: Usar Variables de Entorno (Recomendado)

1. Crea un archivo `.env` en la raíz del proyecto:
```bash
cp .env.example .env
```

2. Completa con tus credenciales reales:
```env
VITE_FIREBASE_API_KEY=AIzaSy...tu_api_key_real
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
# ... etc
```

3. Actualiza [src/firebaseConfig.js](src/firebaseConfig.js):
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

### Opción 2: Mantener Credenciales en el Código
Si decides mantener las credenciales en `firebaseConfig.js`:

**Importante:**
- ⚠️ No las compartas públicamente
- ⚠️ Configura restricciones de API en Firebase Console
- ⚠️ Las reglas de Firestore son tu principal protección

**Restricciones de API recomendadas:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. API y servicios > Credenciales
4. Edita la API Key
5. Restringe por:
   - **Sitios web:** `localhost:*`, `tu-dominio.com`
   - **APIs permitidas:** Firebase Authentication, Firestore

## 🚨 Qué Hacer si Filtras tus Credenciales

### 1. Regenera la API Key
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Configuración del proyecto > Cuentas de servicio
3. Genera una nueva clave

### 2. Actualiza las Restricciones
Configura restricciones de dominio inmediatamente

### 3. Revoca Accesos Sospechosos
Revisa los logs de Firebase para detectar accesos no autorizados

### 4. Limpia el Historial de Git
```bash
# CUIDADO: Esto reescribe el historial
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

## 📋 Checklist de Seguridad

Antes de hacer push a GitHub, verifica:

- [ ] El archivo `.env` NO está en el repositorio
- [ ] `.gitignore` incluye `.env`
- [ ] Las credenciales NO están hardcodeadas en el código
- [ ] `.env.example` solo tiene placeholders
- [ ] Las reglas de Firestore están desplegadas
- [ ] Las restricciones de API están configuradas
- [ ] No hay `console.log()` con datos sensibles
- [ ] Los logs de Firebase están en `.gitignore`

## 🔍 Revisar Archivos Antes de Commit

Revisa qué archivos estás por subir:
```bash
git status
git diff
```

Revisa el staging area:
```bash
git diff --staged
```

Si accidentalmente agregaste `.env`:
```bash
git reset HEAD .env
```

## 🌐 Seguridad en Producción

### 1. Variables de Entorno en Hosting
Cuando despliegues a producción (Vercel, Netlify, etc.):

**Vercel:**
```bash
vercel env add VITE_FIREBASE_API_KEY
```

**Netlify:**
Site settings > Build & deploy > Environment variables

### 2. Restricciones de Dominio
Configura tu dominio de producción en las restricciones de Firebase API

### 3. HTTPS Obligatorio
- ✅ Firebase Auth requiere HTTPS en producción
- ✅ Usa servicios como Vercel o Netlify que lo incluyen

## 📖 Referencias

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Secure Firebase API Keys](https://firebase.google.com/docs/projects/api-keys)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)

## 🆘 Contacto

Si detectas algún problema de seguridad:
1. NO lo publiques públicamente
2. Contacta al equipo directamente
3. Documenta el problema en privado

---

**Recuerda:** La seguridad es responsabilidad de todos. ¡Mantén tus credenciales seguras!
