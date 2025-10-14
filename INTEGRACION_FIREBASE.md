# 🔥 Integración Firebase Completada - Red UC

## ✅ Lo que se ha implementado

### 1. Configuración de Firebase

**Archivo:** [src/firebaseConfig.js](src/firebaseConfig.js)

Se configuró Firebase con:
- ✅ Firebase Authentication
- ✅ Cloud Firestore (base de datos)
- ✅ Analytics
- ✅ Exportación de instancias (`auth`, `db`, `app`, `analytics`)

### 2. Servicios Creados

#### 📁 [src/services/authService.js](src/services/authService.js)
Servicio completo de autenticación con:
- `registerUser()` - Registrar nuevos usuarios
- `loginUser()` - Iniciar sesión
- `logoutUser()` - Cerrar sesión
- `onAuthChange()` - Escuchar cambios de autenticación
- `getCurrentUser()` - Obtener usuario actual

#### 👤 [src/services/userService.js](src/services/userService.js)
Gestión de perfiles de usuario con:
- `createUserDocument()` - Crear perfil en Firestore
- `getUserData()` - Obtener datos de usuario
- `updateUserData()` - Actualizar perfil
- `addFavorToUser()` - Agregar favor publicado
- `markFavorAsCompleted()` - Marcar favor completado
- `getUsersByCarrera()` - Buscar usuarios por carrera

#### 📋 [src/services/favorService.js](src/services/favorService.js)
Gestión completa de favores con:
- `publicarFavor()` - Publicar nuevo favor
- `obtenerFavores()` - Obtener todos los favores
- `obtenerFavorPorId()` - Obtener favor específico
- `obtenerFavoresPorUsuario()` - Favores de un usuario
- `obtenerFavoresPorCategoria()` - Filtrar por categoría
- `responderFavor()` - Responder a un favor
- `completarFavor()` - Marcar como completado
- `eliminarFavor()` - Eliminar favor
- `actualizarFavor()` - Actualizar datos
- `buscarFavores()` - Buscar por texto

### 3. Reglas de Seguridad

**Archivo:** [firestore.rules](firestore.rules)

✅ Configuradas reglas de seguridad para:

**Colección `favores`:**
- 👀 Lectura pública (todos pueden ver)
- ✍️ Creación: solo usuarios autenticados
- 📝 Actualización: solo el creador
- 🗑️ Eliminación: solo el creador

**Colección `usuarios`:**
- 👀 Lectura: solo usuarios autenticados
- ✍️ Creación: solo el propio usuario
- 📝 Actualización: solo el propio usuario
- 🗑️ Eliminación: no permitida

### 4. Índices de Firestore

**Archivo:** [firestore.indexes.json](firestore.indexes.json)

✅ Configurados índices compuestos para:
- Filtrar por categoría, estado y ordenar por fecha
- Obtener favores de un usuario ordenados por fecha
- Filtrar por estado y ordenar por fecha

### 5. Scripts de Despliegue

**Windows:** [deploy-firebase.ps1](deploy-firebase.ps1)
**Linux/Mac:** [deploy-firebase.sh](deploy-firebase.sh)

Despliegan automáticamente:
- Reglas de seguridad
- Índices de Firestore

## 📚 Documentación

Lee la [Guía Completa de Firebase](FIREBASE_SETUP.md) para:
- Ejemplos de uso de cada función
- Integración en componentes React
- Manejo de errores
- Estructura de datos
- Ejemplos completos de código

## 🚀 Próximos Pasos

### 1. Desplegar Configuración a Firebase

**En Windows (PowerShell):**
```powershell
.\deploy-firebase.ps1
```

**En Linux/Mac:**
```bash
chmod +x deploy-firebase.sh
./deploy-firebase.sh
```

**O manualmente:**
```bash
firebase login
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 2. Actualizar el Contexto de Autenticación

Reemplaza el mock actual de `AuthContext` con los servicios de Firebase:

```javascript
// src/context/AuthContext.jsx
import { onAuthChange } from '../services/authService';
import { getUserData } from '../services/userService';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Obtener datos completos del usuario desde Firestore
        const userData = await getUserData(firebaseUser.uid);
        setCurrentUser({ ...firebaseUser, ...userData });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ... resto del código
};
```

### 3. Integrar en los Componentes

#### Ejemplo: Página de Registro
```javascript
// src/pages/Registro.jsx
import { registerUser } from '../services/authService';

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await registerUser(formData.correo, formData.password, {
      nombre: formData.nombre,
      carrera: formData.carrera,
      año: formData.año,
      intereses: formData.intereses.split(','),
      descripcion: formData.descripcion
    });
    navigate('/favores');
  } catch (error) {
    setError(error.message);
  }
};
```

#### Ejemplo: Página de Login
```javascript
// src/pages/Login.jsx
import { loginUser } from '../services/authService';

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await loginUser(email, password);
    navigate('/favores');
  } catch (error) {
    setError('Credenciales inválidas');
  }
};
```

#### Ejemplo: Publicar Favor
```javascript
// src/pages/PublicarFavor.jsx
import { publicarFavor } from '../services/favorService';
import { getCurrentUser } from '../services/authService';

