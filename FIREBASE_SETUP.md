# Guía de Integración Firebase - Red UC

Esta guía explica cómo está configurado Firebase en el proyecto y cómo usar los servicios creados.

## 📁 Estructura de Archivos

```
src/
├── firebaseConfig.js           # Configuración de Firebase
├── services/
│   ├── authService.js          # Servicio de autenticación
│   ├── userService.js          # Servicio de usuarios
│   └── favorService.js         # Servicio de favores
```

## 🔧 Configuración Inicial

### 1. Instalar dependencias de Firebase

```bash
npm install firebase
```

### 2. Configurar Firebase en tu proyecto

El archivo `firebaseConfig.js` ya está configurado con tu proyecto Firebase. Exporta:
- `app`: Instancia de Firebase
- `auth`: Autenticación
- `db`: Firestore (base de datos)
- `analytics`: Analytics

## 📚 Estructura de Firestore

### Colección: `usuarios`
```javascript
{
  nombre: "Juan Pérez",
  email: "juan@uc.cl",
  carrera: "Ingeniería",
  año: 3,
  intereses: ["Matemáticas", "Programación"],
  descripcion: "Estudiante de ingeniería...",
  reputacion: 5.0,
  favoresPublicados: ["favorId1", "favorId2"],
  favoresCompletados: ["favorId3"],
  fechaRegistro: Timestamp
}
```

### Colección: `favores`
```javascript
{
  titulo: "Ayuda con cálculo",
  descripcion: "Necesito ayuda con límites",
  categoria: "academico",
  disponibilidad: "Lunes y miércoles",
  usuarioId: "userId123",
  nombreUsuario: "Juan Pérez",
  emailUsuario: "juan@uc.cl",
  fecha: Timestamp,
  estado: "activo", // o "completado"
  respuestas: [
    {
      usuarioId: "userId456",
      nombreUsuario: "María García",
      emailUsuario: "maria@uc.cl",
      fecha: Date
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🔐 Servicio de Autenticación (authService.js)

### Registrar un nuevo usuario

```javascript
import { registerUser } from './services/authService';

