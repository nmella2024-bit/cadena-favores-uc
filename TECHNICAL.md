# 🔧 Documentación Técnica - Red UC

## 📋 Índice

1. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
2. [Componentes Principales](#componentes-principales)
3. [Manejo de Estado](#manejo-de-estado)
4. [Rutas y Navegación](#rutas-y-navegación)
5. [Persistencia de Datos](#persistencia-de-datos)
6. [Próximos Pasos](#próximos-pasos)

---

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico

```
Frontend Framework: React 18
Routing: React Router DOM v6
Styling: TailwindCSS 3
Build Tool: Vite 5
State Management: Context API
Data Persistence: LocalStorage (temporal)
```

### Estructura de Carpetas

```
src/
├── components/       # Componentes reutilizables
│   ├── Navbar.jsx   # Barra de navegación principal
│   ├── Footer.jsx   # Pie de página
│   ├── Layout.jsx   # Layout wrapper
│   └── FavorCard.jsx # Tarjeta individual de favor
│
├── pages/           # Páginas principales (rutas)
│   ├── Home.jsx     # Landing page
│   ├── Login.jsx    # Página de inicio de sesión
│   ├── Registro.jsx # Página de registro
│   ├── Favores.jsx  # Lista de favores con filtros
│   ├── PublicarFavor.jsx # Formulario para publicar
│   └── Perfil.jsx   # Perfil de usuario
│
├── context/         # Context API
│   └── AuthContext.jsx # Contexto global de autenticación
│
├── data/            # Datos y configuración
│   └── mockData.js  # Datos simulados y categorías
│
├── App.jsx          # Componente raíz con rutas
├── main.jsx         # Entry point
└── index.css        # Estilos globales + Tailwind
```

---

## 🧩 Componentes Principales

### 1. AuthContext (`src/context/AuthContext.jsx`)

**Responsabilidades:**
- Manejo de autenticación de usuario
- Estado global de usuarios y favores
- Funciones de registro, login, logout
- Publicación y eliminación de favores
- Persistencia en localStorage

**API expuesta:**

```javascript
const {
  currentUser,      // Usuario actualmente autenticado
  users,            // Lista de todos los usuarios
  favors,           // Lista de todos los favores
  register,         // Función de registro
  login,            // Función de login
  logout,           // Función de logout
  publishFavor,     // Publicar nuevo favor
  respondToFavor,   // Responder a un favor
  deleteFavor,      // Eliminar favor propio
} = useAuth();
```

**Ejemplo de uso:**

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { currentUser, favors, publishFavor } = useAuth();

  const handlePublish = () => {
    publishFavor({
      titulo: "Ayuda con Cálculo",
      descripcion: "Necesito ayuda...",
      categoria: "academico",
      disponibilidad: "Lunes a viernes"
    });
  };
}
```

### 2. Layout (`src/components/Layout.jsx`)

Wrapper que envuelve todas las páginas y proporciona estructura consistente.

```javascript
<Layout>
  <Navbar />
  <main>{children}</main>
  <Footer />
</Layout>
```

### 3. FavorCard (`src/components/FavorCard.jsx`)

Componente reutilizable para mostrar favores individuales.

**Props:**
- `favor`: Objeto con datos del favor

**Features:**
- Muestra información del favor
- Botones condicionales según usuario
- Acciones: Responder, Eliminar
- Estados visuales (activo/completado)

---

## 🔄 Manejo de Estado

### Context API

Usamos React Context API para manejar estado global:

```javascript
// Provider en App.jsx
<AuthProvider>
  <Router>
    <Layout>
      <Routes>...</Routes>
    </Layout>
  </Router>
</AuthProvider>

// Consumo en componentes
const { currentUser, favors } = useAuth();
```

### LocalStorage

Los datos se persisten en `localStorage` con estas keys:

```javascript
'reduc_currentUser'  // Usuario actual
'reduc_users'        // Array de usuarios
'reduc_favors'       // Array de favores
```

**Nota:** En producción, esto debe ser reemplazado por un backend real.

---

## 🗺️ Rutas y Navegación

### Configuración de Rutas

```javascript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/registro" element={<Registro />} />
  <Route path="/favores" element={<Favores />} />
  <Route path="/publicar" element={<PublicarFavor />} />
  <Route path="/perfil" element={<Perfil />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### Rutas Protegidas

Las páginas que requieren autenticación verifican `currentUser`:

```javascript
React.useEffect(() => {
  if (!currentUser) {
    navigate('/login');
  }
}, [currentUser, navigate]);
```

---

## 💾 Persistencia de Datos

### Modelo de Datos

#### Usuario

```javascript
{
  id: number,
  nombre: string,
  correo: string,        // Debe terminar en @uc.cl
  password: string,      // En producción: hashear
  carrera: string,
  año: number,
  intereses: string[],
  descripcion: string,
  favoresPublicados: number[],
  favoresRespondidos: number[]
}
```

#### Favor

```javascript
{
  id: number,
  titulo: string,
  descripcion: string,
  categoria: 'academico' | 'material' | 'tramite' | 'tutoria' | 'otro',
  solicitante: string,
  solicitanteId: number,
  disponibilidad: string,
  fecha: string,         // ISO date
  estado: 'activo' | 'completado',
  respondidoPor?: number
}
```

#### Categorías

```javascript
{
  id: string,
  name: string,
  icon: string  // emoji
}
```

---

## 🎨 Guía de Estilos

### Colores TailwindCSS

```javascript
// tailwind.config.js
colors: {
  'uc-blue': '#0033A0',
  'uc-blue-light': '#0051C3',
  'uc-blue-dark': '#002270',
  'mint': '#00BFA6',
  'mint-light': '#4DDCC7',
}
```

### Clases Personalizadas

```css
/* src/index.css */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Convenciones de Diseño

- **Bordes redondeados:** `rounded-lg` (8px) o `rounded-xl` (12px)
- **Sombras:** `shadow-md` para cards, `shadow-xl` para modales
- **Espaciado:** `gap-4`, `p-6`, `mb-8`
- **Transiciones:** Usar `transition-smooth` para hover states

---

## 🔮 Próximos Pasos

### Backend Integration (TODO)

```javascript
// Ejemplo: Reemplazar AuthContext con API calls

const login = async (email, password) => {
  // TODO: Replace with real API call
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  setCurrentUser(data.user);
  localStorage.setItem('token', data.token);
};
```

### Features Sugeridas

1. **Sistema de Puntos/Reputación**
```javascript
// Agregar a User model
{
  points: number,
  reputation: number,
  level: 'novato' | 'bronce' | 'plata' | 'oro'
}
```

2. **Chat Interno**
```javascript
// Nuevo componente: src/components/Chat.jsx
// Usar WebSockets para mensajería en tiempo real
```

3. **Notificaciones**
```javascript
// Agregar Service Worker para push notifications
// Notificar cuando alguien responde a tu favor
```

4. **Búsqueda Avanzada**
```javascript
// Agregar filtros adicionales
- Por fecha
- Por disponibilidad
- Por usuario
- Por palabras clave en tags
```

---

## 🧪 Testing (Futuro)

### Stack sugerido

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Estructura de tests

```
src/
├── components/
│   ├── Navbar.jsx
│   └── Navbar.test.jsx
├── pages/
│   ├── Home.jsx
│   └── Home.test.jsx
```

---

## 📝 Convenciones de Código

### Naming Conventions

- **Componentes:** PascalCase (`FavorCard.jsx`)
- **Funciones:** camelCase (`handleSubmit`)
- **Constantes:** UPPER_SNAKE_CASE (`API_URL`)
- **Archivos CSS:** kebab-case (`index.css`)

### Imports Order

```javascript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { Link, useNavigate } from 'react-router-dom';

// 3. Context & hooks
import { useAuth } from '../context/AuthContext';

// 4. Components
import FavorCard from '../components/FavorCard';

// 5. Data & constants
import { categories } from '../data/mockData';

// 6. Styles (if needed)
import './styles.css';
```

### Component Structure

```javascript
// 1. Component definition
const MyComponent = ({ prop1, prop2 }) => {
  // 2. Hooks
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [state, setState] = useState(initial);

  // 3. Effects
  useEffect(() => {
    // side effects
  }, [dependencies]);

  // 4. Event handlers
  const handleClick = () => {
    // logic
  };

  // 5. Render logic
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

---

## 🔐 Seguridad (Producción)

### Checklist

- [ ] Hashear passwords con bcrypt/argon2
- [ ] Implementar JWT o sesiones seguras
- [ ] Validar inputs en frontend y backend
- [ ] Sanitizar HTML user-generated content
- [ ] Implementar CORS correctamente
- [ ] Rate limiting en API
- [ ] HTTPS obligatorio
- [ ] Content Security Policy
- [ ] Verificación de email UC real

---

## 📞 Contacto Técnico

Para preguntas técnicas o contribuciones:

- Email: dev@reduc.cl
- GitHub: [github.com/red-uc](https://github.com/red-uc)

---

**Última actualización:** Octubre 2025
