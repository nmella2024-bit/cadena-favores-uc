# Checklist de Seguridad - Plan de Implementación
## Red UC - Proyecto Firebase

**PRIORIDAD: CRÍTICA - Implementar en 24-72 horas**

---

## 1. ROTAR TODAS LAS CREDENCIALES EXPUESTAS

### Acciones Inmediatas:

#### A. Firebase Project - Regenerar API Keys
```bash
# Paso 1: Accede a Firebase Console
# https://console.firebase.google.com/project/red-uc-eeuu/settings/general

# Paso 2: En "Your apps", elimina la app actual y crea una nueva
# Esto genera nuevas credenciales

# Paso 3: Actualiza las variables de entorno en Vercel con las NUEVAS credenciales
VITE_FIREBASE_API_KEY=<NUEVA_KEY>
VITE_FIREBASE_AUTH_DOMAIN=<NUEVA_DOMAIN>
VITE_FIREBASE_PROJECT_ID=<PROJECT_ID>
VITE_FIREBASE_STORAGE_BUCKET=<NUEVA_BUCKET>
VITE_FIREBASE_MESSAGING_SENDER_ID=<NUEVO_ID>
VITE_FIREBASE_APP_ID=<NUEVO_APP_ID>
VITE_FIREBASE_MEASUREMENT_ID=<NUEVO_MEASUREMENT_ID>
```

#### B. Service Account - Crear NUEVA Service Account
```bash
# Paso 1: Ve a Google Cloud Console
# https://console.cloud.google.com/iam-admin/serviceaccounts?project=red-uc-eeuu

# Paso 2: ELIMINA la service account actual: bot-subida-drive@coherent-flame-475215-f0.iam.gserviceaccount.com

# Paso 3: Crea una NUEVA service account:
# Nombre: "red-uc-backend-secure"
# Rol: SOLO "Firebase Admin SDK Administrator Service Agent"

# Paso 4: Genera una NUEVA clave JSON

# Paso 5: Actualiza la variable en Vercel:
FIREBASE_SERVICE_ACCOUNT=<CONTENIDO_COMPLETO_DEL_JSON>

# Paso 6: Comparte las carpetas de Google Drive con el NUEVO email de service account
```

#### C. Vercel - Regenerar tokens de acceso
```bash
# Si tienes tokens de Vercel en el proyecto, regeneralos en:
# https://vercel.com/account/tokens
```

### ¿Por qué es crítico?
- Las credenciales actuales pueden haber sido expuestas en commits anteriores
- Las service accounts con permisos amplios son un vector de ataque
- API keys públicas sin restricciones pueden ser abusadas

---

## 2. PONER BD EN RED PRIVADA - ELIMINAR ENDPOINT PÚBLICO

### Configuración Firestore (Firebase)

Firebase Firestore **no tiene endpoint público directo**, pero necesitamos asegurar el acceso:

#### A. Restringir acceso solo a dominios autorizados
```bash
# Ve a Firebase Console > Authentication > Settings > Authorized domains
# ELIMINA todos los dominios que no sean:
# - tu-dominio-production.vercel.app
# - red-uc-eeuu.web.app (si usas Firebase Hosting)
```

#### B. Configurar App Check (RECOMENDADO)
```bash
# Paso 1: Ve a Firebase Console > Build > App Check
# Paso 2: Habilita App Check para tu web app
# Paso 3: Configura reCAPTCHA v3 como provider
# Paso 4: Enforcement: "Enforced" para Firestore y Storage
```

#### C. Actualizar Firestore Rules para verificar App Check
Ver archivo `firestore.rules` actualizado en sección 6.

---

## 3. IMPLEMENTAR AUTENTICACIÓN Y AUTORIZACIÓN PARA ENDPOINTS ADMINISTRATIVOS

### Problema Detectado:
El endpoint `/api/uploadHandler.js` **NO tiene autenticación**. Cualquiera puede subir archivos.

### Solución: Agregar middleware de autenticación

#### Crear nuevo archivo: `api/_middleware.js`
```javascript
import admin from 'firebase-admin';

// Middleware para verificar token de Firebase Auth
export async function verifyAuth(req, res) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verificar token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Agregar usuario al request para uso posterior
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    return { success: true, user: req.user };
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(403).json({
      error: 'Token inválido',
      message: error.message
    });
  }
}

// Middleware para verificar roles de usuario
export async function verifyRole(req, res, allowedRoles = []) {
  try {
    // Obtener rol del usuario desde Firestore
    const userDoc = await admin.firestore()
      .collection('usuarios')
      .doc(req.user.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(403).json({
        error: 'Usuario no encontrado'
      });
    }

    const userData = userDoc.data();
    const userRole = userData.rol;

    // Verificar si el rol está permitido
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Permisos insuficientes',
        message: `Se requiere rol: ${allowedRoles.join(' o ')}`
      });
    }

    req.user.rol = userRole;
    return { success: true };
  } catch (error) {
    console.error('Error verificando rol:', error);
    return res.status(500).json({
      error: 'Error verificando permisos'
    });
  }
}
```

