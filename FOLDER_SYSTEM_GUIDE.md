# Sistema de Carpetas estilo Google Drive - Material UC

## Descripción

Se ha implementado un sistema completo de carpetas y subcarpetas jerárquicas para la sección de Material, similar a Google Drive. Ahora los usuarios pueden organizar el material académico en carpetas por semestre, ramos, y temas específicos.

## Características Implementadas

### ✅ Funcionalidades Principales

1. **Estructura Jerárquica Ilimitada**
   - Carpetas y subcarpetas sin límite de profundidad
   - Navegación tipo Google Drive con breadcrumbs
   - Vista clara de la ubicación actual

2. **Gestión de Carpetas**
   - ✅ Crear carpetas/subcarpetas
   - ✅ Renombrar carpetas
   - ✅ Eliminar carpetas (en cascada)
   - 🔄 Mover carpetas (placeholder preparado)

3. **Gestión de Archivos**
   - Los materiales ahora se guardan en la carpeta actual
   - Indicador visual de ubicación al subir archivos
   - Visualización separada de carpetas y archivos

4. **Interfaz de Usuario**
   - Breadcrumb de navegación (Home > Carpeta1 > Subcarpeta)
   - Tarjetas visuales para carpetas (icono morado)
   - Separación clara: "Carpetas" y "Archivos"
   - Contador de elementos (X carpetas • Y archivos)

## Estructura de Archivos Creados

```
src/
├── services/
│   ├── folderService.js          # Servicios de carpetas (CRUD)
│   └── materialService.js         # Actualizado para soportar carpetaId
├── components/
│   ├── FolderCard.jsx            # Tarjeta de carpeta
│   ├── Breadcrumb.jsx            # Navegación breadcrumb
│   ├── CreateFolderModal.jsx     # Modal para crear carpetas
│   └── SubirMaterialModal.jsx    # Actualizado con ubicación
└── pages/
    └── Material.jsx              # Página principal actualizada

scripts/
└── seed-folders-hierarchy.js     # Script de migración
```

## Esquema de Datos en Firestore

### Colección: `folders`

```javascript
{
  id: string,                    // Auto-generado
  nombre: string,                // Nombre de la carpeta
  carpetaPadreId: string | null, // ID de carpeta padre (null = raíz)
  autorId: string,               // UID del creador
  autorNombre: string,           // Nombre del creador
  fechaCreacion: Timestamp,      // Fecha de creación
  tipo: 'carpeta'               // Tipo fijo
}
```

### Colección: `material` (actualizada)

```javascript
{
  // ... campos existentes ...
  carpetaId: string | null,      // NUEVO: ID de la carpeta padre
}
```

## Uso del Sistema

### 1. Crear la Estructura Inicial

**Opción A: Desde la Interfaz Web (Recomendado)**

1. Inicia sesión con una cuenta de usuario con rol `exclusivo`
2. Navega a: `http://localhost:5173/admin/seed-folders` (en desarrollo)
3. Click en el botón "Crear Estructura Completa"
4. Espera a que se complete el proceso (verás el progreso en tiempo real)
5. Una vez completado, ve a `/material` para ver las carpetas creadas

**Opción B: Script de Node.js (Requiere configuración adicional)**

Si prefieres usar el script de Node.js, necesitas configurar Firebase Admin SDK:

```bash
npm run seed:folders
```

Nota: Esta opción requiere credenciales de service account de Firebase y cambios en las reglas de seguridad.

La estructura creada incluye:
- **1° Semestre**: Nivelación Cálculo, Química, Cálculo 1, Álgebra Lineal
- **2° Semestre**: Cálculo 2, Dinámica, Intro Economía, Intro Programación
- **3° Semestre**: Cálculo 3, EDO, Termodinámica
- **4° Semestre**: Probabilidades, Electricidad y Magnetismo
- **Majors**: 10 especialidades
- **Red de apoyo** y materiales adicionales

### 2. Navegar por Carpetas

- Click en una carpeta para abrirla
- Usa el breadcrumb para volver a niveles anteriores
- Click en "Material" para volver a la raíz

### 3. Crear Nueva Carpeta

1. Click en "Nueva Carpeta"
2. Ingresa el nombre
3. Se creará en la ubicación actual

### 4. Subir Material

1. Navega a la carpeta deseada
2. Click en "Subir Material"
3. El archivo se guardará en la carpeta actual
4. Verás un indicador: "Se guardará en: [Nombre Carpeta]"

### 5. Gestionar Carpetas

**Renombrar:**
- Click en ⋮ (menú) en la tarjeta de carpeta
- Selecciona "Renombrar"
- Ingresa el nuevo nombre

**Eliminar:**
- Click en ⋮ (menú)
- Selecciona "Eliminar"
- Confirma la acción
- ⚠️ Se eliminarán todas las subcarpetas y archivos

**Permisos:**
- Solo el creador puede editar/eliminar sus carpetas
- Los archivos heredan la ubicación de la carpeta

