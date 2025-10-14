# 🔧 Solución: Error de Configuración de Firebase Auth

## ❌ Error Actual
```
Firebase: Error (auth/configuration-not-found)
```

## 🔍 Causa
Firebase Authentication no está habilitado en tu proyecto de Firebase.

## ✅ Solución: Habilitar Firebase Authentication

### Paso 1: Ir a Firebase Console
Abre tu navegador y ve a:
https://console.firebase.google.com/project/red-uc-8c043/authentication

### Paso 2: Habilitar Authentication
1. Haz clic en **"Get Started"** (Comenzar)
2. Se abrirá la página de Authentication

### Paso 3: Habilitar Email/Password
1. Ve a la pestaña **"Sign-in method"** (Método de inicio de sesión)
2. Busca **"Email/Password"** en la lista
3. Haz clic en **"Email/Password"**
4. Activa el toggle que dice **"Enable"** (Habilitar)
5. Haz clic en **"Save"** (Guardar)

### Paso 4: Verificar
1. Refresca tu aplicación en http://localhost:5174
2. Intenta registrarte nuevamente
3. Ahora debería funcionar correctamente

---

## 🔗 Enlaces Directos

- **Authentication:** https://console.firebase.google.com/project/red-uc-8c043/authentication
- **Sign-in Method:** https://console.firebase.google.com/project/red-uc-8c043/authentication/providers

---

## 📸 Guía Visual

### 1. Página inicial de Authentication
![Authentication](https://firebase.google.com/images/social.png)
- Haz clic en "Get Started"

### 2. Sign-in method
- Ve a la pestaña "Sign-in method"
- Verás una lista de proveedores

### 3. Email/Password
- Haz clic en "Email/Password"
- Activa el toggle "Enable"
- Guarda los cambios

---

## ⚡ Métodos de Autenticación Recomendados

Para tu aplicación Red UC, considera habilitar:

### ✅ Email/Password (Requerido)
- **Estado:** Debe estar habilitado
- **Uso:** Registro y login con correo y contraseña

### 📧 Email Link (Opcional)
- **Estado:** Opcional
- **Uso:** Login sin contraseña (magic link)

### 🔐 Google Sign-In (Futuro)
- **Estado:** Opcional
- **Uso:** Login rápido con cuenta de Google
- **Ventaja:** Los usuarios UC tienen cuentas de Google

---

## 🧪 Probar después de habilitar

1. Ve a http://localhost:5174/registro
2. Completa el formulario con:
   - Nombre: Tu nombre
   - Correo: tunombre@uc.cl
   - Contraseña: mínimo 6 caracteres
3. Haz clic en "Crear Cuenta"
4. Deberías ver el mensaje de éxito

---

## 🔥 Otros Servicios a Configurar

Mientras estás en Firebase Console, asegúrate de:

### 1. Firestore Database
✅ Ya está configurado

### 2. Firestore Rules
⚠️ Necesitas desplegar: `.\deploy-firebase.ps1`

### 3. Firestore Indexes
⚠️ Necesitas desplegar: `.\deploy-firebase.ps1`

---

## 📞 Si el Error Persiste

Si después de habilitar Authentication el error continúa:

1. **Limpia el caché:**
   ```bash
   Ctrl + Shift + R (en el navegador)
   ```

2. **Verifica la configuración:**
   - Abre [src/firebaseConfig.js](src/firebaseConfig.js)
   - Verifica que el `projectId` sea: `red-uc-8c043`

3. **Reinicia el servidor:**
   ```bash
   # Detén el servidor (Ctrl + C)
   npm run dev
   ```

4. **Verifica en Firebase Console:**
   - Ve a Authentication > Users
   - Debería estar vacío (sin usuarios aún)
   - Si ves la interfaz correctamente, está habilitado

---

## ✅ Confirmación

Sabrás que está funcionando cuando:
- El error desaparece
- Puedes crear un usuario
- Ves el usuario en Firebase Console > Authentication > Users

---

**Siguiente paso:** Después de habilitar, actualiza la validación de correos para incluir `@estudiante.uc.cl`
