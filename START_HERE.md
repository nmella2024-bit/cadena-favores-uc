# 🚀 INICIO RÁPIDO - Implementación de Seguridad

**¿Por dónde empiezo?** Sigue estos pasos en orden.

---

## 📋 PASO 1: Leer el resumen

Lee [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md) para entender qué se ha implementado.

**Tiempo:** 5 minutos

---

## ✅ PASO 2: Pre-verificación

Ejecuta estos comandos para verificar el estado actual:

```bash
# 1. Revisar dependencias vulnerables
npm audit --audit-level=high

# 2. Arreglar vulnerabilidades automáticamente
npm audit fix

# 3. (Si estás en Linux/Mac) Ejecutar auditoría completa
bash scripts/security-audit.sh

# 4. (En Windows con Git Bash)
bash scripts/security-audit.sh
```

**Resultado esperado:**
- 0 vulnerabilidades críticas/altas
- Todos los checks ✓ en verde

**Tiempo:** 10-15 minutos

---

## 🔐 PASO 3: Implementar autenticación en endpoint

**IMPORTANTE:** Esto es lo más crítico. El endpoint actual NO tiene autenticación.

```bash
# 1. Backup del endpoint actual (por si acaso)
cp api/uploadHandler.js api/uploadHandler.OLD.js

# 2. Reemplazar con versión segura
cp api/uploadHandler.secure.js api/uploadHandler.js

# 3. Verificar que se copió correctamente
head -30 api/uploadHandler.js
# Debe mostrar imports de middleware y comentarios de SEGURIDAD
```

**Tiempo:** 5 minutos

---

## 🔄 PASO 4: Rotar credenciales

**¿Por qué?** Las credenciales actuales pueden haber sido expuestas.

### Opción A: Script automatizado (recomendado)

```bash
bash scripts/rotate-credentials.sh
```

Sigue las instrucciones del script interactivo.

### Opción B: Manual

