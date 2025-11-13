# Guía de Seguridad - Red UC

## Información Importante sobre Credenciales de Firebase

### Credenciales Públicas (Cliente Web)

Las credenciales de Firebase para aplicaciones web (apiKey, authDomain, etc.) **NO son secretas** por diseño:

- ✅ **Están diseñadas para ser públicas** - Se incluyen en el código JavaScript del frontend
- ✅ **Son seguras de compartir** - Firebase las considera públicas
- ✅ **La seguridad se maneja con:**
  - Reglas de Firestore (`firestore.rules`)
  - Reglas de Storage (`storage.rules`)
  - Firebase Authentication

### Credenciales Privadas (NUNCA Compartir)

❌ **NUNCA expongas estos archivos:**
- `serviceAccountKey.json` - Claves de cuenta de servicio
- `.env` con API keys de terceros
- Tokens de acceso personal
- Claves privadas de APIs externas

## Archivos Protegidos en `.gitignore`

Los siguientes archivos están protegidos y **NO deben ser committed al repositorio:**

```
# Variables de entorno
.env
.env.local
.env.*.local

# Service Account Keys
serviceAccountKey.json
coherent-flame-*.json

# Archivos temporales
*.tmp
*.local.json
```

## Configuración de Variables de Entorno

### 1. Desarrollo Local

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Luego edita `.env` con tus credenciales reales:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# ... resto de credenciales
```

### 2. Producción (Vercel)

Configura las variables de entorno en:
- Dashboard de Vercel > Settings > Environment Variables
- Consulta [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) para instrucciones detalladas

## Uso en Scripts

Los scripts en `/scripts/` ahora usan variables de entorno:

```javascript
require('dotenv').config(); // CommonJS
// o
import dotenv from 'dotenv'; // ES Modules
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  // ...
};
```

## Reglas de Seguridad de Firebase

### Firestore Rules

Revisa y mantén actualizadas las reglas en `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Ejemplo: Solo usuarios autenticados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rules

Revisa y mantén actualizadas las reglas en `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Ejemplo: Solo usuarios autenticados pueden subir
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Checklist de Seguridad

Antes de hacer commit o deploy:

- [ ] Verificar que `.env` está en `.gitignore`
- [ ] Verificar que `serviceAccountKey.json` está en `.gitignore`
- [ ] No hay credenciales hardcoded en el código
- [ ] Las reglas de Firestore están actualizadas
- [ ] Las reglas de Storage están actualizadas
- [ ] Variables de entorno configuradas en Vercel
- [ ] Service Account Keys solo en entornos seguros (Cloud Functions)

## Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad:

1. **NO** la publiques públicamente
2. Contacta al equipo de desarrollo
3. Proporciona detalles de la vulnerabilidad
4. Espera respuesta antes de divulgar

## Recursos

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
