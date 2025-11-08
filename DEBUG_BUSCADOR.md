# 🔍 Guía de Depuración del Buscador

## ✅ Cambios Realizados

### **1. Logs de Depuración Completos**

Agregué logs en cada paso del proceso para identificar dónde falla:

**En GlobalSearch.jsx:**
```
[GlobalSearch] Iniciando búsqueda para: <término>
[GlobalSearch] Resultados recibidos: <objeto>
```

**En searchService.js:**
```
[buscarGlobal] Función llamada con término: <término>
[buscarGlobal] Colecciones a buscar: [...]
[buscarGlobal] Límite por colección: 5
[buscarGlobal] Término procesado: <término_procesado>
[Search] Iniciando búsqueda en materiales...
[Search] Materiales cargados: <cantidad>
[Search] Carpetas cargadas: <cantidad>
[Search] Materiales encontrados: <cantidad>
[Search] Resultados finales: <cantidad>
[buscarGlobal] Resultados finales: { favores: 0, material: 5, ... }
```

### **2. Ancho del Buscador Aumentado**

- **Antes:** 125px (muy pequeño)
- **Ahora:** 300px (más cómodo)

### **3. Placeholder Simplificado**

- **Antes:** "Buscar favores, anuncios, productos..."
- **Ahora:** "Buscar..."

---

## 🧪 Pasos para Depurar

### **Paso 1: Abre la Consola del Navegador**

1. Abre tu aplicación: `npm run dev`
2. Presiona `F12` en el navegador
3. Ve a la pestaña **"Console"**
4. **IMPORTANTE:** Haz clic en "Clear console" o presiona Ctrl+L para limpiar la consola

### **Paso 2: Recarga la Página**

1. Presiona `F5` o Ctrl+R para recargar
2. Verifica que aparezcan los logs de montaje:
   ```
   [GlobalSearch] Componente montado correctamente
   [GlobalSearch] buscarGlobal importado: function
   ```

### **Paso 3: Prueba el Buscador Desktop**

1. **Asegúrate de que tu ventana del navegador sea ANCHA** (más de 768px)
2. Haz clic en el campo de búsqueda (arriba a la derecha)
3. Deberías ver: `[GlobalSearch INPUT Desktop] onFocus disparado`
4. Escribe una letra, por ejemplo "c"
5. Deberías ver:
   ```
   [GlobalSearch INPUT Desktop] tecla presionada: c
   [GlobalSearch INPUT Desktop] onChange disparado: c
   ```

### **Paso 4: Prueba el Buscador Móvil (si el desktop no funciona)**

1. **Reduce el ancho de tu ventana del navegador** (menos de 768px)
2. Haz clic en el ícono de lupa 🔍
3. Escribe en el campo que aparece
4. Deberías ver:
   ```
   [GlobalSearch INPUT Mobile] onFocus disparado
   [GlobalSearch INPUT Mobile] tecla presionada: c
   [GlobalSearch INPUT Mobile] onChange disparado: c
   ```

### **Paso 5: Observa la Búsqueda Completa**

Si los eventos del Paso 3 o 4 funcionan, deberías ver esta secuencia completa:

```
[GlobalSearch] Iniciando búsqueda para: control
[buscarGlobal] Función llamada con término: control
[buscarGlobal] Colecciones a buscar: ['favores', 'anuncios', 'marketplace', 'material', 'usuarios']
[buscarGlobal] Límite por colección: 5
[buscarGlobal] Término procesado: control
[Search] Iniciando búsqueda en materiales...
[Search] Materiales cargados: 300
[Search] Carpetas cargadas: 156
[Search] Materiales encontrados: 12
[Search] Resultados finales: 5
[buscarGlobal] Resultados finales: { favores: 0, anuncios: 0, marketplace: 0, material: 5, usuarios: 0, total: 5 }
[GlobalSearch] Resultados recibidos: { favores: [], ..., material: [...], total: 5 }
```

---

## 🐛 Diagnóstico Según los Logs

### **Caso 1: No aparece NINGÚN log de montaje**

**Problema:** El componente GlobalSearch no se está renderizando.

**Verifica:**
1. ¿El buscador está visible en la página?
2. ¿Hay errores en rojo en la consola?

**Solución:**
- Revisa que el componente esté importado en la página
- Verifica que no haya errores de React en la consola

---

### **Caso 2: Aparecen logs de montaje pero NO logs de eventos (onFocus, onChange, onKeyDown)**

**Problema:** Los eventos del input no se están disparando.

**Síntomas:**
- Aparece: `[GlobalSearch] Componente montado correctamente`
- NO aparece: `[GlobalSearch INPUT Desktop/Mobile] onFocus disparado` al hacer clic
- NO aparece: `[GlobalSearch INPUT Desktop/Mobile] onChange disparado` al escribir
- NO aparece: `[GlobalSearch INPUT Desktop/Mobile] tecla presionada` al escribir

**Causas posibles:**
1. **Estás escribiendo en el input equivocado:**
   - Desktop input solo aparece si la ventana es ANCHA (>768px)
   - Mobile input solo aparece si la ventana es ANGOSTA (<768px) Y haces clic en el ícono 🔍

2. **El input está bloqueado por otro elemento:**
   - Puede haber un elemento invisible encima del input
   - Verifica con las herramientas de desarrollo (inspeccionar elemento)

3. **Hay un error de React que está bloqueando los eventos:**
   - Busca errores en rojo en la consola
   - Busca warnings de React

**Pruebas a realizar:**

