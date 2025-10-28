# Guía de Subida de Material - NexUC

## Funcionalidad Implementada

Se ha agregado la capacidad de subir material académico (PDFs, DOCX) en la sección **Material de Estudio UC**.

## Características

### Para Usuarios

1. **Subir Material**
   - Botón "Subir Material" visible en la esquina superior derecha (solo para usuarios autenticados)
   - Formulario modal con campos:
     - Título del material
     - Descripción
     - Carrera (Ingeniería, Arquitectura, Economía, College, Otras)
     - Año (1º a 5º)
     - Ramo (dinámico según carrera seleccionada)
     - Etiquetas (tags) separadas por comas
     - Archivo (PDF o DOCX, máximo 10MB)

2. **Ver Material**
   - Búsqueda en tiempo real
   - Filtros por carrera, año y ramo
   - Tarjetas con información detallada
   - Botón "Ver material" para abrir/descargar

3. **Eliminar Material**
   - Solo el autor puede eliminar su propio material
   - Botón de papelera en la esquina superior derecha de cada tarjeta
   - Confirmación antes de eliminar

### Archivos Creados/Modificados

#### Nuevos Archivos

1. **[src/services/materialService.js](src/services/materialService.js)**
   - `subirMaterial()` - Sube archivo a Firebase Storage y crea documento en Firestore
   - `obtenerMateriales()` - Obtiene todos los materiales
   - `obtenerMaterialesFiltrados()` - Obtiene materiales con filtros
   - `eliminarMaterial()` - Elimina un material
   - `obtenerMaterialesUsuario()` - Obtiene materiales de un usuario específico

2. **[src/components/SubirMaterialModal.jsx](src/components/SubirMaterialModal.jsx)**
   - Modal completo para subir material
   - Validaciones de archivo (tipo y tamaño)
   - Formulario con todos los campos necesarios
   - Integración con Firebase Storage y Firestore

#### Archivos Modificados

1. **[src/pages/Material.jsx](src/pages/Material.jsx)**
   - Integración del botón "Subir Material"
   - Uso del servicio materialService
   - Funcionalidad de eliminación de material
   - Modal de subida integrado

## Estructura de Datos en Firestore

### Colección: `material`

```javascript
{
  "titulo": "Resumen Álgebra Lineal - 2024",
  "descripcion": "Apunte completo con ejercicios resueltos.",
  "carrera": "Ingeniería",
  "anio": 1,
  "ramo": "Álgebra Lineal",
  "archivoUrl": "https://firebasestorage.googleapis.com/...",
  "autorId": "uid_del_usuario",
  "autorNombre": "Nombre del Usuario",
  "fechaSubida": Timestamp,
  "tags": ["matrices", "vectores", "resumen"],
  "tipo": "PDF" // o "DOCX"
}
```

## Estructura en Firebase Storage

Los archivos se guardan en:
```
material/
  └── {userId}/
      └── {timestamp}_{random}.{extension}
```

Ejemplo:
```
material/abc123/1698765432_x7k3m2.pdf
```

## Validaciones Implementadas

### Validaciones de Formulario
- ✅ Título requerido (máx. 100 caracteres)
- ✅ Descripción requerida
- ✅ Carrera requerida
- ✅ Año requerido
- ✅ Ramo requerido
- ✅ Archivo requerido

### Validaciones de Archivo
- ✅ Solo PDF y DOCX permitidos
- ✅ Tamaño máximo: 10MB
- ✅ Tipo de archivo validado

## Flujo de Usuario

1. Usuario hace clic en "Subir Material"
2. Se abre el modal con el formulario
3. Usuario completa los campos:
   - Título
   - Descripción
   - Selecciona Carrera → Año → Ramo
   - Agrega etiquetas (opcional)
   - Sube archivo PDF/DOCX
4. Usuario hace clic en "Subir material"
5. El archivo se sube a Firebase Storage
6. Se crea el documento en Firestore
7. El modal se cierra y la lista se actualiza
8. El nuevo material aparece en la lista

## Permisos y Seguridad

- **Subir material**: Solo usuarios autenticados
- **Ver material**: Todos los usuarios
- **Eliminar material**: Solo el autor del material

## Reglas de Firestore Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /material/{materialId} {
      // Permitir lectura a todos
      allow read: if true;

      // Permitir creación solo a usuarios autenticados
      allow create: if request.auth != null
                    && request.resource.data.autorId == request.auth.uid;

      // Permitir eliminación solo al autor
      allow delete: if request.auth != null
                    && resource.data.autorId == request.auth.uid;
    }
  }
}
```

## Reglas de Storage Recomendadas

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /material/{userId}/{fileName} {
      // Permitir lectura a todos
      allow read: if true;

      // Permitir escritura solo al propietario
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 10 * 1024 * 1024  // 10MB
                   && (request.resource.contentType == 'application/pdf'
                       || request.resource.contentType == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
  }
}
```

## Testing

Para probar la funcionalidad:

1. Inicia sesión en la aplicación
2. Navega a la sección "Material"
3. Haz clic en "Subir Material"
4. Completa el formulario con datos de prueba
5. Sube un archivo PDF o DOCX de prueba
6. Verifica que el material aparezca en la lista
7. Intenta eliminar el material (botón de papelera)

## Datos de Prueba

Puedes usar el script existente para agregar datos de ejemplo:

```bash
node scripts/seed-material.js
```

Este script agrega 10 materiales de ejemplo con URLs de placeholder.

## Próximas Mejoras (Opcionales)

- [ ] Vista previa del PDF en modal
- [ ] Categorías adicionales
- [ ] Sistema de valoración/likes
- [ ] Comentarios en materiales
- [ ] Búsqueda avanzada con filtros múltiples
- [ ] Notificaciones de nuevos materiales
- [ ] Estadísticas de descargas
- [ ] Moderación de contenido

## Soporte

Si encuentras algún problema o tienes sugerencias, por favor reporta en:
- GitHub Issues
- Email de contacto de NexUC
