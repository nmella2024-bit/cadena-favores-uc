# 📝 Información sobre .gitignore - Red UC

## ✅ Archivos y Carpetas Excluidos de Git

Este proyecto está configurado para **NO** subir a GitHub los siguientes archivos:

### 🔒 Archivos de Seguridad
```
.env                          # Variables de entorno con credenciales
.env.local                    # Variables locales
.env.*.local                  # Variables por ambiente
.firebaserc                   # Configuración local de Firebase
.runtimeconfig.json           # Runtime config de Firebase
```

### 📁 Configuraciones Locales
```
.claude/                      # Configuración de Claude Code
dataconnect/                  # Configuraciones locales de Firebase
codebase1/                    # Carpetas temporales generadas
functions/node_modules/       # Dependencias de Cloud Functions
functions/lib/                # Compilados de Cloud Functions
```

### 🗂️ Dependencias y Build
```
node_modules/                 # Todas las dependencias de npm
dist/                         # Build de producción
dist-ssr/                     # Server-side rendering build
build/                        # Otros builds
*.local                       # Archivos locales
```

### 🐛 Logs y Debug
```
logs/                         # Carpeta de logs
*.log                         # Todos los archivos de log
npm-debug.log*                # Logs de npm
firebase-debug.log*           # Logs de Firebase
firestore-debug.log*          # Logs de Firestore
```

### 💾 Cache y Temporales
```
.cache/                       # Cache general
.parcel-cache/                # Cache de Parcel
.eslintcache                  # Cache de ESLint
*.tmp                         # Archivos temporales
*.temp                        # Archivos temporales
*.local.json                  # JSON locales
nul                           # Archivo temporal de Windows
```

### 📝 Editor y Sistema
```
.vscode/*                     # Configuración de VS Code
!.vscode/extensions.json      # Excepto extensiones recomendadas
.idea                         # Configuración de IntelliJ
.DS_Store                     # Archivos de macOS
Thumbs.db                     # Archivos de Windows
desktop.ini                   # Configuración de Windows
*.suo, *.ntvs*, *.njsproj     # Archivos de Visual Studio
*.sln, *.sw?                  # Otros archivos de editores
```

### 🧪 Testing y Cobertura
```
coverage/                     # Reportes de cobertura
.nyc_output/                  # Output de NYC (test coverage)
```

## 🚫 Archivos que SÍ se suben a GitHub

Estos archivos **SÍ** deben estar en el repositorio:

### ✅ Código Fuente
- `src/` - Todo el código de la aplicación
- `public/` - Assets públicos
- `index.html` - Archivo HTML principal

### ✅ Configuración del Proyecto
- `package.json` - Dependencias y scripts
- `vite.config.js` - Configuración de Vite
- `tailwind.config.js` - Configuración de Tailwind
- `.env.example` - Plantilla de variables de entorno

### ✅ Firebase
- `firestore.rules` - Reglas de seguridad
- `firestore.indexes.json` - Índices de Firestore
- `firebase.json` - Configuración de Firebase
- `src/firebaseConfig.js` - Config de Firebase (ver nota de seguridad)

### ✅ Documentación
- `README.md` - Documentación principal
- `FIREBASE_SETUP.md` - Guía de Firebase
- `INTEGRACION_FIREBASE.md` - Guía de integración
- `SEGURIDAD.md` - Guía de seguridad
- Este archivo (`GITIGNORE_INFO.md`)

### ✅ Scripts
- `deploy-firebase.sh` - Script de despliegue (Linux/Mac)
- `deploy-firebase.ps1` - Script de despliegue (Windows)

## ⚠️ Nota Importante sobre firebaseConfig.js

Actualmente, `src/firebaseConfig.js` contiene tus credenciales de Firebase **directamente en el código**.

### Opción 1: Mover a Variables de Entorno (Recomendado)

1. Crea un archivo `.env`:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
# ... etc
```

2. Actualiza `firebaseConfig.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```

3. Agrega `firebaseConfig.js` al `.gitignore` si lo deseas

### Opción 2: Mantener en el Código

Si mantienes las credenciales en `firebaseConfig.js`:
- ✅ Las reglas de Firestore son tu protección principal
- ⚠️ Configura restricciones de API en Firebase Console
- ⚠️ Limita los dominios que pueden usar tu API Key

Más información en [SEGURIDAD.md](SEGURIDAD.md)

## 🔍 Verificar qué se subirá a GitHub

Antes de hacer commit:

```bash
# Ver archivos modificados
git status

# Ver cambios específicos
git diff

# Ver qué archivos se subirán
git diff --staged
```

## 🛠️ Comandos Útiles

### Verificar si un archivo está ignorado
```bash
git check-ignore -v archivo.txt
```

### Remover un archivo del seguimiento de Git
```bash
git rm --cached archivo.txt
```

### Ver todos los archivos ignorados
```bash
git status --ignored
```

## 🆘 Si Subiste un Archivo por Error

### 1. Removerlo del último commit (antes de push)
```bash
git reset HEAD~1
# Edita .gitignore
git add .
git commit -m "Fix: Remover archivos sensibles"
```

### 2. Si ya hiciste push
Ver [SEGURIDAD.md](SEGURIDAD.md#-qué-hacer-si-filtras-tus-credenciales) para instrucciones detalladas

## 📋 Checklist Antes de Commit

- [ ] Revisé `git status`
- [ ] No hay archivos `.env` en staging
- [ ] No hay carpetas `node_modules/` o `dist/`
- [ ] No hay archivos `.log` o temporales
- [ ] `.gitignore` está actualizado
- [ ] Revisé los cambios con `git diff`

## 📖 Referencias

- [Documentación de .gitignore](https://git-scm.com/docs/gitignore)
- [Plantillas de .gitignore](https://github.com/github/gitignore)
- [Guía de Seguridad del Proyecto](SEGURIDAD.md)

---

**Última actualización:** Configuración mejorada para proteger archivos sensibles y locales
