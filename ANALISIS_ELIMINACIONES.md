# Analisis Completo: Eliminaciones de Datos y Configuracion Firebase

## 1. CONFIGURACION DE FIREBASE

**Archivo:** `src/firebaseConfig.js`

Proyecto: **red-uc-eeuu** (region US)

Servicios inicializados:
- Authentication (Firebase Auth)
- Firestore Database
- Cloud Storage
- Google Analytics

Credenciales:
```
projectId: red-uc-eeuu
authDomain: red-uc-eeuu.firebaseapp.com
storageBucket: red-uc-eeuu.firebasestorage.app
```

---

## 2. ESTRUCTURA DE COLECCIONES FIRESTORE

### Coleccion 1: usuarios
- Documentos: organizados por uid de Firebase Auth
- Campos: nombre, email, carrera, telefono, rol, reputacion, favoresPublicados[], favoresCompletados[], fotoPerfil
- Storage: perfil-pictures/{userId}/profile_timestamp

### Coleccion 2: favores
- Ciclo de vida: activo -> en_proceso -> finalizado
- Arrays: respuestas[], ayudantes[] (contienen datos de otros usuarios)
- Campos de relacion: usuarioId (creador), ayudanteId, ayudanteSeleccionado

### Coleccion 3: anuncios
- Campos: autor (userId), imagenURL
- Storage: anuncios/{userId}/{timestamp}

### Coleccion 4: material
- Campos: autorId, archivoUrl, enlaceExterno, tipo (PDF/DOCX/Enlace)
- Storage: material/{userId}/{timestamp}

### Coleccion 5: marketplace
- Campos: autor (userId), imagenesURL[] (multiples imagenes)
- Storage: marketplace/{userId}/{timestamp}

### Coleccion 6: reportes
- Campos: reporterId, contentAuthorId, contentType (favor/anuncio/marketplace/material/usuario)
- Uso: Sistema de moderation de contenido

### Coleccion 7: pedidos (UCloseMeal - DESHABILITADO)
- Campos: solicitanteId, repartidorId, estado
- Nota: Servicio actualmente deshabilitado

---

## 3. UBICACION DE FUNCIONES DE ELIMINACION

| Funcion | Archivo | Linea | Que Elimina |
|---------|---------|-------|------------|
| eliminarFavor | src/services/favorService.js | 398-406 | Documento favor |
| eliminarMaterial | src/services/materialService.js | 148-155 | Documento material |
| eliminarAnuncio | src/services/anuncioService.js | 140-147 | Documento anuncio |
| eliminarProducto | src/services/marketplaceService.js | 165-172 | Documento producto |
| eliminarPedido | src/services/orderService.js | 334-361 | Documento pedido |
| deleteUserProfile | src/services/userService.js | 265-286 | Usuario completo |

---

## 4. ANALISIS POR FUNCION

### eliminarFavor (favorService.js:398-406)
PROBLEMAS:
- NO valida permisos (cualquiera puede eliminar cualquier favor)
- NO elimina referencias en usuarios.favoresPublicados[]
- NO elimina respuestas de otros usuarios
- NO elimina ofertas de ayuda (ayudantes[])

### eliminarMaterial (materialService.js:148-155)
PROBLEMAS:
- NO valida que sea el autor
- NO elimina archivo del Storage
- deleteObject importado pero NUNCA USADO

### eliminarAnuncio (anuncioService.js:140-147)
PROBLEMAS:
- NO valida que sea el autor
- NO elimina imagen del Storage

### eliminarProducto (marketplaceService.js:165-172)
PROBLEMAS:
- NO valida que sea el autor
- NO elimina multiples imagenes del Storage

### eliminarPedido (orderService.js:334-361)
BIEN:
+ Valida que solo solicitante puede eliminar
+ Valida que solo pedidos pendientes se pueden eliminar
PROBLEMA:
- No hay sincronizacion con otros datos

### deleteUserProfile (userService.js:265-286)
CRITICO - INCOMPLETO:
Elimina:
+ Documento de usuario de Firestore
+ Cuenta de Firebase Auth

NO Elimina:
- Todos los favores publicados por el usuario (quedan con usuarioId huerfano)
- Todos los anuncios del usuario
- Todo material academico del usuario
- Todos los productos en marketplace
- Respuestas en favores de otros (array respuestas[])
- Ofertas de ayuda en favores ajenos (array ayudantes[])
- Foto de perfil del Storage
- Reportes creados por el usuario
- Pedidos creados (si UCloseMeal se habilita)
- Historico de calificaciones

