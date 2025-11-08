# Cómo Funciona la Subida de Archivos a Google Drive

## Resumen

Tu aplicación ahora tiene **dos sistemas de subida de archivos**:

1. **Nuevo Sistema (Google Drive)**: Para carpetas que tienen `googleDriveFolderId`
2. **Sistema Tradicional (Firebase Storage)**: Para carpetas sin `googleDriveFolderId` o cuando se usa enlace externo

---

## Flujo Automático

Cuando un usuario sube un archivo en la aplicación:

```
┌─────────────────────────────────────────┐
│ Usuario hace clic en "Subir Material"  │
└──────────────┬──────────────────────────┘
               │
               v
┌─────────────────────────────────────────┐
│  ¿Carpeta tiene googleDriveFolderId?    │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
      SÍ              NO
       │               │
       v               v
┌──────────────┐  ┌──────────────┐
│ Google Drive │  │   Firebase   │
│   (Nuevo)    │  │   Storage    │
└──────────────┘  └──────────────┘
       │               │
       └───────┬───────┘
               │
               v
┌─────────────────────────────────────────┐
│  Material guardado en Firestore         │
│  con link al archivo                    │
└─────────────────────────────────────────┘
```

---

## Sistema Nuevo (Google Drive)

### ¿Cuándo se usa?

Se usa automáticamente cuando:
- La carpeta tiene el campo `googleDriveFolderId` en Firestore
- El usuario sube un archivo (no un enlace externo)

### Ventajas

- ✅ Los archivos se guardan directamente en tu Google Drive organizado
- ✅ Respeta la estructura de carpetas que ya tienes
- ✅ Los links son permanentes de Google Drive
- ✅ Puedes ver y gestionar los archivos desde tu Drive
- ✅ Compatibilidad con los materiales ya existentes

### Archivos Creados

1. **[api/uploadHandler.js](api/uploadHandler.js)** - Función serverless
2. **[src/services/driveService.js](src/services/driveService.js)** - Servicio frontend
3. **[src/components/SubirMaterialModal.jsx](src/components/SubirMaterialModal.jsx)** - Modal actualizado

---

## ¿Cómo Agregar `googleDriveFolderId` a las Carpetas?

Para que una carpeta use el nuevo sistema, necesitas agregarle el campo `googleDriveFolderId`.

### Opción 1: Manualmente en Firestore Console

1. Ve a Firebase Console → Firestore Database
2. Encuentra la carpeta en la colección `folders`
3. Edita el documento y agrega el campo:
   ```
   googleDriveFolderId: "ID_DE_TU_CARPETA_DE_DRIVE"
   ```

### Opción 2: Script de migración (recomendado)

Puedes crear un script para mapear tus carpetas de Firestore con las de Google Drive:

```javascript
// scripts/add-google-drive-ids.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Mapa de carpetas: nombre → googleDriveFolderId
const mapaCarpetas = {
  'Cálculo I': '1ABC...XYZ',
  'Física II': '1DEF...UVW',
  // ... más carpetas
};

// Código para actualizar cada carpeta
// ...
```

### ¿Cómo obtener el `googleDriveFolderId`?

1. Abre la carpeta en Google Drive en tu navegador
2. La URL se verá así: `https://drive.google.com/drive/folders/1ABC123XYZ456`
3. El ID es la parte final: `1ABC123XYZ456`

---

## Permisos del Service Account

### IMPORTANTE: Compartir carpetas con el bot

Para que el Service Account pueda subir archivos a una carpeta de Drive, necesitas:

1. Abrir la carpeta en Google Drive
2. Click derecho → "Compartir"
3. Agregar el email del bot:
   ```
   bot-subida-drive@coherent-flame-475215-f0.iam.gserviceaccount.com
   ```
4. Darle permiso de **Editor**

**Nota**: Puedes compartir una carpeta padre y todas las subcarpetas heredarán los permisos.

---

## Estructura de Datos en Firestore

### Carpeta (collection: `folders`)

```javascript
{
  id: "carpeta123",
  nombre: "Cálculo I",
  carpetaPadreId: null,
  googleDriveFolderId: "1ABC123XYZ456", // ← NUEVO CAMPO (opcional)
  autorId: "user123",
  autorNombre: "Juan Pérez",
  fechaCreacion: Timestamp,
  tipo: "carpeta"
}
```

### Material subido a Drive (collection: `material`)