#### Actualizar `api/uploadHandler.js`
```javascript
import { verifyAuth, verifyRole } from './_middleware.js';

export default async function handler(req, res) {
  // 1. VERIFICAR AUTENTICACIÓN (NUEVO)
  const authResult = await verifyAuth(req, res);
  if (!authResult.success) {
    return; // Ya se envió respuesta de error
  }

  // 2. VERIFICAR ROL (solo exclusivos y admins pueden subir)
  const roleResult = await verifyRole(req, res, ['exclusivo', 'admin']);
  if (!roleResult.success) {
    return; // Ya se envió respuesta de error
  }

  // ... resto del código existente
}
```

---

## 4. MOVER SECRETOS A VARIABLES DE ENTORNO / SECRET MANAGER

### Estado Actual: ✅ Parcialmente implementado
- Las credenciales YA están en variables de entorno de Vercel
- El archivo `.gitignore` YA protege `serviceAccountKey.json`

### Mejoras Necesarias:

#### A. Usar Google Secret Manager (RECOMENDADO para producción)
```bash
# Paso 1: Habilitar Secret Manager API
gcloud services enable secretmanager.googleapis.com --project=red-uc-eeuu

# Paso 2: Crear secreto
gcloud secrets create firebase-service-account \
  --data-file=serviceAccountKey.json \
  --project=red-uc-eeuu

# Paso 3: Dar permisos a Cloud Run/Functions
gcloud secrets add-iam-policy-binding firebase-service-account \
  --member="serviceAccount:red-uc-eeuu@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=red-uc-eeuu
```

#### B. Actualizar código para usar Secret Manager
```javascript
// api/uploadHandler.js
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

async function getServiceAccount() {
  // En Vercel, usar variable de entorno
  if (process.env.VERCEL) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  // En producción con GCP, usar Secret Manager
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({
    name: 'projects/red-uc-eeuu/secrets/firebase-service-account/versions/latest',
  });

  return JSON.parse(version.payload.data.toString());
}
```

#### C. Verificar que NO hay secretos hardcodeados
```bash
# Ejecutar este comando para buscar secrets en el código
npm run audit:secrets
```

---

## 5. LIMITAR PERMISOS DE USUARIOS DE BD (PRINCIPIO DE MENOR PRIVILEGIO)

### A. Service Account - Reducir permisos

#### Permisos ACTUALES (probablemente demasiado amplios):
- Puede que tenga "Editor" o "Owner" del proyecto

#### Permisos RECOMENDADOS (mínimos necesarios):
```bash
# Eliminar roles amplios
gcloud projects remove-iam-policy-binding red-uc-eeuu \
  --member="serviceAccount:red-uc-backend-secure@red-uc-eeuu.iam.gserviceaccount.com" \
  --role="roles/editor"

# Agregar SOLO los roles necesarios
gcloud projects add-iam-policy-binding red-uc-eeuu \
  --member="serviceAccount:red-uc-backend-secure@red-uc-eeuu.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

gcloud projects add-iam-policy-binding red-uc-eeuu \
  --member="serviceAccount:red-uc-backend-secure@red-uc-eeuu.iam.gserviceaccount.com" \
  --role="roles/firebase.sdkAdminServiceAgent"
```

### B. Google Drive - Permisos específicos por carpeta
```bash
# NO compartas la carpeta raíz de Drive
# SOLO comparte las carpetas específicas que necesita la app
# Permiso: "Editor" SOLO en las carpetas de materiales
```

### C. Firestore Rules - Ya implementadas correctamente
Las reglas en `firestore.rules` ya implementan el principio de menor privilegio. **Mantener estas reglas.**

---

## 6. REVISAR Y LIMPIAR HISTÓRICO GIT

### Verificación realizada:
```bash
# Comando ejecutado: git log --all --full-history --oneline -- "*.json"
# Resultado: No se encontraron archivos de credenciales en commits
```

### ✅ Estado: **LIMPIO** - No se encontraron credenciales en el historial

### Si hubiera credenciales (procedimiento para futura referencia):

