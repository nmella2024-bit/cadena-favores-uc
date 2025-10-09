# 🤝 Red UC - Red Universitaria de Favores

> **Red UC** es una plataforma colaborativa creada por y para estudiantes de la Pontificia Universidad Católica de Chile. Facilitamos el intercambio de favores académicos y ayuda estudiantil sin fines de lucro.

## 📝 Descripción

Red UC conecta estudiantes para intercambiar ayuda académica, material de estudio, tutorías y colaboraciones. La filosofía central es:

> "Nadie lo sabe todo, pero todos sabemos algo que puede ayudar a alguien."

### Características principales

- 🎓 **Clases particulares** entre estudiantes
- 📚 **Compartir apuntes** y material de estudio
- 📝 **Préstamo de material** universitario
- 🤝 **Colaboraciones** en proyectos
- 📋 **Ayuda con trámites** universitarios

## 🚀 Tecnologías utilizadas

- **React 18** - Biblioteca de UI
- **React Router** - Navegación entre páginas
- **TailwindCSS** - Estilos y diseño responsivo
- **Vite** - Build tool y desarrollo
- **Context API** - Manejo de estado global

## 📦 Instalación

### Requisitos previos

- Node.js 16 o superior
- npm o yarn

### Pasos de instalación

1. **Clonar o descargar el proyecto**

```bash
cd cadena-favores-uc
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

4. **Abrir en el navegador**

El proyecto se abrirá automáticamente en `http://localhost:5173`

## 🎯 Scripts disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Previsualizar build de producción
```

## 🏗️ Estructura del proyecto

```
cadena-favores-uc/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Navbar.jsx      # Barra de navegación
│   │   ├── Footer.jsx      # Pie de página
│   │   ├── Layout.jsx      # Layout principal
│   │   └── FavorCard.jsx   # Tarjeta de favor
│   ├── pages/              # Páginas principales
│   │   ├── Home.jsx        # Landing page
│   │   ├── Login.jsx       # Inicio de sesión
│   │   ├── Registro.jsx    # Registro de usuario
│   │   ├── Favores.jsx     # Lista de favores
│   │   ├── PublicarFavor.jsx # Publicar favor
│   │   └── Perfil.jsx      # Perfil de usuario
│   ├── context/            # Context API
│   │   └── AuthContext.jsx # Contexto de autenticación
│   ├── data/               # Datos simulados
│   │   └── mockData.js     # Datos de ejemplo
│   ├── App.jsx             # Componente principal
│   ├── main.jsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── public/                 # Archivos públicos
├── index.html              # HTML principal
├── package.json            # Dependencias
├── vite.config.js          # Configuración de Vite
├── tailwind.config.js      # Configuración de Tailwind
└── README.md               # Este archivo
```

## 👤 Usuarios de prueba

Para probar la aplicación, puedes usar estas credenciales:

**Usuario 1:**
- Email: `mgonzalez@uc.cl`
- Password: `demo123`

**Usuario 2:**
- Email: `crodriguez@uc.cl`
- Password: `demo123`

## 🎨 Guía de diseño

### Colores

- **Azul UC**: `#0033A0` - Color principal
- **Verde Menta**: `#00BFA6` - Color de acento
- **Grises**: Escalas de gris para textos y fondos

### Tipografía

- **Fuente principal**: Inter
- **Pesos**: 300, 400, 500, 600, 700, 800

### Componentes

Todos los componentes siguen un diseño minimalista con:
- Bordes redondeados
- Sombras suaves
- Transiciones smooth
- Diseño responsivo

## 🔧 Funcionalidades implementadas

### ✅ Completas

- [x] Landing page con información del proyecto
- [x] Sistema de registro e inicio de sesión (simulado)
- [x] Publicación de favores
- [x] Visualización de favores con filtros por categoría
- [x] Búsqueda por palabra clave
- [x] Perfil de usuario con estadísticas
- [x] Responder a favores
- [x] Eliminar favores propios
- [x] Persistencia de datos en localStorage
- [x] Diseño responsivo para móvil y escritorio
- [x] Animaciones y transiciones suaves

### 🔮 Extensiones futuras (comentadas en el código)

- [ ] Sistema de reputación o puntos
- [ ] Chat interno entre usuarios
- [ ] Verificación con correo UC real
- [ ] Integración con Google Calendar
- [ ] Notificaciones push
- [ ] Backend real con base de datos
- [ ] Búsqueda avanzada con múltiples filtros
- [ ] Sistema de valoraciones

## 🔒 Notas de seguridad

⚠️ **IMPORTANTE**: Este es un prototipo educativo. En producción:

- Las contraseñas deben ser hasheadas (bcrypt, argon2)
- Implementar autenticación JWT o OAuth
- Usar HTTPS para todas las comunicaciones
- Validar correos UC con verificación real
- Implementar rate limiting
- Sanitizar inputs del usuario

## 📚 Recursos adicionales

- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)

## 🤝 Contribuir

Este es un proyecto estudiantil abierto a mejoras. Si quieres contribuir:

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Proyecto estudiantil sin fines de lucro - UC 2025

## 👥 Contacto

Red UC - [@reduc](https://twitter.com/reduc) - contacto@reduc.cl

---

**Desarrollado con ❤️ para la comunidad UC**

> "Nadie lo sabe todo, pero todos sabemos algo que puede ayudar a alguien."
