# Sistema de Códigos de Referidos - NexUC

## 📋 Descripción

Sistema completo de códigos de amigo/referidos para la plataforma NexUC. Permite a los usuarios invitar a otros usando códigos únicos y realizar tracking para concursos.

## ✨ Funcionalidades Implementadas

### 1. **Generación Automática de Códigos**
- Cada usuario registrado obtiene un código único de 6 caracteres
- Formato: Primeros 6 caracteres del UID en mayúsculas (Ej: `ABC123`)
- Se genera automáticamente al crear la cuenta

### 2. **Registro con Código de Referido**
- Campo opcional en el formulario de registro
- Validación en tiempo real del código
- Soporta tanto código directo como link completo
- Feedback visual cuando el código es válido/inválido
- Pre-llenado automático si viene desde URL (`/registro?ref=ABC123`)

### 3. **Tracking de Referidos**
- Colección `referidos` en Firestore con:
  - Usuario que refirió (referrer)
  - Usuario referido (referred)
  - Código usado
  - Fecha de registro
  - Estado (completado/pendiente)
  - Email del referido
- Contador automático (`totalReferidos`) en el perfil del usuario

### 4. **Panel de Usuario**
- Componente `ReferralStats` con:
  - Código de referido del usuario
  - Botón para copiar código
  - Link completo para compartir
  - Botón de compartir (usa Web Share API)
  - Contador de referidos actuales
- Página completa `/mis-referidos` con:
  - Lista detallada de todos los referidos
  - Información de cada usuario referido
  - Fechas de registro
  - Estados de verificación

### 5. **Ranking Público (Admin/Exclusivo)**
- Página `/ranking-referidos` con:
  - Top 50 usuarios con más referidos
  - Estadísticas generales del sistema
  - Exportación a CSV para análisis
  - Diseño con medallas para top 3
  - Restricción de acceso (solo admin/exclusivo)

### 6. **Prevención de Fraude**
- No se permite auto-referido (usar propio código)
- Un usuario solo puede ser referido una vez
- Códigos inmutables una vez registrados
- Validación de email UC obligatoria

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

```
src/
├── services/
│   └── referralService.js          # Lógica de negocio de referidos
├── components/
│   └── ReferralStats.jsx           # Componente de estadísticas
└── pages/
    ├── MisReferidos.jsx            # Vista de mis referidos
    └── RankingReferidos.jsx        # Vista de ranking (admin)

scripts/
└── migrate-add-referral-codes.cjs  # Script de migración
```

### Archivos Modificados

```
src/
├── services/
│   ├── userService.js              # + Códigos en creación de usuario
│   └── authService.js              # + Parámetro de código en registro
├── context/
│   └── AuthContext.jsx             # + Soporte para código en registro
├── pages/
│   └── Registro.jsx                # + Campo de código con validación
└── App.jsx                         # + Rutas nuevas

firestore.rules                     # + Reglas para colección referidos
```

## 🚀 Instrucciones de Deployment

### 1. **Actualizar Reglas de Firestore**

```bash
firebase deploy --only firestore:rules
```

### 2. **Migrar Usuarios Existentes** (Opcional)

Si ya tienes usuarios en la plataforma, ejecuta el script de migración:

```bash
node scripts/migrate-add-referral-codes.cjs
```

Este script:
- ✅ Lee todos los usuarios existentes
- ✅ Genera códigos para los que no tienen
- ✅ Agrega campo `totalReferidos: 0`
- ✅ No afecta usuarios que ya tienen código

### 3. **Desplegar Aplicación**

```bash
npm run build
firebase deploy
```

O si usas Vercel:
```bash
vercel --prod
```

## 📖 Uso del Sistema

### Para Usuarios Regulares

#### **Obtener tu código:**
1. Iniciar sesión en NexUC
2. Ir a "Mis Referidos" desde el menú
3. Copiar tu código único o link completo

#### **Compartir:**
- **Opción 1:** Compartir solo el código (Ej: `ABC123`)
- **Opción 2:** Compartir el link completo (Ej: `nexuc.com/registro?ref=ABC123`)
- **Opción 3:** Usar botón "Compartir" (móviles)

#### **Ver referidos:**
- Acceder a `/mis-referidos`
- Ver lista completa de usuarios invitados
- Consultar fechas y estados

### Para Nuevos Usuarios

1. Recibir código o link de un amigo
2. Al registrarse, ingresar el código en el campo opcional
3. El sistema valida el código en tiempo real
4. Si es válido, muestra confirmación con nombre del referidor
5. Completar registro normalmente

### Para Administradores

#### **Ver Ranking:**
- Acceder a `/ranking-referidos`
- Ver estadísticas generales
- Consultar top usuarios
- Exportar datos a CSV

#### **Exportar Datos:**
1. En la página de ranking, clic en "Exportar CSV"
2. Se descarga archivo con:
   - Posición
   - Nombre
   - Email
   - Carrera
   - Total referidos
   - Código

## 🔒 Reglas de Seguridad

### Colección `referidos`

