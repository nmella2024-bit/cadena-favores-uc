# Funciones de Limpieza Automática

Este documento describe las Cloud Functions que mantienen la base de datos limpia eliminando contenido expirado y finalizado automáticamente.

## Funciones Implementadas

### 1. `eliminarContenidoExpirado`

**Tipo:** Scheduled Function
**Frecuencia:** Cada 1 hora
**Horario:** Continuo (24/7)
**Zona horaria:** America/Santiago

**Descripción:**
Elimina automáticamente favores y anuncios que han llegado a su fecha de expiración. Los elementos fijados (con `fijado: true`) no se eliminan automáticamente.

**Qué elimina:**
- Favores activos cuya `fechaExpiracion` ha pasado
- Anuncios cuya `fechaExpiracion` ha pasado
- **No elimina:** Elementos con `fijado: true`

**Logs:**
```
🔍 Buscando favores expirados...
📋 Se encontraron X favores expirados
🗑️ Eliminando favor: ID - "Título"
✅ Se eliminaron X favores expirados
```

### 2. `limpiarFavoresFinalizados`

**Tipo:** Scheduled Function
**Frecuencia:** Cada día
**Horario:** 02:00 AM
**Zona horaria:** America/Santiago

**Descripción:**
Elimina automáticamente favores que fueron finalizados hace más de 30 días. Esto permite a los usuarios tener un historial reciente para ver y calificar favores completados, pero mantiene la base de datos limpia eliminando datos antiguos.

**Qué elimina:**
- Favores con `estado: "finalizado"`
- Cuya `fechaFinalizacion` sea mayor a 30 días desde hoy
- Incluye limpieza en cascada de reportes asociados

**Por qué 30 días:**
- Permite a los usuarios ver su historial reciente
- Da tiempo suficiente para calificar a los ayudantes
- Mantiene métricas recientes de reputación
- Evita acumulación excesiva de datos

**Logs:**
```
🧹 Iniciando limpieza de favores finalizados...
📅 Buscando favores finalizados antes de: 2025-10-14T02:00:00.000Z
📋 Se encontraron X favores finalizados para eliminar
🗑️ Eliminando favor finalizado: ID - "Título" (finalizado el ...)
📝 Eliminando Y reportes asociados al favor
✅ Batch ejecutado: X favores procesados
🎉 Limpieza completada. Total eliminados: X favores finalizados
```

### 3. `eliminarNotificacionLeida` (NUEVA)

**Tipo:** Firestore Trigger (onDocumentUpdated)
**Trigger:** Cuando se actualiza un documento en `notificaciones/{notificationId}`
**Ejecución:** Instantánea (en tiempo real)

**Descripción:**
Se ejecuta automáticamente cada vez que una notificación es actualizada. Si la notificación cambia de NO leída a leída (campo `leida` cambia de `false` a `true`), la elimina inmediatamente. Esto mantiene la colección de notificaciones limpia y solo contiene notificaciones activas/no leídas.

**Qué elimina:**
- Notificaciones que cambian de `leida: false` a `leida: true`
- Eliminación instantánea (en milisegundos después de marcar como leída)

**Por qué eliminar notificaciones leídas:**
- Mantiene la colección limpia y pequeña
- Mejora el rendimiento de las queries
- Reduce costos de almacenamiento
- Las notificaciones leídas ya cumplieron su propósito

**Flujo de funcionamiento:**
```
Usuario marca notificación como leída
    ↓
Campo leida cambia: false → true
    ↓
Trigger detecta el cambio
    ↓
Función elimina la notificación instantáneamente
    ↓
✅ Notificación eliminada de la base de datos
```

**Logs:**
```
📬 Notificación abc123 marcada como leída, eliminando...
✅ Notificación abc123 eliminada exitosamente
```

## Índices Requeridos en Firestore

Para que estas funciones funcionen eficientemente, asegúrate de tener los siguientes índices compuestos:

### Para `eliminarContenidoExpirado`:
```
Colección: favores
Campos: fechaExpiracion (Ascending), fijado (Ascending), estado (Ascending)
```

```
Colección: anuncios
Campos: fechaExpiracion (Ascending), fijado (Ascending)
```