**A. Verifica el ancho de ventana:**
```javascript
// Copia y pega esto en la consola del navegador:
console.log('Ancho de ventana:', window.innerWidth, 'px');
console.log('Desktop visible:', window.innerWidth >= 768);
console.log('Mobile visible:', window.innerWidth < 768);
```

**B. Verifica que el input existe en el DOM:**
```javascript
// Copia y pega esto en la consola:
const inputs = document.querySelectorAll('input[placeholder*="Buscar"]');
console.log('Inputs encontrados:', inputs.length);
inputs.forEach((input, i) => {
  console.log(`Input ${i}:`, {
    visible: window.getComputedStyle(input).display !== 'none',
    placeholder: input.placeholder,
    value: input.value
  });
});
```

**C. Prueba escribir directamente desde la consola:**
```javascript
// Copia y pega esto en la consola:
const input = document.querySelector('input[placeholder*="Buscar"]');
if (input) {
  input.focus();
  input.value = 'test';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  console.log('✅ Eventos disparados manualmente');
} else {
  console.log('❌ Input no encontrado');
}
```

**Solución:**
- Si el ancho es incorrecto, ajusta la ventana del navegador
- Si el input no existe o no es visible, hay un problema de renderizado
- Si los eventos manuales funcionan, hay un problema con el teclado o el navegador

---

### **Caso 3: Solo aparece `[GlobalSearch] Iniciando búsqueda para: ...`**

**Problema:** La función `buscarGlobal` no se está llamando o hay un error antes de que llegue.

**Verifica:**
- ¿Hay algún error en rojo en la consola?
- ¿Se está importando correctamente `buscarGlobal`?

**Solución:**
- Revisa el import en GlobalSearch.jsx:
  ```javascript
  import { buscarGlobal } from '../services/searchService';
  ```

---

### **Caso 4: Aparece `[buscarGlobal] Término muy corto`**

**Problema:** Estás escribiendo menos de 2 caracteres.

**Solución:**
- Escribe al menos 2 caracteres: "co", "ma", "ev"

---

### **Caso 5: Aparece hasta `[Search] Materiales cargados: 0`**

**Problema:** No hay materiales en Firestore.

**Verifica:**
1. Ve a Firebase Console → Firestore Database
2. Busca la colección `material`
3. ¿Tiene documentos?

**Solución:**
- Si no hay documentos, ejecuta: `npm run comercial:import`
- Verifica que la importación fue exitosa

---

### **Caso 6: Aparece `[Search] Materiales cargados: 300` pero `Materiales encontrados: 0`**

**Problema:** Ningún material coincide con el término de búsqueda.

**Verifica:**
1. ¿Qué término estás buscando?
2. ¿Ese término existe en tus materiales?

**Prueba con:**
- "pdf" (debería encontrar muchos)
- "control" (si tienes controles)
- "prueba" (si tienes pruebas)
- Un nombre de carpeta que sepas que existe

---

### **Caso 7: Los logs se ven bien pero no aparecen resultados en la UI**

**Problema:** El dropdown no se está mostrando o hay un error en el renderizado.

**Verifica:**
1. ¿El dropdown blanco aparece debajo del buscador?
2. ¿Hay algún error de React en la consola?

**Solución:**
- Revisa que `isOpen` sea `true`
- Verifica el CSS del dropdown

---

### **Caso 8: Aparece error de permisos en Firestore**

**Problema:** Las reglas de seguridad de Firestore están bloqueando la lectura.

**Error típico:**
```
FirebaseError: Missing or insufficient permissions
```

**Solución:**
1. Ve a Firebase Console → Firestore Database → Rules
2. Verifica que las reglas permiten leer `material` y `folders`
3. Temporalmente puedes probar con:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /material/{document=**} {
         allow read: if true;
       }
       match /folders/{document=**} {
         allow read: if true;
       }
     }
   }
   ```

---

## 📊 Logs Esperados (Ejemplo Completo)

```javascript
// Usuario escribe "control"

[GlobalSearch] Iniciando búsqueda para: control

[buscarGlobal] Función llamada con término: control
[buscarGlobal] Colecciones a buscar: (5) ['favores', 'anuncios', 'marketplace', 'material', 'usuarios']
[buscarGlobal] Límite por colección: 5
[buscarGlobal] Término procesado: control

[Search] Iniciando búsqueda en materiales...
[Search] Materiales cargados: 300
[Search] Carpetas cargadas: 156
[Search] Materiales encontrados: 12
[Search] Resultados finales: 5

[buscarGlobal] Resultados finales: {
  favores: 0,
  anuncios: 0,
  marketplace: 0,
  material: 5,
  usuarios: 0,
  total: 5
}

[GlobalSearch] Resultados recibidos: {
  favores: Array(0),
  anuncios: Array(0),
  marketplace: Array(0),
  material: Array(5),
  usuarios: Array(0),
  total: 5
}
```

---

## 🔧 Comandos Útiles

```bash
# Ver estado de carpetas
npm run folders:status

# Reimportar materiales si no hay
npm run comercial:fix-csv
npm run comercial:create-folders
npm run comercial:import

# Limpiar caché del navegador
# Ctrl + Shift + Delete → Clear cache
```

---

## 📝 Información para Reportar

Si el buscador sigue sin funcionar, copia y pega:

1. **Todos los logs de la consola** (desde que escribiste hasta que terminó)
2. **Término de búsqueda** que usaste
3. **Cantidad de materiales** en Firestore (ve a Firebase Console)
4. **Errores en rojo** si los hay

Con esa información podremos identificar exactamente dónde está el problema.