```javascript
{
  id: "material456",
  titulo: "Resumen de Límites",
  descripcion: "Resumen completo del capítulo 2",
  carrera: "Ingeniería Civil",
  anio: 1,
  ramo: "Cálculo I",
  tags: ["límites", "continuidad"],
  tipo: "PDF",
  archivoUrl: "https://drive.google.com/file/d/...",
  archivos: [{
    nombre: "resumen-limites.pdf",
    link: "https://drive.google.com/file/d/...",
    tipo: "application/pdf",
    fechaSubida: "2025-11-07T...",
    subidoPor: "user123"
  }],
  carpetaId: "carpeta123",
  autorId: "user123",
  fechaSubida: Timestamp,
  fijado: false,
  vistas: 0
}
```

---

## Variables de Entorno en Vercel

### ⚠️ CRÍTICO: Configurar antes de deployar

```
FIREBASE_SERVICE_ACCOUNT = {"type":"service_account"...}
```

Ver instrucciones completas en: [INSTRUCCIONES_BACKEND_UPLOAD.md](INSTRUCCIONES_BACKEND_UPLOAD.md)

---

## Testing

### Local (desarrollo)

1. Crea `.env.local`:
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account"...}
   ```

2. Ejecuta:
   ```bash
   npm run dev
   ```

3. Ve a Material y sube un archivo en una carpeta con `googleDriveFolderId`

### Producción (Vercel)

1. Configura la variable de entorno en Vercel Dashboard
2. Haz deploy: `git push` o deploy manual
3. Prueba subiendo un archivo

---

## Troubleshooting

### Error: "Permission denied" en Google Drive

**Solución**: Comparte la carpeta de Google Drive con:
```
bot-subida-drive@coherent-flame-475215-f0.iam.gserviceaccount.com
```

### Error: "FIREBASE_SERVICE_ACCOUNT is not defined"

**Solución**:
1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Agrega la variable `FIREBASE_SERVICE_ACCOUNT`
3. Redeploy

### Los archivos se suben a Firebase Storage en lugar de Drive

**Causa**: La carpeta no tiene el campo `googleDriveFolderId`

**Solución**: Agrega el campo a la carpeta en Firestore

### El archivo se sube a Drive pero no aparece en la app

**Causa**: Puede ser un problema de permisos o el material no se guardó en Firestore

**Solución**:
1. Verifica los logs en Vercel → Deployments → Functions
2. Revisa que el material se creó en Firestore
3. Refresca la página

---

## Migración Gradual

No necesitas migrar todas las carpetas de inmediato:

1. **Fase 1**: Agrega `googleDriveFolderId` solo a carpetas nuevas o importantes
2. **Fase 2**: Las carpetas sin el campo seguirán usando Firebase Storage
3. **Fase 3**: Migra gradualmente el resto de carpetas

**Ventaja**: Ambos sistemas coexisten perfectamente.

---

## Próximos Pasos Sugeridos

1. ✅ **Configurar variable en Vercel** (crítico antes de deploy)
2. ✅ **Hacer deploy a Vercel**
3. 📝 Crear script para agregar `googleDriveFolderId` a carpetas existentes
4. 🔗 Compartir carpetas de Drive con el Service Account
5. 🧪 Probar subida de archivos
6. 📊 Monitorear logs en Vercel

---

## Archivos Importantes

- [api/uploadHandler.js](api/uploadHandler.js) - Función serverless
- [src/services/driveService.js](src/services/driveService.js) - Servicio de Drive
- [src/components/SubirMaterialModal.jsx](src/components/SubirMaterialModal.jsx) - Modal de subida
- [INSTRUCCIONES_BACKEND_UPLOAD.md](INSTRUCCIONES_BACKEND_UPLOAD.md) - Instrucciones detalladas
- [.gitignore](.gitignore) - Archivo de credenciales ignorado

---

## Notas de Seguridad

- ✅ Las credenciales están en variable de entorno (no en código)
- ✅ El archivo de credenciales está en `.gitignore`
- ✅ Los archivos se hacen públicos con `role: 'reader'` (solo lectura)
- ✅ El endpoint valida que sea POST
- ✅ Límite de 50MB por archivo

---

¿Necesitas ayuda? Revisa los logs en:
- **Vercel**: Deployments → Functions → Logs
- **Frontend**: Console del navegador (F12)