```javascript
// Leer: Solo tus propios referidos o si eres admin
allow read: if request.auth.uid == resource.data.referidoPor ||
               request.auth.uid == resource.data.referido ||
               esUsuarioExclusivoOAdmin();

// Crear: Solo si eres el usuario referido
allow create: if request.auth.uid == request.resource.data.referido;

// Actualizar: Prohibido (inmutables)
allow update: if false;

// Eliminar: Solo admins
allow delete: if esUsuarioAdmin();
```

### Colección `usuarios` (campos agregados)

```javascript
codigoReferido: string          // Código único (6 chars)
totalReferidos: number          // Contador de referidos
fechaGeneracionCodigo: timestamp // Cuándo se generó
```

## 🎯 Modelo de Datos

### Documento de Usuario (usuarios/{userId})

```javascript
{
  // ... campos existentes
  codigoReferido: "ABC123",
  totalReferidos: 5,
  fechaGeneracionCodigo: Timestamp
}
```

### Documento de Referido (referidos/{referidoId})

```javascript
{
  referidoPor: "userId123",           // UID del referidor
  referido: "newUserId456",           // UID del nuevo usuario
  codigoReferido: "ABC123",           // Código usado
  fechaRegistro: Timestamp,           // Cuándo se registró
  estado: "completado",               // completado | pendiente
  emailReferido: "nuevo@uc.cl"       // Email del referido
}
```

## 🧪 Testing

### Flujo Completo de Prueba

1. **Usuario A crea cuenta:**
   ```
   - Se registra normalmente
   - Recibe código automático: XYZ789
   - totalReferidos = 0
   ```

2. **Usuario A comparte código:**
   ```
   - Va a /mis-referidos
   - Copia código XYZ789
   - Envía a Usuario B
   ```

3. **Usuario B se registra:**
   ```
   - Abre nexuc.com/registro?ref=XYZ789
   - Campo se pre-llena con XYZ789
   - Sistema muestra: "✓ Código válido: Te invitó [Nombre A]"
   - Completa registro
   ```

4. **Sistema registra referido:**
   ```
   - Crea documento en /referidos
   - Incrementa totalReferidos de Usuario A
   - Usuario A ve a Usuario B en su lista
   ```

5. **Ver ranking:**
   ```
   - Admin accede a /ranking-referidos
   - Ve a Usuario A con 1 referido
   - Puede exportar datos
   ```

## 📊 Estadísticas y Métricas

El sistema proporciona:

- **Total de referidos** registrados
- **Usuarios con código** generado
- **Usuarios activos** (con al menos 1 referido)
- **Promedio de referidos** por usuario
- **Ranking** ordenado por cantidad

## 🐛 Troubleshooting

### "Código no válido" al ingresar código correcto

**Solución:** Verificar que:
1. El usuario que refiere existe en Firestore
2. El campo `codigoReferido` está en mayúsculas
3. No hay espacios extra en el código

### Contador no se incrementa

**Solución:** Verificar reglas de Firestore y permisos de escritura en colección `referidos`

### Script de migración falla

**Solución:**
1. Verificar que `serviceAccountKey.json` existe
2. Confirmar permisos del service account
3. Revisar logs para errores específicos

### Usuarios existentes no tienen código

**Solución:** Ejecutar script de migración:
```bash
node scripts/migrate-add-referral-codes.cjs
```

## 🎨 Personalización

### Cambiar formato de código

Editar en `src/services/referralService.js`:

```javascript
export const generateReferralCode = (userId) => {
  // Actual: primeros 6 caracteres
  return userId.substring(0, 6).toUpperCase();

  // Alternativa 1: 8 caracteres
  // return userId.substring(0, 8).toUpperCase();

  // Alternativa 2: Random de 6 letras
  // return Math.random().toString(36).substring(2, 8).toUpperCase();
};
```

### Modificar límite de ranking

En `src/pages/RankingReferidos.jsx`:

```javascript
getReferralRanking(50) // Cambiar 50 al límite deseado
```

### Personalizar mensajes

Editar textos en:
- `src/pages/Registro.jsx` - Mensajes de validación
- `src/components/ReferralStats.jsx` - Instrucciones
- `src/pages/MisReferidos.jsx` - Info del concurso

## 📝 Notas Adicionales

- El sistema NO requiere aprobación manual
- Los códigos son **case-insensitive** (se normalizan a mayúsculas)
- Un usuario puede compartir su código **ilimitadamente**
- Los referidos se cuentan **desde el momento del registro**
- El código es **permanente** (no cambia)

## 🏆 Concurso de Referidos

**Fecha límite:** 21 de noviembre de 2025

Para el concurso:
1. Ver ranking en `/ranking-referidos`
2. Exportar CSV antes de la fecha límite
3. Los usuarios con más referidos ganan
4. Solo cuentan registros completados (email verificado)

## 🔗 Enlaces Útiles

- **Mis Referidos:** `/mis-referidos`
- **Ranking:** `/ranking-referidos`
- **Registro con código:** `/registro?ref=CODIGO`

## 🆘 Soporte

Para problemas o preguntas:
1. Revisar esta documentación
2. Consultar logs en Firebase Console
3. Verificar reglas de Firestore
4. Contactar al equipo de desarrollo

---

**Última actualización:** 2025-01-17
**Versión:** 1.0.0
