# Guía de Administración

Esta guía explica cómo usar el sistema de roles de administrador implementado en la aplicación.

## Tabla de Contenidos

- [Roles Disponibles](#roles-disponibles)
- [Permisos por Rol](#permisos-por-rol)
- [Scripts de Administración](#scripts-de-administración)
- [Uso en el Código](#uso-en-el-código)

## Roles Disponibles

El sistema tiene tres roles de usuario:

### 1. **Admin** (Administrador)
- Permisos completos sobre todo el sistema
- Puede eliminar cualquier contenido
- Puede fijar favores y anuncios
- Puede gestionar reportes
- Ve logs de todas las acciones administrativas

### 2. **Exclusivo**
- Usuario con permisos especiales
- Puede fijar anuncios
- Acceso a funciones premium
- Publicar contenido destacado

### 3. **Normal**
- Usuario regular de la aplicación
- Puede crear y gestionar su propio contenido
- Solo puede eliminar su propio contenido

## Permisos por Rol

| Acción | Admin | Exclusivo | Normal |
|--------|-------|-----------|--------|
| Eliminar cualquier contenido | ✅ | ❌ | ❌ |
| Eliminar propio contenido | ✅ | ✅ | ✅ |
| Fijar favores | ✅ | ❌ | ❌ |
| Fijar anuncios | ✅ | ✅ | ❌ |
| Gestionar reportes | ✅ | ❌ | ❌ |
| Ver logs admin | ✅ | ❌ | ❌ |

## Scripts de Administración

### Prerequisitos

Asegúrate de tener el archivo `serviceAccountKey.json` en la raíz del proyecto con las credenciales de Firebase Admin SDK.

### 1. Verificar Usuario

Verifica si un usuario existe y muestra su información completa:

```bash
node scripts/verificar-usuario.cjs <email-del-usuario>
```

**Ejemplo:**
```bash
node scripts/verificar-usuario.cjs usuario@uc.cl
```

### 2. Crear Documento de Usuario

Si un usuario existe en Firebase Auth pero no en Firestore:

```bash
node scripts/crear-documento-usuario.cjs <email-del-usuario>
```

**Ejemplo:**
```bash
node scripts/crear-documento-usuario.cjs usuario@uc.cl
```

### 3. Asignar Rol de Administrador

Asigna rol de admin a un usuario existente:

```bash
node scripts/asignar-admin.cjs <email-del-usuario>
```

**Ejemplo:**
```bash
node scripts/asignar-admin.cjs admin@uc.cl
```

### 4. Cambiar Rol de Usuario

Cambia el rol de cualquier usuario:

```bash
node scripts/cambiar-rol.cjs <email-del-usuario> <nuevo-rol>
```

**Ejemplos:**
```bash
# Hacer a un usuario administrador
node scripts/cambiar-rol.cjs usuario@uc.cl admin

# Hacer a un usuario exclusivo
node scripts/cambiar-rol.cjs usuario@uc.cl exclusivo

# Convertir a usuario normal
node scripts/cambiar-rol.cjs usuario@uc.cl normal
```

### 5. Listar Usuarios

Lista todos los usuarios o filtra por rol:

```bash
# Listar todos los usuarios
node scripts/listar-usuarios.cjs

# Listar solo admins
node scripts/listar-usuarios.cjs admin

# Listar solo exclusivos
node scripts/listar-usuarios.cjs exclusivo

# Listar usuarios normales
node scripts/listar-usuarios.cjs normal
```

## Uso en el Código

### Importar Utilidades de Admin

```javascript
import {
  esAdmin,
  esExclusivo,
  puedeEliminar,
  puedeEditar,
  puedeFijar,
  validarAdmin
} from '../utils/adminUtils';
```

### Verificar si un Usuario es Admin

```javascript
import { esAdmin } from '../utils/adminUtils';

// En un componente o servicio
if (esAdmin(currentUser)) {
  console.log('Usuario es administrador');
}
```

### Verificar Permisos de Eliminación

```javascript
import { puedeEliminar } from '../utils/adminUtils';

// Verificar si puede eliminar contenido
if (puedeEliminar(currentUser, autorDelContenidoId)) {
  // Mostrar botón de eliminar
}
```

### Eliminar Contenido como Admin

Los servicios ya están actualizados para aceptar el objeto usuario completo:

```javascript
// Eliminar favor (funciona para admin y creador)
await eliminarFavor(favorId, currentUser.uid, currentUser);

// Eliminar anuncio
await eliminarAnuncio(anuncioId, currentUser.uid, currentUser);

// Eliminar material
await eliminarMaterial(materialId, currentUser.uid, currentUser);

// Eliminar producto
await eliminarProducto(productoId, currentUser.uid, currentUser);
```

### Fijar Contenido

```javascript
import { fijarFavor } from '../services/favorService';
import { fijarAnuncio } from '../services/anuncioService';

// Fijar favor (solo admin)
await fijarFavor(favorId, true, currentUser);

// Fijar anuncio (admin o exclusivo)
await fijarAnuncio(anuncioId, true, currentUser);
```

## Logs de Acciones Administrativas

Cuando un admin realiza una acción sobre contenido de otro usuario, se registra automáticamente en la consola:

```
[ADMIN] Usuario abc123 eliminó favor xyz789 del usuario def456
[ADMIN] Usuario abc123 fijó anuncio xyz789
```

Estos logs son útiles para auditoría y debugging.

## Estructura de Datos

### Usuario en Firestore

```javascript
{
  nombre: "Juan Pérez",
  email: "juan@uc.cl",
  carrera: "Ingeniería Comercial",
  rol: "admin", // "admin", "exclusivo", o "normal"
  // ... otros campos
}
```

## Seguridad

### Importante

1. **Cierre de Sesión**: Después de cambiar el rol de un usuario, este debe cerrar sesión y volver a iniciar sesión para que los cambios surtan efecto.

2. **Validación Client-Side**: Los permisos se validan en el cliente, pero también deben validarse en el servidor (Cloud Functions) para mayor seguridad.

3. **Service Account Key**: El archivo `serviceAccountKey.json` contiene credenciales sensibles. NUNCA lo subas al repositorio git (ya está en .gitignore).

4. **Logs de Auditoría**: Todas las acciones administrativas se registran con logs que incluyen el ID del admin y el contenido afectado.

## Próximos Pasos (Opcional)

Si quieres mejorar el sistema de administración:

1. **Panel de Admin**: Crear una interfaz web para gestionar usuarios y roles
2. **Cloud Functions**: Agregar validación de permisos en el backend
3. **Logs Persistentes**: Guardar logs de acciones admin en Firestore
4. **Notificaciones**: Notificar a usuarios cuando su contenido es eliminado por admin
5. **Reportes**: Sistema completo de gestión de reportes para admins

## Troubleshooting

### "No se encontró el usuario"
- Primero ejecuta `node scripts/verificar-usuario.cjs email@uc.cl` para diagnosticar
- Si existe en Auth pero no en Firestore, ejecuta `node scripts/crear-documento-usuario.cjs email@uc.cl`
- Asegúrate de usar el email exacto (case-sensitive)

### "Permission denied"
- Verifica que el `serviceAccountKey.json` esté en la raíz del proyecto
- Asegúrate de que las credenciales sean válidas

### Los cambios no se reflejan
- El usuario debe cerrar sesión y volver a iniciar sesión
- Verifica que el usuario esté usando `currentUser` del contexto de autenticación

## Contacto

Si tienes dudas o problemas con el sistema de administración, contacta al equipo de desarrollo.
