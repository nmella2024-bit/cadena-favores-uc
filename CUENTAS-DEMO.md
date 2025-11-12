# Cuentas Demo para Testing

Este documento contiene las credenciales de acceso para las cuentas demo creadas automáticamente para testing.

## Cuentas Disponibles

### 1. Usuario con Rol Exclusivo

- **Email:** `demo-exclusivo@reduc.test`
- **Contraseña:** `Demo123456`
- **Rol:** `exclusivo`
- **Carrera:** Ingeniería Comercial
- **Año:** 3
- **UID:** TTnkRNd6ZAVGz2vYDUMR89Y9EgE3
- **Email Verificado:** ✅ Sí

**Características:**
- Puede crear anuncios
- Puede crear material de estudio
- Puede acceder a todas las funcionalidades premium
- Puede moderar reportes
- Puede gestionar carpetas de Drive

---

### 2. Usuario con Rol Normal

- **Email:** `demo-normal@reduc.test`
- **Contraseña:** `Demo123456`
- **Rol:** `normal`
- **Carrera:** Enfermería
- **Año:** 2
- **UID:** iyJvjaAJZVdSW8Wal7jxnkuzReB3
- **Email Verificado:** ✅ Sí

**Características:**
- Puede publicar favores
- Puede ofrecer ayuda
- Puede acceder al marketplace
- Puede usar UCloseMeal
- Funcionalidades básicas de la plataforma

---

## Recrear las Cuentas

Si necesitas recrear estas cuentas demo, ejecuta:

```bash
npm run demo:accounts
```

El script verificará si las cuentas ya existen y las actualizará si es necesario.

---

## Notas Importantes

- Estas cuentas tienen emails verificados automáticamente
- Ambas cuentas tienen la misma contraseña para facilitar el testing
- Los emails usan el dominio `@reduc.test` que no es real
- Las cuentas están configuradas con datos de ejemplo realistas
- Reputación inicial: 5.0 estrellas

---

## Testing de Roles

### Funcionalidades Exclusivas (Solo usuario exclusivo)

1. **Anuncios**
   - Crear anuncios
   - Editar sus propios anuncios
   - Ver todos los anuncios

2. **Material de Estudio**
   - Subir material
   - Gestionar carpetas
   - Organizar archivos en Drive

3. **Moderación**
   - Ver reportes
   - Actualizar estado de reportes
   - Gestionar contenido reportado

### Funcionalidades Comunes (Ambos usuarios)

1. **Favores**
   - Publicar favores
   - Ofrecer ayuda
   - Calificar usuarios

2. **Marketplace**
   - Publicar productos
   - Ver productos
   - Contactar vendedores

3. **UCloseMeal**
   - Crear pedidos
   - Ofrecer delivery
   - Coordinar entregas

4. **Perfil**
   - Editar información personal
   - Subir foto de perfil
   - Ver historial de favores