RESULTADO: Data huerfana, consistencia rota

---

## 5. VALIDATION MATRIX

| Funcion | Valida Dueno | Valida Estado | Storage Cleanup | Cascada |
|---------|--------------|---------------|-----------------|---------|
| eliminarFavor | NO | NO | N/A | NO |
| eliminarMaterial | NO | NO | NO | NO |
| eliminarAnuncio | NO | NO | NO | NO |
| eliminarProducto | NO | NO | NO | NO |
| eliminarPedido | SI | SI | N/A | NO |
| deleteUserProfile | SI* | SI | NO | NO |

*valida que sea currentUser pero sin validaciones previas

---

## 6. IMPACTO EN INTEGRIDAD DE DATOS

Cuando usuario A se elimina:
1. usuarios document desaparece
2. PERO favores con usuarioId=A permanecen
3. PERO anuncios con autor=A permanecen
4. PERO material con autorId=A permanecen
5. PERO marketplace.productos con autor=A permanecen
6. PERO respuestas[] en otros favores aun contienen datos de A
7. PERO ayudantes[] en otros favores aun contienen datos de A
8. PERO reportes con reporterId=A permanecen
9. PERO fotoPerfil URL permanece en Storage

Cuando favor se elimina:
1. Documento desaparece
2. PERO usuarios.favoresPublicados[] aun contiene ID
3. PERO respuestas[] de otros usuarios mantienen referencias

Cuando material/anuncio/producto se elimina:
1. Documento desaparece
2. PERO archivos en Storage permanecen (acumulan, consumidores espacio)

---

## 7. IMPORTS DE DELETE EN CODIGO

### Firestore Deletes
```javascript
import { deleteDoc } from 'firebase/firestore';
// Usado en: favorService.js (1), materialService.js (1), anuncioService.js (1), 
//          marketplaceService.js (1), orderService.js (1), userService.js (1)
```

### Auth Deletes
```javascript
import { deleteUser } from 'firebase/auth';
// Usado en: userService.js (1), authService.js (1, solo en caso de error)
```

### Storage Deletes - IMPORTADO PERO NO USADO
```javascript
import { deleteObject } from 'firebase/storage';
// Ubicacion: userService.js linea 13
// Usado: NUNCA
// Este import existe pero la funcion deleteObject nunca se invoca
```

---

## 8. DATOS QUE REFERENCIA USUARIO POR ID

```
usuarios.favoresPublicados[] -> favorId
usuarios.favoresCompletados[] -> favorId

favores.usuarioId = userId (creador)
favores.respuestas[].usuarioId = userId (respondedor)
favores.ayudantes[].idUsuario = userId (ofrecedor de ayuda)

anuncios.autor = userId
material.autorId = userId
marketplace.autor = userId

pedidos.solicitanteId = userId (comprador)
pedidos.repartidorId = userId (repartidor)

reportes.reporterId = userId (quien reporta)
reportes.contentAuthorId = userId (autor del contenido reportado)

calificaciones.usuarioCalificado = userId
calificaciones.usuarioQualifica = userId
```

---

## 9. PROBLEMAS CRITICOS RESUMEN

1. [CRITICO] deleteUserProfile incompleto - deja 100+ referencias rotas
2. [ALTO] No hay validacion de permisos en 4 funciones de delete
3. [ALTO] Storage nunca se limpia (acumulacion de archivos)
4. [ALTO] Ninguna operacion de delete usa transacciones
5. [MEDIO] Sin log/auditoria de eliminaciones
6. [MEDIO] Sin manejo de cascada de datos relacionados
7. [BAJO] deleteObject importado pero nunca usado

---

## 10. ARCHIVOS CLAVE DEL PROYECTO

Servicios:
- src/services/favorService.js
- src/services/materialService.js
- src/services/anuncioService.js
- src/services/marketplaceService.js
- src/services/orderService.js
- src/services/userService.js
- src/services/reportService.js
- src/services/ratingService.js
- src/services/notificationService.js
- src/services/feedService.js

Config:
- src/firebaseConfig.js
- src/context/AuthContext.jsx

---

## 11. PROXIMOS PASOS RECOMENDADOS

1. Implementar validacion de permisos en todas las funciones delete
2. Crear funcion de eliminacion en cascada para usuarios
3. Limpiar Storage junto con documentos Firestore
4. Usar transacciones de Firestore para operaciones atomicas
5. Agregar auditoria/logging de eliminaciones
6. Considerar soft-deletes para GDPR compliance
7. Usar deleteObject correctamente (no solo importarlo)

