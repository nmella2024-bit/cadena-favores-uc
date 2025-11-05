# Instrucciones para Crear la Estructura de Carpetas

## Paso 1: Ajustar Reglas de Firestore

1. **Ve a Firebase Console:**
   ```
   https://console.firebase.google.com/project/red-uc-eeuu/firestore/rules
   ```

2. **Guarda una copia de tus reglas actuales** (por si acaso)

3. **Reemplaza TODAS las reglas con estas:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios
    match /usuarios/{userId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Favores
    match /favores/{favorId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }

    // Anuncios
    match /anuncios/{anuncioId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }

    // Marketplace
    match /marketplace/{itemId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }

    // Reportes
    match /reportes/{reporteId} {
      allow read, write: if request.auth != null;
    }

    // ✅ CARPETAS - Permitir crear a usuarios autenticados
    match /folders/{folderId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }

    // ✅ MATERIAL - Permitir lectura pública y escritura autenticada
    match /material/{materialId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
  }
}
```

4. **Click en "Publicar"** (botón azul arriba a la derecha)

5. **Espera 30 segundos** para que se apliquen las reglas

6. **Refresca la página** de tu aplicación

## Paso 2: Migrar Materiales Existentes (IMPORTANTE)

⚠️ **Solo si ya tienes materiales en tu base de datos:**

1. **Ve a:**
   ```
   http://localhost:5173/admin/migrar-materiales
   ```

2. **Click en "Iniciar Migración"**

3. **Espera** a que se complete (agrega `carpetaId: null` a todos los materiales)

4. **Verifica** el resultado (te dirá cuántos se migraron)

> **Nota:** Si no tienes materiales previos o acabas de crear el proyecto, **salta al Paso 3**.

## Paso 3: Crear las Carpetas

1. **Asegúrate de estar logueado** en tu aplicación

2. **Ve a:**
   ```
   http://localhost:5173/admin/seed-folders
   ```

3. **Click en "Crear Estructura Completa"**

4. **Espera** a que se complete (puede tomar 2-3 minutos)

5. **Verifica** que se completó sin errores

## Paso 4: Verificar que Funcionó

1. **Ve a `/material`**

2. **Deberías ver las carpetas:**
   - 1° Semestre
   - 2° Semestre
   - 3° Semestre
   - 4° Semestre
   - Majors
   - Red apoyo Fundamenta
   - Examen de Comunicación Escrita VRA 100C
   - Exploratorios

3. **Click en una carpeta** para verificar que se navega correctamente

## Paso 4: (OPCIONAL) Restringir las Reglas

Si quieres que SOLO usuarios con rol `exclusivo` puedan crear carpetas en el futuro:

```javascript
// Regla más restrictiva para folders (después de crear la estructura)
match /folders/{folderId} {
  allow read: if true;
  allow create: if request.auth != null &&
                  get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'exclusivo';
  allow update, delete: if request.auth != null &&
                          (resource.data.autorId == request.auth.uid ||
                           get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'exclusivo');
}
```

## Troubleshooting

### Si sigue dando error de permisos:

1. **Verifica que las reglas se publicaron:**
   - Ve a Firebase Console > Firestore > Reglas
   - Revisa que el código esté correcto

2. **Espera un momento más:**
   - A veces Firebase tarda en propagar las reglas
   - Espera 30-60 segundos

3. **Refresca la página:**
   - Cierra y vuelve a abrir `/admin/seed-folders`
   - Intenta de nuevo

4. **Verifica tu sesión:**
   - Asegúrate de estar logueado
   - Verifica en la consola del navegador: `console.log(currentUser)`

### Si las carpetas no aparecen:

1. **Refresca la página de Material**
2. **Verifica en Firebase Console > Firestore:**
   - Deberías ver una colección llamada `folders`
   - Con muchos documentos dentro

### Error "rol no definido":

Si ves errores sobre `rol`, verifica que tu documento de usuario en Firestore tiene el campo `rol: 'exclusivo'`.

## Notas de Seguridad

- ✅ Las reglas temporales solo permiten a usuarios **autenticados** crear carpetas
- ✅ No se está abriendo completamente la base de datos
- ✅ Lectura sigue siendo pública (como debe ser para Material)
- ⚠️ Cualquier usuario autenticado puede crear carpetas (temporal)
- 🔒 Puedes restringir a solo `exclusivo` después con el Paso 4

## Resumen

1. Actualiza reglas en Firebase Console ✅
2. Publica las reglas ✅
3. Espera 10-20 segundos ✅
4. Ve a `/admin/seed-folders` ✅
5. Crea estructura ✅
6. Verifica en `/material` ✅
7. (Opcional) Restringe las reglas ✅

¡Listo! 🎉