Sigue la [guía completa](SECURITY_CHECKLIST_IMPLEMENTATION.md#1-rotar-todas-las-credenciales-expuestas).

**Tiempo:** 2-3 horas

---

## 🔧 PASO 5: Actualizar variables en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com
2. Settings → Environment Variables
3. Actualiza estas variables:

### Variables a ACTUALIZAR:

```bash
# Con las NUEVAS credenciales de Firebase
VITE_FIREBASE_API_KEY=<nueva_key>
VITE_FIREBASE_AUTH_DOMAIN=red-uc-eeuu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=red-uc-eeuu
VITE_FIREBASE_STORAGE_BUCKET=red-uc-eeuu.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<nuevo_id>
VITE_FIREBASE_APP_ID=<nuevo_app_id>
VITE_FIREBASE_MEASUREMENT_ID=<nuevo_measurement_id>

# Con la NUEVA service account
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

4. Marca las 3 opciones: Production, Preview, Development
5. Click "Save"

**Tiempo:** 15 minutos

---

## 🚀 PASO 6: Deploy a producción

```bash
# 1. Revisar cambios
git status
git diff

# 2. Agregar archivos
git add .

# 3. Commit
git commit -m "Implementar mejoras críticas de seguridad

- Agregar autenticación a endpoints API
- Configurar CORS restrictivo
- Implementar rate limiting
- Agregar headers de seguridad
- Scripts de rotación de credenciales
- Documentación completa

BREAKING CHANGE: Los endpoints API ahora requieren autenticación.
Frontend debe enviar header: Authorization: Bearer <token>"

# 4. Push
git push origin main
```

**Tiempo:** 10 minutos

---

## 🧪 PASO 7: Probar después de deployment

### 7.1. Verificar que el endpoint requiere autenticación

```bash
# Esto debe retornar 401 Unauthorized
curl -X POST https://tu-dominio.vercel.app/api/uploadHandler \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Resultado esperado:**
```json
{
  "error": "No autorizado",
  "message": "Token de autenticación requerido..."
}
```

### 7.2. Probar con autenticación

1. Abre la app en el navegador
2. Inicia sesión como usuario "exclusivo" o "admin"
3. Intenta subir un archivo
4. Debe funcionar correctamente

### 7.3. Probar rate limiting

Haz 15 requests rápidos. El request #11 debe retornar:
```json
{
  "error": "Demasiadas solicitudes",
  "message": "Has excedido el límite de 10 uploads por minuto"
}
```

**Tiempo:** 30 minutos

---

## ⚙️ PASO 8: Configurar permisos mínimos (importante)

```bash
# Ejecutar script
bash scripts/setup-service-account-minimal-permissions.sh

# Sigue las instrucciones del script
```

**Tiempo:** 30 minutos

---

## 📊 VERIFICACIÓN FINAL

Usa este checklist para verificar que todo está OK:

```bash
# Ejecutar auditoría completa
npm run security:audit
```

### Checklist manual:

- [ ] Endpoint /api/uploadHandler requiere autenticación (probado)
- [ ] Rate limiting funciona (probado con 15 requests)
- [ ] Upload funciona con usuario autenticado
- [ ] Upload falla sin autenticación
- [ ] Service Account con permisos mínimos
- [ ] Variables de entorno actualizadas en Vercel
- [ ] No hay vulnerabilidades en npm audit
- [ ] CORS permite solo dominio de producción
- [ ] Headers de seguridad configurados

---

## 📚 DOCUMENTACIÓN COMPLETA

Si necesitas más detalles sobre cualquier paso:

1. **Guía técnica completa:** [SECURITY_CHECKLIST_IMPLEMENTATION.md](SECURITY_CHECKLIST_IMPLEMENTATION.md)
2. **Paso a paso de deployment:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
3. **Resumen ejecutivo:** [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md)

---

## 🆘 TROUBLESHOOTING RÁPIDO

### Error: "FIREBASE_SERVICE_ACCOUNT is not defined"
- Verifica que agregaste la variable en Vercel
- Redeploya (no basta con actualizar variables)

### Error: "Permission denied" en Google Drive
- Comparte las carpetas con el email de la nueva service account
- Permiso: "Editor"

### Error: 403 "Token inválido"
- Limpia caché del navegador
- Cierra sesión y vuelve a iniciar
- Verifica que el frontend esté usando las nuevas credenciales

### Rate limiting demasiado estricto
Edita [api/_middleware.js](api/_middleware.js:149) y aumenta el límite:
```javascript
simpleRateLimit(clientIp, 20, 60000) // 20 requests por minuto
```

**Más ayuda:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md#troubleshooting)

---

## 🎯 PRÓXIMOS PASOS OPCIONALES (DÍA 2-3)

Una vez que lo básico funcione, considera implementar:

1. **Firebase App Check** - Prevenir abuso de API
2. **Upstash Redis** - Rate limiting avanzado
3. **Cloudflare** - WAF y DDoS protection
4. **OWASP ZAP** - Escaneo de vulnerabilidades
5. **Monitoreo y alertas** - Detectar actividad sospechosa

Ver [SECURITY_CHECKLIST_IMPLEMENTATION.md](SECURITY_CHECKLIST_IMPLEMENTATION.md) para guías detalladas.

---

## 📞 CONTACTO DE EMERGENCIA

**Si algo sale mal en producción:**

### Rollback inmediato:
1. Ve a Vercel Dashboard
2. Deployments → Click en deployment anterior
3. Click "Promote to Production"

### Deshabilitar endpoint vulnerable:
Edita [vercel.json](vercel.json) y agrega:
```json
"rewrites": [
  {
    "source": "/api/uploadHandler",
    "destination": "/maintenance.html"
  }
]
```

---

## ⏱️ TIMELINE ESTIMADO

**Mínimo (solo lo crítico):**
- Pre-verificación: 15 min
- Implementar autenticación: 5 min
- Rotar credenciales: 2h
- Actualizar Vercel: 15 min
- Deploy: 10 min
- Pruebas: 30 min
- **TOTAL: ~4 horas**

**Recomendado (incluye permisos):**
- Lo anterior + Configurar permisos: 30 min
- **TOTAL: ~4.5 horas**

**Completo (incluye opcionales):**
- Lo anterior + App Check + Upstash + Cloudflare: 3h
- **TOTAL: ~7-8 horas**

---

## ✅ LISTO

Ahora tienes todo lo necesario para hacer tu aplicación significativamente más segura.

**Comienza con el PASO 2** y sigue en orden. ¡Éxito! 🚀🔒

---

**Creado:** 2025-11-12
**Versión:** 1.0
