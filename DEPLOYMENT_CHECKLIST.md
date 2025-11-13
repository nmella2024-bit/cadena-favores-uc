# Checklist de Deployment Seguro - Red UC

Este documento lista todos los pasos necesarios para implementar las mejoras de seguridad en producción.

---

## FASE 1: PREPARACIÓN (1-2 horas)

### ✅ 1. Backup de datos críticos
```bash
# Exportar usuarios de Firestore
firebase firestore:export gs://red-uc-eeuu.appspot.com/backups/$(date +%Y%m%d)

# Backup local de configuración
cp .env .env.backup.$(date +%Y%m%d)
cp firebase.json firebase.json.backup
```

### ✅ 2. Revisar código actual
```bash
# Ejecutar auditoría de seguridad
bash scripts/security-audit.sh

# Revisar dependencias vulnerables
npm audit --audit-level=high
npm audit fix
```

---

## FASE 2: ROTACIÓN DE CREDENCIALES (2-3 horas)

### ✅ 3. Rotar Service Account

**IMPORTANTE: Sigue este orden exacto**

#### 3.1. Crear nueva Service Account
```bash
# Opción A: Usar script automatizado
bash scripts/rotate-credentials.sh

# Opción B: Manual
# 1. Ve a: https://console.cloud.google.com/iam-admin/serviceaccounts?project=red-uc-eeuu
# 2. Click "Create Service Account"
# 3. Nombre: red-uc-backend-secure-2025
# 4. Descripción: Service Account con permisos mínimos (creada: 2025-11-12)
# 5. Click "Create and Continue"
```

#### 3.2. Asignar permisos mínimos
```bash
bash scripts/setup-service-account-minimal-permissions.sh

# O manualmente:
# - roles/datastore.user
# - roles/firebase.sdkAdminServiceAgent
```

#### 3.3. Generar clave JSON
```bash
# En Google Cloud Console:
# 1. Click en la nueva service account
# 2. Keys > Add Key > Create new key
# 3. Tipo: JSON
# 4. Guardar como: serviceAccountKey-new.json
```

#### 3.4. Compartir carpetas de Google Drive
```
Email: red-uc-backend-secure-2025@red-uc-eeuu.iam.gserviceaccount.com
Permisos: Editor
Carpetas: SOLO las carpetas de materiales (no la raíz)
```

### ✅ 4. Rotar Firebase Web App

#### 4.1. Eliminar app antigua
```
1. Ve a: https://console.firebase.google.com/project/red-uc-eeuu/settings/general
2. En "Your apps", encuentra la app web actual
3. Click en los 3 puntos > Delete app
4. Confirma la eliminación
```

#### 4.2. Crear nueva app
```
1. Click "Add app" > Web
2. Nombre: Red UC - Producción
3. NO marcar Firebase Hosting (se configura después)
4. Click "Register app"
5. Copiar las credenciales que aparecen
```

#### 4.3. Guardar nuevas credenciales
```bash
# Crear archivo .env con las NUEVAS credenciales
cp .env.example.secure .env

# Editar .env y pegar:
VITE_FIREBASE_API_KEY=<NUEVA_KEY>
VITE_FIREBASE_AUTH_DOMAIN=red-uc-eeuu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=red-uc-eeuu
# ... etc
```

---

## FASE 3: ACTUALIZAR CÓDIGO (1 hora)

### ✅ 5. Implementar autenticación en endpoints

#### 5.1. Renombrar endpoint actual (backup)
```bash
# Renombrar el endpoint inseguro
mv api/uploadHandler.js api/uploadHandler.OLD.js

# Copiar el nuevo endpoint seguro
cp api/uploadHandler.secure.js api/uploadHandler.js
```

#### 5.2. Verificar middleware
```bash
# Verificar que existe el middleware
ls -la api/_middleware.js

# Revisar el contenido
cat api/_middleware.js
```

### ✅ 6. Actualizar configuración de CORS

Ya actualizado en [vercel.json](vercel.json)

Verificar que el dominio sea correcto:
```json
"Access-Control-Allow-Origin": "https://red-uc-eeuu.web.app"
```