### Para `limpiarFavoresFinalizados`:
```
Colección: favores
Campos: estado (Ascending), fechaFinalizacion (Ascending)
```

```
Colección: reportes
Campos: contentType (Ascending), contentId (Ascending)
```

## Deployment

### Desplegar todas las funciones:
```bash
cd functions
npm run build
npm run deploy
```

### Desplegar solo una función específica:
```bash
firebase deploy --only functions:limpiarFavoresFinalizados
```

### Ver logs en tiempo real:
```bash
firebase functions:log
```

### Ver logs de una función específica:
```bash
firebase functions:log --only limpiarFavoresFinalizados
```

## Configuración

### Cambiar el período de retención

Para cambiar los 30 días a otro valor, edita el archivo `functions/src/index.ts`:

```typescript
// Cambiar este número para ajustar el período
const fecha30DiasAtras = new Date();
fecha30DiasAtras.setDate(fecha30DiasAtras.getDate() - 30); // Cambiar 30 por el valor deseado
```

### Cambiar la frecuencia de ejecución

Para cambiar cuándo se ejecuta la limpieza, edita el schedule:

```typescript
export const limpiarFavoresFinalizados = onSchedule({
  schedule: "every day 02:00", // Cambiar esto
  timeZone: "America/Santiago",
  region: "us-central1",
}, async (event) => {
  // ...
});
```

Ejemplos de schedules:
- `"every day 02:00"` - Todos los días a las 2 AM
- `"every 12 hours"` - Cada 12 horas
- `"every monday 00:00"` - Todos los lunes a medianoche
- `"every 1 hours"` - Cada hora

## Monitoreo

### En Firebase Console:
1. Ve a Firebase Console > Functions
2. Selecciona `limpiarFavoresFinalizados`
3. Ve a la pestaña "Logs"
4. Filtra por fecha/hora

### Métricas importantes:
- **Invocaciones:** Cuántas veces se ha ejecutado
- **Errores:** Si hay problemas en la ejecución
- **Tiempo de ejecución:** Cuánto tarda cada limpieza
- **Memoria usada:** Consumo de recursos

## Costos

Las Cloud Functions tienen los siguientes límites gratuitos (Spark plan):
- 2M invocaciones/mes
- 400,000 GB-seg de tiempo de cómputo
- 200,000 GHz-seg de tiempo de CPU

Con esta configuración (1 ejecución diaria):
- **Invocaciones mensuales:** ~30 (muy por debajo del límite)
- **Costo estimado:** $0 (dentro del plan gratuito)

## Troubleshooting

### La función no se ejecuta

1. Verifica que esté desplegada:
```bash
firebase functions:list
```

2. Verifica los logs para ver errores:
```bash
firebase functions:log --only limpiarFavoresFinalizados
```

### Error de permisos

Si ves errores de permisos en los logs:
- Verifica que Firebase Admin esté inicializado correctamente
- Asegúrate de que la Service Account tenga permisos de Firestore

### No se eliminan favores

1. Verifica que los favores tengan el campo `fechaFinalizacion`:
   - Este campo se agrega automáticamente al finalizar un favor
   - Si tienes favores antiguos sin este campo, no se eliminarán

2. Verifica los índices compuestos en Firestore Console

### Ejecutar manualmente para pruebas

No puedes ejecutar scheduled functions manualmente desde el emulador local. Opciones:

1. **Cambiar temporalmente a HTTP function** para pruebas:
```typescript
import {onRequest} from "firebase-functions/v2/https";

export const limpiarFavoresFinalizadosManual = onRequest(async (req, res) => {
  // Copiar lógica de limpiarFavoresFinalizados aquí
  res.send("Limpieza completada");
});
```

2. **Esperar a la siguiente ejecución programada** (recomendado para producción)

## Backup de Datos

Antes de habilitar estas funciones en producción, considera hacer un backup:

```bash
# Backup manual
firebase firestore:export gs://[TU-BUCKET]/backups/$(date +%Y-%m-%d)
```

O configurar backups automáticos en Firebase Console > Firestore > Backups.

## Referencias

- [Firebase Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions)
- [Firestore Batch Operations](https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes)
- [Firebase Functions Pricing](https://firebase.google.com/pricing)
