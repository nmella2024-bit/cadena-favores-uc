# Backend de Subida de Archivos a Google Drive

## ¿Qué se ha creado?

Se ha implementado un sistema completo para subir archivos desde tu aplicación web directamente a Google Drive y guardar los links en Firestore.

---

## Archivos creados/modificados:

### 1. `api/uploadHandler.js` (NUEVO)
Este es el endpoint serverless que maneja la subida de archivos.

**Funcionalidad:**
- Recibe archivos desde el frontend
- Los sube a Google Drive en la carpeta especificada
- Hace los archivos públicos (cualquiera con el link puede verlos)
- Guarda el link en Firestore
- Limpia archivos temporales

### 2. `vercel.json` (MODIFICADO)
Configurado para que las rutas `/api/*` se dirijan a las funciones serverless.

### 3. `.gitignore` (YA CONFIGURADO)
El archivo de credenciales `coherent-flame-475215-f0-4fff3af9eaec.json` ya está ignorado correctamente.

### 4. `package.json` (MODIFICADO)
Se instalaron las dependencias:
- `googleapis` - Para interactuar con Google Drive API
- `formidable` - Para procesar archivos en Vercel

---

## Configuración en Vercel (Variables de Entorno)

### IMPORTANTE: Antes de hacer deploy, debes configurar esta variable en Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega esta variable:

**Nombre:** `FIREBASE_SERVICE_ACCOUNT`

**Valor:** (Copia el contenido completo del archivo `serviceAccountKey.json`)

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "tu-service-account@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/...",
  "universe_domain": "googleapis.com"
}
```

**Environments:** Marca las 3 opciones (Production, Preview, Development)

---

## Cómo usar desde el Frontend

### Ejemplo de código para subir archivos:

```javascript
const handleUploadFile = async (archivo, googleDriveFolderId, carpetaId) => {
  const formData = new FormData();

  // Agregar el archivo
  formData.append('archivo', archivo);

  // Agregar metadatos
  formData.append('folderId', googleDriveFolderId); // ID de carpeta de Google Drive
  formData.append('carpetaId', carpetaId); // ID de carpeta en Firestore
  formData.append('usuarioId', currentUser.uid); // ID del usuario que sube

  // Opcional: Si quieres agregar el archivo a un material existente
  // formData.append('firestoreId', materialId);

  try {
    const response = await fetch('/api/uploadHandler', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      console.log('Archivo subido exitosamente:', data.link);
      // Aquí puedes actualizar la UI
      return data;
    } else {
      console.error('Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error al subir archivo:', error);
    throw error;
  }
};
```

### Parámetros que acepta el endpoint:

#### Obligatorios:
- `archivo`: El archivo a subir (File object)
- `folderId`: ID de la carpeta de Google Drive donde se guardará

#### Opcionales (pero necesitas al menos uno):
- `firestoreId`: ID del documento en Firestore para actualizar (si ya existe el material)
- `carpetaId` + `usuarioId`: Para crear un nuevo documento de material

---

## Estructura de datos que guarda en Firestore

Cuando crea un nuevo material:
```javascript
{
  titulo: "nombre-del-archivo",
  descripcion: "",
  tipo: "archivo",
  archivos: [{
    nombre: "documento.pdf",
    link: "https://drive.google.com/file/d/...",
    tipo: "application/pdf",
    fechaSubida: "2025-11-07T...",
    subidoPor: "userId"
  }],
  carpetaId: "carpeta123",
  creadoPor: "userId",
  creadoEn: Timestamp,
  actualizadoEn: Timestamp,
  fijado: false,
  vistas: 0
}
```

Cuando actualiza un material existente, agrega el archivo al array `archivos`.

---

## Próximos pasos:

1. **Configurar la variable de entorno en Vercel** (ver arriba)
2. **Hacer deploy a Vercel** (`git push` o deploy manual)
3. **Modificar el componente SubirMaterialModal** para usar este endpoint
4. **Probar la funcionalidad** subiendo un archivo

---

## Notas de seguridad:

- El archivo de credenciales NUNCA debe subirse a git (ya está en .gitignore)
- Los archivos se hacen públicos con el link (role: 'reader', type: 'anyone')
- El endpoint valida que sea método POST
- Tiene límite de 50MB por archivo
- Los archivos temporales se eliminan automáticamente

---

## Troubleshooting:

### Error: "FIREBASE_SERVICE_ACCOUNT is not defined"
- Verifica que configuraste la variable de entorno en Vercel
- Asegúrate de haber hecho redeploy después de agregar la variable

### Error: "Permission denied" en Google Drive
- Verifica que el Service Account tenga permisos en las carpetas de Drive
- Comparte la carpeta de Drive con el email: `bot-subida-drive@coherent-flame-475215-f0.iam.gserviceaccount.com`

### Error: "File too large"
- El límite es 50MB, puedes aumentarlo cambiando `maxFileSize` en el código

---

## Testing local:

Para probar localmente, crea un archivo `.env.local`:
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account"...}
```

Y ejecuta:
```bash
npm run dev
```
