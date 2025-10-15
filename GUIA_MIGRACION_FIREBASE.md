# 🚀 Guía Completa de Migración a Nuevo Proyecto Firebase

Esta guía te ayudará a migrar tu proyecto "Red UC" a un nuevo proyecto Firebase con una región diferente.

## 📋 Índice

1. [Preparación](#1-preparación)
2. [Crear Nuevo Proyecto Firebase](#2-crear-nuevo-proyecto-firebase)
3. [Exportar Datos del Proyecto Actual](#3-exportar-datos-del-proyecto-actual)
4. [Configurar Nuevo Proyecto](#4-configurar-nuevo-proyecto)
5. [Importar Datos al Nuevo Proyecto](#5-importar-datos-al-nuevo-proyecto)
6. [Migrar Usuarios de Firebase Auth](#6-migrar-usuarios-de-firebase-auth)
7. [Migrar Archivos de Storage](#7-migrar-archivos-de-storage)
8. [Actualizar Código de la Aplicación](#8-actualizar-código-de-la-aplicación)
9. [Verificación y Pruebas](#9-verificación-y-pruebas)
10. [Eliminar Proyecto Antiguo](#10-eliminar-proyecto-antiguo-opcional)

---

## 1. Preparación

### Requisitos previos

- [ ] Node.js instalado (v16 o superior)
- [ ] Acceso a la consola de Firebase
- [ ] Firebase CLI instalado: `npm install -g firebase-tools`
- [ ] Cuenta de Firebase con permisos de administrador

### Hacer backup completo

⚠️ **IMPORTANTE**: Antes de continuar, asegúrate de tener un backup completo de:

1. **Código fuente**: Tu repositorio Git está actualizado
2. **Variables de entorno**: Copia de archivos `.env`
3. **Configuración actual**: Copia de `firebaseConfig.js`

---

## 2. Crear Nuevo Proyecto Firebase

### Paso 2.1: Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Nombre del proyecto: `red-uc-nuevo` (o el nombre que prefieras)
4. **IMPORTANTE**: Cuando configures Google Analytics, selecciona la ubicación predeterminada
5. Completa la creación del proyecto

### Paso 2.2: Configurar Firestore

1. En el menú lateral, ve a **Firestore Database**
2. Haz clic en "Crear base de datos"
3. **Selecciona la región deseada**:
   - Para Latinoamérica: `southamerica-east1` (São Paulo)
   - Para USA (mejor latencia): `us-central1` (Iowa)
   - Para USA Este: `us-east1` (Carolina del Sur)
4. Modo: Selecciona "Modo de producción" (importaremos las reglas después)
5. Haz clic en "Crear"

⚠️ **NOTA**: Una vez creada, **NO podrás cambiar la región de Firestore**

### Paso 2.3: Configurar Storage

1. En el menú lateral, ve a **Storage**
2. Haz clic en "Comenzar"
3. Selecciona la **misma región** que elegiste para Firestore
4. Acepta las reglas predeterminadas (las cambiaremos después)

### Paso 2.4: Configurar Authentication

1. En el menú lateral, ve a **Authentication**
2. Haz clic en "Comenzar"
3. Habilita los métodos de autenticación que usas:
   - **Correo electrónico/contraseña**: Activar
   - Otros proveedores si los usas (Google, Facebook, etc.)

### Paso 2.5: Obtener configuración del nuevo proyecto

1. Ve a **Configuración del proyecto** (ícono de engranaje)
2. En la sección "Tus apps", haz clic en el ícono web (`</>`)
3. Registra tu aplicación web:
   - Nombre: "Red UC Web"
   - **NO** marcar "Configurar Firebase Hosting" (lo haremos después)
4. **Copia la configuración** (la necesitarás más adelante):

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};
```

---

## 3. Exportar Datos del Proyecto Actual

### Paso 3.1: Instalar dependencias para scripts

```bash
cd cadena-favores-uc
npm install
```

### Paso 3.2: Configurar script de exportación

1. Abre el archivo `scripts/exportar-datos.js`
2. Reemplaza la configuración de Firebase con **tu configuración ACTUAL** (proyecto actual: red-uc-8c043)
3. **NUNCA** subas este archivo con tus credenciales a Git

### Paso 3.3: Ejecutar exportación

```bash
node scripts/exportar-datos.js
```

Este script creará una carpeta `firebase-export/export-FECHA/` con:
- ✅ `favores.json` - Todos los favores
- ✅ `usuarios.json` - Todos los usuarios
- ✅ `anuncios.json` - Todos los anuncios
- ✅ `marketplace.json` - Todos los productos
- ✅ `calificaciones.json` - Todas las calificaciones
- ✅ `feedback.json` - Todo el feedback
- ✅ `datos-completos.json` - Archivo consolidado
- ✅ `metadatos.json` - Información de la exportación

### Paso 3.4: Verificar exportación

Revisa los archivos JSON generados:
- Abre `metadatos.json` para ver estadísticas
- Verifica que los contadores coincidan con lo esperado
- Abre algunos archivos individuales para confirmar que los datos se exportaron correctamente

---

## 4. Configurar Nuevo Proyecto

### Paso 4.1: Inicializar Firebase CLI con el nuevo proyecto

```bash
firebase login
firebase use --add
```

- Selecciona tu **nuevo proyecto** de la lista
- Alias: `nuevo` (o el que prefieras)

### Paso 4.2: Implementar reglas de seguridad de Firestore

```bash
firebase deploy --only firestore:rules
```

Este comando despliega el archivo `firestore.rules` actual al nuevo proyecto.

### Paso 4.3: Implementar reglas de seguridad de Storage

```bash
firebase deploy --only storage:rules
```

### Paso 4.4: Implementar índices de Firestore

```bash
firebase deploy --only firestore:indexes
```

---

## 5. Importar Datos al Nuevo Proyecto

### Paso 5.1: Configurar script de importación

1. Abre el archivo `scripts/importar-datos.js`
2. Reemplaza la configuración con la del **NUEVO proyecto** (la que copiaste en el Paso 2.5)

### Paso 5.2: Ejecutar importación

```bash
node scripts/importar-datos.js
```

Este script:
- Lee los archivos de `firebase-export/`
- Restaura timestamps correctamente
- Importa todos los documentos al nuevo proyecto
- Muestra un resumen de documentos importados y errores

### Paso 5.3: Verificar datos importados

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu **nuevo proyecto**
3. Ve a **Firestore Database**
4. Verifica que todas las colecciones estén presentes:
   - [ ] favores
   - [ ] usuarios
   - [ ] anuncios
   - [ ] marketplace
   - [ ] calificaciones
   - [ ] feedback
5. Abre algunos documentos aleatoriamente para verificar integridad

---

## 6. Migrar Usuarios de Firebase Auth

⚠️ **IMPORTANTE**: La migración de usuarios de Authentication requiere Firebase CLI y acceso administrativo.

### Opción A: Exportar e Importar Usuarios (Recomendado)

#### Paso 6.1: Exportar usuarios del proyecto actual

```bash
firebase use red-uc-8c043  # Cambiar al proyecto actual
firebase auth:export usuarios-backup.json --format=json
```

#### Paso 6.2: Importar usuarios al nuevo proyecto

```bash
firebase use nuevo  # Cambiar al nuevo proyecto
firebase auth:import usuarios-backup.json --hash-algo=SCRYPT
```

#### Paso 6.3: Verificar usuarios migrados

```bash
firebase auth:export usuarios-verificacion.json --format=json
```

Compara `usuarios-backup.json` con `usuarios-verificacion.json`

### Opción B: Dejar que usuarios restablezcan contraseñas

Si tienes pocos usuarios o prefieres una migración gradual:

1. Los usuarios usan "Olvidé mi contraseña" en el nuevo sistema
2. Reciben email para restablecer contraseña
3. Crean nueva contraseña y continúan usando la app

---

## 7. Migrar Archivos de Storage

### Paso 7.1: Descargar archivos del Storage actual

#### Opción A: Usando Firebase CLI

```bash
firebase use red-uc-8c043
mkdir storage-backup
firebase storage:get /anuncios storage-backup/anuncios
firebase storage:get /marketplace storage-backup/marketplace
```

#### Opción B: Usando gsutil (Google Cloud SDK)

```bash
# Instalar Google Cloud SDK si no lo tienes
# https://cloud.google.com/sdk/docs/install

# Autenticarse
gcloud auth login

# Descargar archivos
gsutil -m cp -r gs://red-uc-8c043.appspot.com/anuncios ./storage-backup/
gsutil -m cp -r gs://red-uc-8c043.appspot.com/marketplace ./storage-backup/
```

### Paso 7.2: Subir archivos al nuevo Storage

```bash
firebase use nuevo

# Usando Firebase CLI
firebase storage:upload storage-backup/anuncios /anuncios
firebase storage:upload storage-backup/marketplace /marketplace

# O usando gsutil
gsutil -m cp -r ./storage-backup/anuncios gs://NUEVO-PROJECT-ID.appspot.com/
gsutil -m cp -r ./storage-backup/marketplace gs://NUEVO-PROJECT-ID.appspot.com/
```

### Paso 7.3: Verificar archivos

1. Ve a Firebase Console → Storage del nuevo proyecto
2. Verifica que las carpetas existan:
   - `/anuncios/`
   - `/marketplace/`
3. Verifica algunos archivos aleatoriamente

---

## 8. Actualizar Código de la Aplicación

### Paso 8.1: Actualizar firebaseConfig.js

Abre `src/firebaseConfig.js` y reemplaza la configuración:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// NUEVA configuración del proyecto migrado
const firebaseConfig = {
  apiKey: "NUEVA_API_KEY",
  authDomain: "NUEVO-PROJECT-ID.firebaseapp.com",
  projectId: "NUEVO-PROJECT-ID",
  storageBucket: "NUEVO-PROJECT-ID.firebasestorage.app",
  messagingSenderId: "NUEVO_SENDER_ID",
  appId: "NUEVO_APP_ID",
  measurementId: "NUEVO_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

### Paso 8.2: Actualizar .firebaserc

Abre `.firebaserc` y actualiza el proyecto predeterminado:

```json
{
  "projects": {
    "default": "NUEVO-PROJECT-ID",
    "antiguo": "red-uc-8c043",
    "nuevo": "NUEVO-PROJECT-ID"
  }
}
```

### Paso 8.3: Crear archivo .env con nuevas credenciales

Si usas variables de entorno, actualiza tu archivo `.env`:

```bash
VITE_FIREBASE_API_KEY=NUEVA_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=NUEVO-PROJECT-ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=NUEVO-PROJECT-ID
VITE_FIREBASE_STORAGE_BUCKET=NUEVO-PROJECT-ID.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=NUEVO_SENDER_ID
VITE_FIREBASE_APP_ID=NUEVO_APP_ID
```

### Paso 8.4: Commit de cambios

```bash
git add .
git commit -m "Migración a nuevo proyecto Firebase con región actualizada"
```

---

## 9. Verificación y Pruebas

### Paso 9.1: Pruebas locales

```bash
npm run dev
```

Verifica:
- [ ] La app carga correctamente
- [ ] Puedes iniciar sesión con usuarios migrados
- [ ] Los favores se cargan correctamente
- [ ] Los anuncios se muestran
- [ ] El marketplace funciona
- [ ] Las imágenes se cargan (Storage)
- [ ] Puedes publicar nuevo favor
- [ ] Puedes responder a favores
- [ ] Las calificaciones funcionan

### Paso 9.2: Verificar reglas de seguridad

En Firebase Console:
1. Ve a **Firestore Database → Reglas**
2. Verifica que las reglas estén activas
3. Ve a **Storage → Reglas**
4. Verifica que las reglas estén activas

### Paso 9.3: Monitorear errores

1. Ve a **Firestore Database**
2. Observa si hay errores de permisos en tiempo real
3. Revisa la consola del navegador

---

## 10. Desplegar a Producción

### Paso 10.1: Build de producción

```bash
npm run build
```

### Paso 10.2: Desplegar a Firebase Hosting (si lo usas)

```bash
firebase deploy --only hosting
```

### Paso 10.3: Verificar deployment

Visita tu URL de producción y repite las pruebas del Paso 9.

---

## 11. Eliminar Proyecto Antiguo (Opcional)

⚠️ **SOLO después de confirmar que todo funciona correctamente**

1. Espera al menos **1 semana** con el nuevo proyecto en producción
2. Verifica que no haya problemas
3. Ve a [Firebase Console](https://console.firebase.google.com/)
4. Selecciona el proyecto antiguo `red-uc-8c043`
5. Ve a **Configuración del proyecto**
6. En la parte inferior, haz clic en "Eliminar proyecto"
7. Confirma la eliminación

---

## 📊 Checklist Final

### Antes de migrar
- [ ] Backup completo del código
- [ ] Backup de configuraciones
- [ ] Revisión de datos actuales

### Durante la migración
- [ ] Nuevo proyecto creado con región correcta
- [ ] Datos de Firestore exportados
- [ ] Usuarios de Auth exportados
- [ ] Archivos de Storage descargados
- [ ] Datos importados al nuevo proyecto
- [ ] Usuarios migrados
- [ ] Archivos de Storage subidos
- [ ] Reglas de seguridad implementadas
- [ ] Código actualizado con nueva configuración

### Después de migrar
- [ ] Pruebas locales completas
- [ ] Pruebas de autenticación
- [ ] Verificación de Storage
- [ ] Deploy a producción
- [ ] Monitoreo de errores por 1 semana
- [ ] Eliminación de proyecto antiguo (opcional)

---

## 🆘 Solución de Problemas

### Problema: "Permission denied" al importar datos

**Solución**: Verifica que las reglas de Firestore permitan escritura. Temporalmente puedes usar:

```javascript
allow read, write: if true;  // SOLO para migración
```

Recuerda restaurar las reglas de seguridad después.

### Problema: Los timestamps no se importan correctamente

**Solución**: El script de importación maneja esto automáticamente. Si ves fechas incorrectas, verifica que uses `deserializarDatos()`.

### Problema: Usuarios no pueden iniciar sesión después de migración

**Solución**:
1. Verifica que la importación de Auth fue exitosa
2. Revisa que el hash algorithm sea correcto (`SCRYPT`)
3. Como último recurso, permite que usuarios restablezcan contraseñas

### Problema: Imágenes no se cargan

**Solución**:
1. Verifica que las rutas en Storage sean correctas
2. Revisa las reglas de Storage
3. Confirma que las URLs en Firestore apunten al nuevo bucket

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de Firebase Console
2. Revisa la consola del navegador
3. Verifica que todas las configuraciones estén correctas
4. Consulta la documentación de Firebase: https://firebase.google.com/docs

---

## 📝 Notas Importantes

- **Los UIDs de usuarios se mantienen** durante la migración
- **Las referencias entre documentos se preservan** (ejemplo: favorId, usuarioId)
- **Las URLs de Storage cambiarán** al nuevo bucket
- **La migración NO afecta** tu código Git
- **Puedes hacer rollback** usando el proyecto antiguo si algo falla

---

¡Buena suerte con la migración! 🚀