**CAMBIAR si usas otro dominio en producción**

---

## FASE 4: CONFIGURAR VARIABLES DE ENTORNO EN VERCEL (30 min)

### ✅ 7. Actualizar variables en Vercel

#### 7.1. Acceder a Vercel
```
URL: https://vercel.com/tu-equipo/red-uc-eeuu/settings/environment-variables
```

#### 7.2. Variables a actualizar/agregar:

**FRONTEND (VITE_*):**
```
VITE_FIREBASE_API_KEY=<NUEVA_KEY_DE_PASO_4>
VITE_FIREBASE_AUTH_DOMAIN=red-uc-eeuu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=red-uc-eeuu
VITE_FIREBASE_STORAGE_BUCKET=red-uc-eeuu.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<NUEVO_ID>
VITE_FIREBASE_APP_ID=<NUEVO_APP_ID>
VITE_FIREBASE_MEASUREMENT_ID=<NUEVO_MEASUREMENT_ID>
```

**BACKEND:**
```
FIREBASE_SERVICE_ACCOUNT=<CONTENIDO_COMPLETO_DE_serviceAccountKey-new.json>
```

**IMPORTANTE:**
- Pega el JSON completo (con todas las llaves y comillas)
- Marca las 3 opciones: Production, Preview, Development
- Click "Save"

---

## FASE 5: DEPLOYMENT (30 min)

### ✅ 8. Commit y push de cambios

```bash
# Revisar cambios
git status

# Agregar archivos nuevos de seguridad
git add api/_middleware.js
git add api/uploadHandler.js
git add vercel.json
git add .env.example.secure
git add scripts/rotate-credentials.sh
git add scripts/security-audit.sh
git add scripts/setup-service-account-minimal-permissions.sh
git add SECURITY_CHECKLIST_IMPLEMENTATION.md
git add DEPLOYMENT_CHECKLIST.md

# Crear commit
git commit -m "Implementar mejoras críticas de seguridad

- Agregar autenticación y autorización a endpoints API
- Implementar rate limiting básico
- Configurar CORS restrictivo y headers de seguridad
- Agregar middleware de validación de input
- Scripts de rotación de credenciales
- Documentación de seguridad

BREAKING CHANGE: Los endpoints API ahora requieren autenticación.
Los clientes deben enviar header: Authorization: Bearer <token>"

# Push
git push origin main
```

### ✅ 9. Monitorear deployment en Vercel

```
1. Ve a: https://vercel.com/tu-equipo/red-uc-eeuu
2. Espera a que el deployment termine (2-3 minutos)
3. Revisa los logs por errores
4. Si hay errores, revisar "Function Logs"
```

---

## FASE 6: PRUEBAS POST-DEPLOYMENT (1 hora)

### ✅ 10. Pruebas de funcionalidad

#### 10.1. Autenticación básica
```bash
# Abre la app en navegador
open https://red-uc-eeuu.web.app

# Prueba:
# ✓ Iniciar sesión con usuario existente
# ✓ Cerrar sesión
# ✓ Registrar nuevo usuario
```

#### 10.2. Upload de archivos (CON autenticación)
```bash
# En la app:
# 1. Iniciar sesión como usuario con rol "exclusivo" o "admin"
# 2. Intentar subir un archivo a una carpeta
# 3. Verificar que se suba correctamente
# 4. Verificar que aparece en Google Drive
```

#### 10.3. Upload SIN autenticación (debe fallar)
```bash
# Test con curl (debe retornar 401 Unauthorized)
curl -X POST https://tu-dominio.vercel.app/api/uploadHandler \
  -H "Content-Type: multipart/form-data" \
  -F "archivo=@test.pdf" \
  -F "folderId=123"

# Respuesta esperada:
# {"error":"No autorizado","message":"Token de autenticación requerido..."}
```

#### 10.4. Rate limiting
```bash
# Hacer 15 requests en 1 minuto (debe bloquear después de 10)
for i in {1..15}; do
  curl -X POST https://tu-dominio.vercel.app/api/uploadHandler \
    -H "Authorization: Bearer <tu-token>" \
    -H "Content-Type: application/json" \
    -d '{}' &
  sleep 3
done

# Después del request #10, debe retornar 429 Too Many Requests
```

