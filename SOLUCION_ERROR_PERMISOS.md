# Solución al Error de Permisos en Firestore

## Problema

Al ejecutar `npm run seed:folders`, obtienes el siguiente error:

```
PERMISSION_DENIED: Missing or insufficient permissions.
```

## ¿Por qué ocurre?

Los scripts de Node.js que ejecutan desde la terminal no pueden autenticarse como usuarios normales de Firebase Auth. Las reglas de seguridad de Firestore bloquean el acceso no autenticado.

## Solución Implementada ✅

Hemos creado un **componente web de administración** que ejecuta el script desde la interfaz de usuario, donde SÍ hay autenticación de usuario.

### Cómo usar la solución:

1. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Inicia sesión** con una cuenta que tenga rol `exclusivo`

3. **Navega a la página de administración:**
   ```
   http://localhost:5173/admin/seed-folders
   ```

4. **Click en "Crear Estructura Completa"**

5. **Espera** a que se complete el proceso. Verás el progreso en tiempo real:
   - 🚀 Iniciando...
   - ✓ Carpetas creadas
   - ✅ Completado

6. **Ve a Material** para ver las carpetas creadas:
   ```
   http://localhost:5173/material
   ```

## Alternativas (No Recomendadas)

### Opción 1: Cambiar Reglas de Firestore (Temporal, Inseguro)

⚠️ **NO RECOMENDADO para producción**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `red-uc-eeuu`
3. Ve a Firestore Database > Reglas
4. Cambia temporalmente a:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ INSEGURO - Solo para testing
    }
  }
}
```

5. Ejecuta `npm run seed:folders`
6. **¡IMPORTANTE!** Revierte las reglas inmediatamente después

### Opción 2: Firebase Admin SDK (Complejo)

Requiere:
1. Descargar service account key de Firebase Console
2. Modificar el script para usar Firebase Admin SDK
3. Configurar variables de entorno con la ruta al archivo de credenciales

## Verificación

Después de crear las carpetas, verifica que funcionan:

1. Ve a `/material`
2. Deberías ver:
   - 📁 1° Semestre
   - 📁 2° Semestre
   - 📁 3° Semestre
   - 📁 4° Semestre
   - 📁 Majors
   - 📁 Red apoyo Fundamenta
   - 📁 Examen de Comunicación Escrita VRA 100C
   - 📁 Exploratorios

3. Click en cualquier carpeta para navegar
4. Usa el breadcrumb para volver

## Troubleshooting

### "No veo el componente AdminSeedFolders"
- Verifica que tu usuario tenga `rol: 'exclusivo'` en Firestore
- Revisa la consola del navegador para errores

### "El componente se muestra pero no crea carpetas"
- Verifica las reglas de Firestore en Firebase Console
- Asegúrate de estar autenticado
- Revisa la consola del navegador para errores específicos

### "Las carpetas se crean pero no las veo"
- Refresca la página
- Verifica que estás en la raíz de `/material` (no dentro de una carpeta)
- Revisa Firestore Database en Firebase Console para ver si los documentos existen

## Notas de Seguridad

✅ **Ventajas de usar el componente web:**
- Usa la autenticación normal de Firebase Auth
- Respeta las reglas de seguridad de Firestore
- Solo usuarios autorizados (rol exclusivo) pueden crear carpetas
- Más seguro que scripts externos

❌ **Desventajas del script de Node.js:**
- Requiere configuración compleja
- Riesgo de seguridad si se usan reglas permisivas
- Necesita credenciales de service account
- Más difícil de mantener

## Resumen

**Usa el componente web**: `/admin/seed-folders` ✅

**Evita el script de Node.js** a menos que tengas experiencia con Firebase Admin SDK ❌
