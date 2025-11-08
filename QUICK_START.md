# Quick Start - Migración Google Drive

## ⚡ Inicio Rápido (10 minutos)

### Paso 1: Probar conexión
```bash
npm run test:drive
```
✅ Debe decir: "TODO FUNCIONANDO CORRECTAMENTE"

---

### Paso 2: Ver estado actual
```bash
npm run folders:status
```
Verás cuántas carpetas necesitan `googleDriveFolderId`

---

### Paso 3: Migrar carpetas

**¿Tus carpetas ya existen en Google Drive?**

**SÍ** → Ejecuta:
```bash
npm run folders:migrate
```

**NO** → Ejecuta:
```bash
npm run folders:create-drive
```

**No estoy seguro** → Ejecuta ambos (no hay problema):
```bash
npm run folders:migrate
npm run folders:create-drive
```

---

### Paso 4: Configurar Vercel

1. Ve a: https://vercel.com/dashboard
2. Tu proyecto → Settings → Environment Variables
3. Click "Add New"
4. Llena:
   ```
   Name: FIREBASE_SERVICE_ACCOUNT
   Value: (copia el JSON del archivo coherent-flame-475215-f0-4fff3af9eaec.json)
   Environments: ✓ Production ✓ Preview ✓ Development
   ```
5. Save

---

### Paso 5: Deploy
```bash
git add .
git commit -m "Add Google Drive integration"
git push
```

---

### Paso 6: Probar

1. Abre tu app
2. Ve a Material
3. Entra a una carpeta
4. Sube un archivo
5. Verifica que aparece en Google Drive

---

## ✅ Listo!

Si todo funciona, los archivos ahora se guardan en Google Drive.

---

## ❌ Si algo falla

### Test de conexión falla
- Verifica que existe: `coherent-flame-475215-f0-4fff3af9eaec.json`
- Ejecuta de nuevo: `npm run test:drive`

### Carpetas no se encuentran
- Nombres deben coincidir exactamente
- Usa: `npm run folders:create-drive` para crearlas

### Error en Vercel
- Verifica que copiaste bien el JSON completo
- Debe empezar con `{"type":"service_account"...`
- Debe terminar con `..."universe_domain":"googleapis.com"}`

### Archivo no se sube a Drive
- Verifica: `npm run folders:status`
- La carpeta DEBE tener `googleDriveFolderId`
- Si no lo tiene: `npm run folders:migrate`

---

## 📚 Más Información

- [RESUMEN_MIGRACION.md](RESUMEN_MIGRACION.md) - Resumen completo
- [GUIA_MIGRACION_DRIVE.md](GUIA_MIGRACION_DRIVE.md) - Guía detallada
- [COMO_FUNCIONA_UPLOAD_DRIVE.md](COMO_FUNCIONA_UPLOAD_DRIVE.md) - Cómo funciona

---

## 🆘 Comandos Útiles

```bash
# Ver estado de carpetas
npm run folders:status

# Probar conexión
npm run test:drive

# Migrar carpetas existentes
npm run folders:migrate

# Crear carpetas nuevas
npm run folders:create-drive
```

---

**¿Dudas?** Lee [GUIA_MIGRACION_DRIVE.md](GUIA_MIGRACION_DRIVE.md) para más detalles.