### ✅ 11. Revisar logs de seguridad

```bash
# En Vercel Dashboard:
# 1. Functions > uploadHandler > Logs
# 2. Buscar logs con prefijo [AUTH SUCCESS] o [AUTH ERROR]
# 3. Verificar que se están registrando los accesos
```

---

## FASE 7: CONFIGURACIÓN AVANZADA (Opcional - 2-3 horas)

### ✅ 12. Habilitar Firebase App Check

```
1. Ve a: https://console.firebase.google.com/project/red-uc-eeuu/appcheck
2. Click "Get started"
3. Selecciona tu web app
4. Provider: reCAPTCHA v3
5. Registra un nuevo site en: https://www.google.com/recaptcha/admin
6. Copia la Site Key
7. Pega en Firebase App Check
8. Enforcement: "Enforced" para Firestore y Storage
9. Actualizar código del frontend para incluir App Check token
```

### ✅ 13. Configurar rate limiting avanzado con Upstash

```bash
# 1. Crear cuenta en https://upstash.com (gratis)
# 2. Crear base de datos Redis
# 3. Copiar credenciales

# 4. Agregar a Vercel:
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# 5. Instalar dependencia
npm install @upstash/ratelimit @upstash/redis

# 6. Actualizar api/_middleware.js para usar Upstash
# (ver ejemplo en SECURITY_CHECKLIST_IMPLEMENTATION.md)
```

### ✅ 14. Configurar Cloudflare (opcional pero recomendado)

```
1. Crear cuenta en Cloudflare
2. Agregar dominio
3. Cambiar nameservers en registrar de dominio
4. Esperar propagación DNS (24-48h)
5. En Cloudflare Dashboard:
   - Security > WAF > Enable
   - Security > Bots > Enable Bot Fight Mode
   - Traffic > Rate Limiting > Crear regla (10 req/min por IP)
   - SSL/TLS > Full (strict)
```

---

## FASE 8: LIMPIEZA Y ELIMINACIÓN DE CREDENCIALES ANTIGUAS (30 min)

### ✅ 15. Eliminar Service Account antigua

```bash
# Opción A: Con script
# Ya incluido en scripts/rotate-credentials.sh

# Opción B: Manual
# 1. Ve a: https://console.cloud.google.com/iam-admin/serviceaccounts?project=red-uc-eeuu
# 2. Encuentra: bot-subida-drive@coherent-flame-475215-f0.iam.gserviceaccount.com
# 3. Click en los 3 puntos > Delete
# 4. Confirma eliminación
```

### ✅ 16. Revocar claves JSON antiguas

```bash
# Eliminar archivo local (si existe)
rm -f serviceAccountKey.json
rm -f coherent-flame-475215-f0-4fff3af9eaec.json

# Verificar que no está en el repositorio
git log --all --full-history -- serviceAccountKey.json

# Si aparece en historial, ver sección de limpieza en:
# SECURITY_CHECKLIST_IMPLEMENTATION.md
```

### ✅ 17. Actualizar .gitignore

Ya actualizado, pero verificar:

```bash
cat .gitignore | grep -E "serviceAccount|\.env|\.key"

# Debe incluir:
# serviceAccountKey.json
# *.json (service accounts)
# .env
# .env.local
```

---

## FASE 9: MONITOREO CONTINUO

### ✅ 18. Configurar alertas

#### En Firebase Console:
```
1. Ve a: https://console.firebase.google.com/project/red-uc-eeuu/analytics
2. Configure eventos custom:
   - auth_failure (intentos fallidos de autenticación)
   - upload_unauthorized (uploads sin autorización)
   - rate_limit_exceeded
```

#### En Google Cloud Monitoring:
```
1. Ve a: https://console.cloud.google.com/monitoring/alerting?project=red-uc-eeuu
2. Create Policy:
   - Metric: cloud.googleapis.com/firestore/document/write_count
   - Condition: Rate > 100 writes/min
   - Notification: Email
```