const handleSubmit = async (e) => {
  e.preventDefault();
  const user = getCurrentUser();

  try {
    const favorId = await publicarFavor(formData, user);
    alert('¡Favor publicado exitosamente!');
    navigate('/favores');
  } catch (error) {
    setError(error.message);
  }
};
```

#### Ejemplo: Lista de Favores
```javascript
// src/pages/Favores.jsx
import { obtenerFavores } from '../services/favorService';

const [favores, setFavores] = useState([]);

useEffect(() => {
  const cargarFavores = async () => {
    try {
      const data = await obtenerFavores();
      setFavores(data);
    } catch (error) {
      console.error('Error al cargar favores:', error);
    }
  };

  cargarFavores();
}, []);
```

### 4. Configurar Variables de Entorno (Opcional pero Recomendado)

Crea un archivo `.env` para proteger tus credenciales:

```env
VITE_FIREBASE_API_KEY=AIzaSyAKoXS4QXnf-7MtCQk_pnNaa3anfsJ3dSU
VITE_FIREBASE_AUTH_DOMAIN=red-uc-8c043.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=red-uc-8c043
VITE_FIREBASE_STORAGE_BUCKET=red-uc-8c043.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=164069116151
VITE_FIREBASE_APP_ID=1:164069116151:web:5564c7bc858ee678d96bf2
VITE_FIREBASE_MEASUREMENT_ID=G-VBRSLB5Q5V
```

Y actualiza `firebaseConfig.js`:

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

Añade `.env` a tu `.gitignore`.

## 🎯 Checklist de Integración

- [x] Configurar Firebase en el proyecto
- [x] Crear servicios de autenticación
- [x] Crear servicios de usuarios
- [x] Crear servicios de favores
- [x] Configurar reglas de seguridad
- [x] Configurar índices de Firestore
- [x] Crear documentación completa
- [ ] Desplegar reglas e índices a Firebase
- [ ] Actualizar AuthContext con servicios reales
- [ ] Integrar servicios en página de registro
- [ ] Integrar servicios en página de login
- [ ] Integrar servicios en página de publicar favor
- [ ] Integrar servicios en página de lista de favores
- [ ] Integrar servicios en página de perfil
- [ ] Agregar validación de correo UC (@uc.cl)
- [ ] Implementar notificaciones en tiempo real
- [ ] Agregar sistema de calificaciones
- [ ] Implementar búsqueda avanzada

## 📊 Estructura de Datos en Firestore

### Colección: `usuarios/{userId}`
```javascript
{
  nombre: string,
  email: string,
  carrera: string,
  año: number,
  intereses: string[],
  descripcion: string,
  reputacion: number,
  favoresPublicados: string[],
  favoresCompletados: string[],
  fechaRegistro: Timestamp
}
```

### Colección: `favores/{favorId}`
```javascript
{
  titulo: string,
  descripcion: string,
  categoria: string,
  disponibilidad: string,
  usuarioId: string,
  nombreUsuario: string,
  emailUsuario: string,
  fecha: Timestamp,
  estado: "activo" | "completado",
  respuestas: [{
    usuarioId: string,
    nombreUsuario: string,
    emailUsuario: string,
    fecha: Date
  }],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🆘 Resolución de Problemas

### Error: "Missing or insufficient permissions"
**Solución:** Verifica que las reglas de seguridad estén desplegadas correctamente y que el usuario esté autenticado.

### Error: "The query requires an index"
**Solución:** Firebase te dará un link para crear el índice automáticamente, o despliega los índices del archivo `firestore.indexes.json`.

### Error: "Network error"
**Solución:** Verifica tu conexión a internet y que el proyecto de Firebase esté activo en la consola.

### Los datos no se guardan
**Solución:** Revisa la consola del navegador para ver errores específicos. Verifica que el usuario esté autenticado antes de intentar guardar datos.

## 📞 Soporte

Para más información:
- 📖 [Documentación de Firebase](https://firebase.google.com/docs)
- 📖 [Guía completa del proyecto](FIREBASE_SETUP.md)
- 🔧 [Consola de Firebase](https://console.firebase.google.com)

---

**¡Todo listo para empezar a usar Firebase en tu aplicación!** 🎉