const handleRegister = async () => {
  try {
    const user = await registerUser('correo@uc.cl', 'password123', {
      nombre: 'Juan Pérez',
      carrera: 'Ingeniería',
      año: 3,
      intereses: ['Matemáticas', 'Programación'],
      descripcion: 'Estudiante de ingeniería'
    });
    console.log('Usuario registrado:', user);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Iniciar sesión

```javascript
import { loginUser } from './services/authService';

const handleLogin = async () => {
  try {
    const user = await loginUser('correo@uc.cl', 'password123');
    console.log('Sesión iniciada:', user);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Cerrar sesión

```javascript
import { logoutUser } from './services/authService';

const handleLogout = async () => {
  try {
    await logoutUser();
    console.log('Sesión cerrada');
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Escuchar cambios de autenticación

```javascript
import { onAuthChange } from './services/authService';

useEffect(() => {
  const unsubscribe = onAuthChange((user) => {
    if (user) {
      console.log('Usuario autenticado:', user);
    } else {
      console.log('No hay usuario autenticado');
    }
  });

  return () => unsubscribe();
}, []);
```

## 👤 Servicio de Usuarios (userService.js)

### Obtener datos de un usuario

```javascript
import { getUserData } from './services/userService';

const userData = await getUserData(userId);
console.log(userData);
```

### Actualizar datos de usuario

```javascript
import { updateUserData } from './services/userService';

await updateUserData(userId, {
  carrera: 'Ingeniería Civil',
  año: 4,
  descripcion: 'Nueva descripción'
});
```

### Buscar usuarios por carrera

```javascript
import { getUsersByCarrera } from './services/userService';

const usuarios = await getUsersByCarrera('Ingeniería');
console.log(usuarios);
```

## 📋 Servicio de Favores (favorService.js)

### Publicar un nuevo favor

```javascript
import { publicarFavor } from './services/favorService';
import { getCurrentUser } from './services/authService';

const handlePublicar = async () => {
  const user = getCurrentUser();

  const favor = {
    titulo: 'Ayuda con cálculo',
    descripcion: 'Necesito ayuda con límites',
    categoria: 'academico',
    disponibilidad: 'Lunes y miércoles'
  };

  try {
    const favorId = await publicarFavor(favor, user);
    console.log('Favor publicado con ID:', favorId);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Obtener todos los favores

```javascript
import { obtenerFavores } from './services/favorService';

const favores = await obtenerFavores();
console.log(favores);
```

### Filtrar favores por categoría

```javascript
import { obtenerFavoresPorCategoria } from './services/favorService';

const favores = await obtenerFavoresPorCategoria('academico');
console.log(favores);
```

### Responder a un favor

```javascript
import { responderFavor } from './services/favorService';
import { getCurrentUser } from './services/authService';

const handleResponder = async (favorId) => {
  const user = getCurrentUser();

  try {
    await responderFavor(favorId, user);
    console.log('Respuesta enviada');
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Completar un favor

```javascript
import { completarFavor } from './services/favorService';

await completarFavor(favorId, userId);
```

### Eliminar un favor

```javascript
import { eliminarFavor } from './services/favorService';

await eliminarFavor(favorId);
```

### Buscar favores

```javascript
import { buscarFavores } from './services/favorService';

const resultados = await buscarFavores('matemáticas');
console.log(resultados);
```

## 🔒 Reglas de Seguridad

Las reglas de seguridad están configuradas en `firestore.rules`:

### Favores
- **Lectura**: Todos pueden leer (incluso sin autenticación)
- **Crear**: Solo usuarios autenticados
- **Actualizar**: Solo el creador del favor
- **Eliminar**: Solo el creador del favor

### Usuarios
- **Lectura**: Solo usuarios autenticados
- **Crear**: Solo el propio usuario
- **Actualizar**: Solo el propio usuario
- **Eliminar**: No permitido

## 🚀 Desplegar Reglas de Seguridad

Para desplegar las reglas de seguridad a Firebase:

```bash
firebase deploy --only firestore:rules
```

## 📝 Ejemplo de Integración en un Componente React

```javascript
import React, { useState, useEffect } from 'react';
import { obtenerFavores } from './services/favorService';
import { getCurrentUser } from './services/authService';

const ListaFavores = () => {
  const [favores, setFavores] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    const cargarFavores = async () => {
      try {
        const data = await obtenerFavores();
        setFavores(data);
      } catch (error) {
        console.error('Error al cargar favores:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarFavores();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Favores Disponibles</h2>
      {favores.map((favor) => (
        <div key={favor.id}>
          <h3>{favor.titulo}</h3>
          <p>{favor.descripcion}</p>
          <p>Publicado por: {favor.nombreUsuario}</p>
          <p>Fecha: {favor.fecha}</p>
        </div>
      ))}
    </div>
  );
};

export default ListaFavores;
```

## ⚠️ Manejo de Errores

Todos los servicios lanzan errores que debes capturar:

```javascript
try {
  await publicarFavor(favor, user);
} catch (error) {
  if (error.code === 'permission-denied') {
    console.error('No tienes permisos para esta acción');
  } else if (error.code === 'unauthenticated') {
    console.error('Debes iniciar sesión');
  } else {
    console.error('Error:', error.message);
  }
}
```

## 📊 Próximos Pasos

1. ✅ Integrar los servicios en tu contexto de autenticación existente
2. ✅ Actualizar los componentes para usar los servicios de Firebase
3. ✅ Implementar la autenticación con Firebase Auth
4. ✅ Desplegar las reglas de seguridad
5. 🔄 Agregar índices compuestos si Firestore los solicita
6. 🔄 Implementar paginación para listas largas
7. 🔄 Agregar notificaciones en tiempo real con `onSnapshot`

## 🆘 Soporte

Si encuentras algún problema, revisa:
1. La consola de Firebase para ver errores
2. Las reglas de seguridad en Firestore
3. Que el usuario esté autenticado antes de realizar operaciones
4. Los logs de la consola del navegador