### ✅ 19. Programar auditorías periódicas

```bash
# Agregar a cron job (Linux/Mac) o Task Scheduler (Windows)
# Ejecutar cada semana:

# Linux/Mac - agregar a crontab:
0 9 * * 1 cd /path/to/proyecto && bash scripts/security-audit.sh

# Windows - crear tarea programada que ejecute:
# bash scripts/security-audit.sh
```

---

## VERIFICACIÓN FINAL

### ✅ Checklist de completitud:

- [ ] Service Account antigua eliminada
- [ ] Nueva Service Account con permisos mínimos
- [ ] Firebase Web App antigua eliminada
- [ ] Nuevas credenciales Firebase en uso
- [ ] FIREBASE_SERVICE_ACCOUNT actualizada en Vercel
- [ ] VITE_FIREBASE_* actualizadas en Vercel
- [ ] Endpoint /api/uploadHandler requiere autenticación
- [ ] Rate limiting funciona (probado con 15+ requests)
- [ ] CORS permite solo dominio de producción
- [ ] Headers de seguridad configurados
- [ ] Upload funciona con autenticación
- [ ] Upload falla sin autenticación
- [ ] Logs de seguridad funcionando
- [ ] No hay vulnerabilidades en npm audit
- [ ] No hay secretos en el repositorio git
- [ ] Archivos sensibles en .gitignore
- [ ] Carpetas de Drive compartidas con nueva SA
- [ ] Backup de datos realizado
- [ ] Alertas configuradas (opcional)
- [ ] App Check habilitada (opcional)

---

## TROUBLESHOOTING

### Error: "FIREBASE_SERVICE_ACCOUNT is not defined"
**Solución:**
1. Verifica que agregaste la variable en Vercel
2. Redeploya el proyecto (no basta con actualizar variables)
3. Espera 2-3 minutos para propagación

### Error: "Permission denied" en Google Drive
**Solución:**
1. Verifica que compartiste las carpetas con el email correcto de SA
2. Verifica que el permiso sea "Editor", no "Viewer"
3. Espera 5-10 minutos para propagación de permisos

### Error: 403 "Token inválido"
**Solución:**
1. Verifica que el frontend esté usando las NUEVAS credenciales
2. Limpia caché del navegador (Ctrl+Shift+Del)
3. Cierra sesión y vuelve a iniciar sesión
4. Verifica en DevTools > Application > Local Storage que no hay tokens antiguos

### Error: 429 "Demasiadas solicitudes" en producción normal
**Solución:**
1. Ajusta el límite en api/_middleware.js:
   ```javascript
   simpleRateLimit(clientIp, 20, 60000) // 20 requests por minuto
   ```
2. O implementa Upstash Redis para rate limiting por usuario en vez de por IP

### CORS error en producción
**Solución:**
1. Verifica que el dominio en vercel.json coincide con tu dominio real:
   ```json
   "Access-Control-Allow-Origin": "https://TU-DOMINIO-REAL.vercel.app"
   ```
2. Redeploya después de cambiar
3. Limpia caché de Cloudflare (si lo usas)

---

## CONTACTOS DE EMERGENCIA

**Si algo sale mal en producción:**

1. **Rollback inmediato:**
   ```bash
   # En Vercel Dashboard:
   # Deployments > Click en el deployment anterior > "Promote to Production"
   ```

2. **Deshabilitar endpoint vulnerable:**
   ```bash
   # Agregar a vercel.json:
   "rewrites": [
     {
       "source": "/api/uploadHandler",
       "destination": "/api/maintenance.html"
     }
   ]
   ```

3. **Invalidar credenciales comprometidas:**
   ```bash
   # Eliminar Service Account inmediatamente
   gcloud iam service-accounts delete <EMAIL> --project=red-uc-eeuu

   # Eliminar app de Firebase
   # (Ver instrucciones en Fase 2, paso 4.1)
   ```

---

**Última actualización:** 2025-11-12
**Próxima revisión:** 2025-12-12 (mensual)
**Próxima rotación de credenciales:** 2026-02-12 (cada 90 días)