## API de Servicios

### folderService.js

```javascript
// Crear carpeta
crearCarpeta({ nombre, carpetaPadreId, autorId, autorNombre })

// Obtener carpetas de un nivel
obtenerCarpetasPorNivel(carpetaPadreId)

// Obtener todas las carpetas
obtenerTodasLasCarpetas()

// Obtener carpeta por ID
obtenerCarpetaPorId(carpetaId)

// Obtener ruta completa (breadcrumb)
obtenerRutaCarpeta(carpetaId)

// Renombrar carpeta
renombrarCarpeta(carpetaId, nuevoNombre, userId)

// Eliminar carpeta (en cascada)
eliminarCarpeta(carpetaId, userId)

// Mover carpeta
moverCarpeta(carpetaId, nuevaCarpetaPadreId, userId)

// Buscar carpetas
buscarCarpetas(nombreBusqueda)
```

### materialService.js (actualizado)

```javascript
// Ahora acepta carpetaId
subirMaterial(materialData, usuario, archivo)
// materialData.carpetaId: ID de la carpeta destino

// Obtener materiales por carpeta
obtenerMaterialesPorCarpeta(carpetaId)
```

## Componentes React

### FolderCard
Props:
- `folder`: Objeto de carpeta
- `onOpen`: Handler al abrir carpeta
- `onRename`: Handler para renombrar
- `onDelete`: Handler para eliminar
- `onMove`: Handler para mover
- `canEdit`: Boolean, permisos de edición

### Breadcrumb
Props:
- `ruta`: Array de carpetas en la ruta
- `onNavigate`: Handler de navegación

### CreateFolderModal
Props:
- `isOpen`: Estado del modal
- `onClose`: Handler de cierre
- `onCrear`: Handler de creación
- `carpetaPadre`: Carpeta actual (puede ser null)

## Estructura Jerárquica Creada

```
Material (raíz)
├── 1° Semestre
│   ├── Nivelación Cálculo
│   ├── Química para Ingeniería (QIM100E)
│   │   ├── Pruebas anteriores
│   │   ├── Taller
│   │   │   ├── T1, T2, T3, T4, T5
│   │   │   └── Otros
│   │   └── Clases
│   ├── Cálculo 1 (MAT1610)
│   │   ├── Pruebas Anteriores
│   │   ├── Controles y Guías
│   │   ├── Libros
│   │   └── Ayudantías
│   └── Álgebra Lineal (MAT1203)
│       ├── Pruebas Anteriores
│       │   ├── I1, I2, I3
│       │   ├── Examen
│       │   └── Ejercicios
│       ├── Apuntes, Libro y Ejercicios
│       └── Catedra
├── 2° Semestre
│   ├── Cálculo 2 (MAT1620)
│   ├── Dinámica (FIS1514)
│   ├── Intro a la Economía (ICS1513)
│   └── Intro a la Progra (IIC1103)
│       ├── Clases Francisca Cattan
│       │   ├── Semana 1...14
│       │   └── Repasos
│       └── Jorge Muñoz 2024-2
├── 3° Semestre
│   ├── Cálculo 3 (MAT1630)
│   ├── EDO (MAT1640)
│   └── Termodinámica
├── 4° Semestre
│   ├── Proba (EYP1113)
│   └── Electricidad y Magnetismo (FIS1533)
├── Majors
│   ├── Transporte y Logística (ICT)
│   ├── Hidráulica y Ambiental (ICH)
│   ├── Industrial (ICS)
│   ├── Mecánica de Fluidos (ICH1104)
│   ├── Estructural y Geotecnia
│   ├── Diseño Gráfico (ICM2313)
│   ├── Computación
│   └── [7 más...]
├── Red apoyo Fundamenta
│   ├── Ejercicios y Exámenes pasados
│   ├── Resúmenes
│   └── Videos + Repasos
├── Examen de Comunicación Escrita VRA 100C
└── Exploratorios
    └── Diseño Gráfico en Ingeniería Mecánica
```

## Próximas Mejoras (Futuras)

- [ ] Implementar drag & drop para mover carpetas/archivos
- [ ] Sistema de permisos compartidos
- [ ] Vista en lista vs grid
- [ ] Búsqueda global dentro de carpetas
- [ ] Favoritos/Carpetas destacadas
- [ ] Historial de navegación
- [ ] Breadcrumb colapsable para rutas largas

## Notas Importantes

1. **Compatibilidad Retroactiva**: Los materiales existentes sin `carpetaId` se mostrarán en la raíz
2. **Eliminación en Cascada**: Al eliminar una carpeta, se eliminan sus subcarpetas (los archivos deben manejarse manualmente por ahora)
3. **Permisos**: Por defecto, solo el creador puede editar/eliminar carpetas
4. **Navegación**: El estado de la carpeta actual se mantiene en el componente Material.jsx

## Soporte

Para cualquier problema o mejora, contacta al equipo de desarrollo o abre un issue en el repositorio.