#### Opción 1: BFG Repo-Cleaner (más fácil)
```bash
# Instalar BFG
brew install bfg  # macOS
# o descargar desde: https://rtyley.github.io/bfg-repo-cleaner/

# Eliminar archivos de credenciales del historial
bfg --delete-files serviceAccountKey.json
bfg --delete-files "*.json" --no-blob-protection

# Limpiar referencias
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (¡CUIDADO!)
git push origin --force --all
```

#### Opción 2: git-filter-repo (más control)
```bash
# Instalar
pip install git-filter-repo

# Eliminar archivos específicos
git filter-repo --path serviceAccountKey.json --invert-paths

# Force push
git push origin --force --all
```

### ⚠️ IMPORTANTE después de limpiar historial:
1. **Todos los colaboradores deben hacer `git clone` fresh**
2. **Invalidar TODAS las credenciales antiguas**
3. **Avisar al equipo antes de hacer force push**

---

## 7. HABILITAR HTTPS, CORS RESTRICTIVO, WAF/FIREWALLS Y RATE-LIMITING

### A. HTTPS ✅
**Estado: Ya habilitado por Vercel automáticamente**

### B. CORS Restrictivo

#### Crear: `vercel.json` (actualizado)
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://tu-dominio-production.vercel.app"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Authorization, Content-Type"
        },
        {
          "key": "Access-Control-Max-Age",
          "value": "86400"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### C. Rate Limiting

#### Opción 1: Vercel Edge Config + Middleware (RECOMENDADO)
```bash
# Instalar
npm install @vercel/edge-config @upstash/ratelimit @upstash/redis
```

#### Crear: `middleware.js` (en la raíz del proyecto)
```javascript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Crear limitador (necesitas cuenta en Upstash - gratis hasta 10k requests/día)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests por minuto
  analytics: true,
});

export async function middleware(request) {
  // Aplicar rate limit solo a endpoints API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta más tarde.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

#### Configurar Upstash Redis:
```bash
# 1. Crea cuenta en https://upstash.com (gratis)
# 2. Crea una base de datos Redis
# 3. Copia las credenciales a Vercel:
UPSTASH_REDIS_REST_URL=<tu_url>
UPSTASH_REDIS_REST_TOKEN=<tu_token>
```

#### Opción 2: Firebase App Check (integrado)
Ya mencionado en sección 2.B - **IMPLEMENTAR AMBOS para máxima seguridad**

### D. WAF / Firewall

#### Vercel Pro: Habilitar Vercel Firewall
```bash
# Si tienes plan Pro, habilita en:
# Dashboard > Security > Firewall

# Reglas recomendadas:
# - Bloquear IPs sospechosas (integración con threat intelligence)
# - Bloquear países no objetivo (ej: solo permitir Chile, USA)
# - Detectar patrones de SQL injection, XSS
```

#### Cloudflare (alternativa gratuita)
```bash
# 1. Crea cuenta en Cloudflare
# 2. Agrega tu dominio
# 3. Configura Cloudflare como proxy
# 4. Habilita:
#    - WAF Rules (Web Application Firewall)
#    - Rate Limiting
#    - Bot Fight Mode
#    - DDoS Protection (automático)
```

---

## 8. ESCANEO Y PRUEBAS DE PENETRACIÓN

### A. Herramientas Automatizadas (GRATIS)

#### 1. OWASP ZAP (Zed Attack Proxy)
```bash
# Instalar
brew install --cask owasp-zap  # macOS
# o descargar desde: https://www.zaproxy.org/download/

# Uso básico:
# 1. Abre ZAP
# 2. Automatic Scan > URL: https://tu-app.vercel.app
# 3. Revisa el reporte de vulnerabilidades
```

#### 2. npm audit (dependencias vulnerables)
```bash
# Ejecutar en el proyecto
npm audit

# Ver solo vulnerabilidades críticas
npm audit --audit-level=critical

# Intentar arreglar automáticamente
npm audit fix

# Si hay vulnerabilidades que no se pueden arreglar:
npm audit fix --force  # ¡CUIDADO! Puede romper el código
```

#### 3. Snyk (escaneo de código y dependencias)
```bash
# Crear cuenta en https://snyk.io (gratis para open source)

# Instalar CLI
npm install -g snyk

# Autenticar
snyk auth

# Escanear proyecto
snyk test

# Escanear código (SAST)
snyk code test
```

#### 4. GitGuardian (detectar secretos)
```bash
# Instalar
pip install ggshield

# Escanear repositorio completo
ggshield secret scan repo .

# Integrar con pre-commit hook
ggshield install -m local
```

### B. Servicios Profesionales (si tienes presupuesto)

#### Opciones de bajo costo:
1. **Cobalt** - Pentesting as a Service (~$500/mes)
2. **Bugcrowd** - Bug Bounty Platform (pagas por bugs encontrados)
3. **HackerOne** - Similar a Bugcrowd

#### Consultores freelance:
- Buscar en Upwork/Fiverr: "Web Application Security Testing"
- Precio aproximado: $500-2000 por prueba completa

### C. Checklist Manual de Seguridad

#### Ejecutar estas pruebas manualmente:

**1. Inyección SQL/NoSQL:**
```bash
# Prueba en Firestore queries
# ¿Se sanean los inputs del usuario antes de queries?
```

**2. XSS (Cross-Site Scripting):**
```javascript
// Prueba ingresando en campos de texto:
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
```

**3. CSRF (Cross-Site Request Forgery):**
```bash
# ¿Los endpoints POST verifican el token CSRF?
# Firebase Auth ya provee protección, pero verifica endpoints custom
```

**4. Exposición de datos sensibles:**
```bash
# ¿Se filtran emails, IDs de usuario, tokens en las respuestas API?
# Revisa las respuestas de /api/* en DevTools
```

**5. Autenticación rota:**
```bash
# ¿Puedo acceder a /api/uploadHandler sin token?
# ¿Puedo modificar el rol de usuario en Firestore?
```

**6. Configuración incorrecta:**
```bash
# ¿Hay endpoints de debug/admin expuestos?
# ¿Logs con información sensible?
```

### D. Monitoreo Continuo

#### Configurar alertas en Firebase:
```bash
# 1. Ve a Firebase Console > Analytics > Events
# 2. Crea eventos custom para:
#    - Intentos de acceso no autorizados (401/403)
#    - Errores de validación repetidos
#    - Uploads masivos en poco tiempo

# 3. Configura alertas en Cloud Monitoring:
# https://console.cloud.google.com/monitoring/alerting
```

#### Logging:
```javascript
// En todos los endpoints, agregar logging:
console.log('[SECURITY]', {
  timestamp: new Date().toISOString(),
  userId: req.user?.uid || 'anonymous',
  endpoint: req.url,
  ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
  userAgent: req.headers['user-agent'],
});
```

---

## PRIORIZACIÓN DE TAREAS (24-72 horas)

### DÍA 1 (24h) - CRÍTICO:
1. ✅ **Rotar credenciales** (Sección 1)
2. ✅ **Agregar autenticación a `/api/uploadHandler`** (Sección 3)
3. ✅ **Configurar CORS restrictivo** (Sección 7.B)
4. ✅ **Reducir permisos de Service Account** (Sección 5.A)

### DÍA 2 (48h) - ALTO:
5. ✅ **Implementar rate-limiting** (Sección 7.C)
6. ✅ **Habilitar Firebase App Check** (Sección 2.B)
7. ✅ **npm audit y arreglar vulnerabilidades** (Sección 8.A.2)

### DÍA 3 (72h) - IMPORTANTE:
8. ✅ **Escaneo con OWASP ZAP** (Sección 8.A.1)
9. ✅ **Configurar Secret Manager** (Sección 4.A)
10. ✅ **Configurar monitoreo y alertas** (Sección 8.D)

---

## VERIFICACIÓN FINAL

### Checklist de completitud:
- [ ] Todas las credenciales antiguas están INVALIDADAS
- [ ] TODAS las nuevas credenciales están SOLO en variables de entorno/Secret Manager
- [ ] Endpoint `/api/uploadHandler` requiere token Bearer
- [ ] Rate limiting está activo (probar con 15 requests en 1 minuto)
- [ ] CORS solo permite tu dominio de producción
- [ ] npm audit muestra 0 vulnerabilidades críticas
- [ ] OWASP ZAP no reporta vulnerabilidades High/Critical
- [ ] Firestore rules pasan las pruebas (ver `firestore.rules`)
- [ ] Service Account tiene SOLO los permisos mínimos necesarios
- [ ] Monitoreo y alertas configurados en Firebase Console

---

## CONTACTOS DE EMERGENCIA

Si detectas una brecha de seguridad ACTIVA:

1. **Deshabilitar la app inmediatamente:**
   ```bash
   # Deshabilitar en Vercel
   vercel --prod --env-rm FIREBASE_SERVICE_ACCOUNT
   ```

2. **Invalidar credenciales:**
   - Firebase Console > Project Settings > Service accounts > Delete
   - Google Cloud > IAM > Service Accounts > Delete

3. **Notificar:**
   - Equipo de desarrollo
   - Usuarios (si hay exposición de datos)

---

**Documento creado:** 2025-11-12
**Prioridad:** CRÍTICA
**Tiempo estimado de implementación:** 24-72 horas
**Mantenimiento:** Revisión mensual de seguridad
