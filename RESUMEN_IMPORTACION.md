# Resumen Rápido: Importar 4000 Materiales

## ⚡ Guía Express (Para usuarios experimentados)

### 1. Preparar CSV
```bash
# Exportar desde Google Sheets como CSV
# Guardar como: materiales.csv
# Mover a: c:\Users\nmell\cadena-favores-uc\materiales.csv
```

### 2. Obtener Credenciales Firebase
```bash
# Descargar desde:
# https://console.firebase.google.com/project/red-uc-eeuu/settings/serviceaccounts/adminsdk
# Click en "Generar nueva clave privada"
# Renombrar a: serviceAccountKey.json
# Mover a: c:\Users\nmell\cadena-favores-uc\serviceAccountKey.json
```

### 3. Configurar Script
```javascript
// Editar: scripts/import-materiales-from-csv.js
// Línea 21: Cambiar AUTOR_ID por tu User ID real
const AUTOR_ID = 'ABC123...'; // Tu ID de Firebase Auth
```

### 4. Instalar y Ejecutar
```bash
# Instalar dependencias
npm install firebase-admin csv-parse

# Validar CSV (opcional pero recomendado)
npm run validate:csv

# Importar materiales
npm run import:materiales
```

---

## 📋 Checklist Pre-Importación

- [ ] Archivo `materiales.csv` en la raíz del proyecto
- [ ] Archivo `serviceAccountKey.json` en la raíz del proyecto
- [ ] AUTOR_ID actualizado en el script
- [ ] Dependencias instaladas (`firebase-admin` y `csv-parse`)
- [ ] CSV validado con `npm run validate:csv`

---

## 🎯 Comandos Principales

| Comando | Descripción |
|---------|-------------|
| `npm run validate:csv` | Valida el CSV antes de importar (recomendado) |
| `npm run import:materiales` | Importa los materiales a Firestore |

---

## 📊 Formato del CSV

**Columnas obligatorias:**
- `titulo` - Título del material
- `archivoUrl` - URL del archivo en Google Drive
- `tipo` - Tipo de material (PDF, Word, PowerPoint, etc.)

**Columnas opcionales:**
- `descripcion` - Descripción del material
- `carrera` - Carrera asociada
- `anio` - Año académico (1-7)
- `ramo` - Nombre del ramo
- `tags` - Etiquetas separadas por coma
- `carpetaRuta` - Ruta de la carpeta (ej: "1° Semestre/Ingeniería Civil/Cálculo I")
- `profesor` - Nombre del profesor
- `semestre` - Semestre (ej: "2024-1")

**Ver ejemplo completo:** `ejemplo-materiales.csv`

---

## ⚠️ Notas Importantes

1. **URLs de Google Drive deben ser públicas**
   - Click derecho → Compartir → "Cualquier persona con el enlace"

2. **carpetaRuta debe coincidir exactamente con las carpetas en Firestore**
   - Respeta mayúsculas, acentos y espacios
   - Si no existe, el material se guarda en la raíz

3. **El script NO verifica duplicados**
   - Si lo ejecutas 2 veces, tendrás materiales duplicados

4. **Tiempo de importación:**
   - ~4000 materiales = 2-5 minutos
   - Usa batches de 500 para optimizar

---

## 🐛 Errores Comunes

| Error | Solución |
|-------|----------|
| "No se encontró materiales.csv" | Verifica que esté en la raíz del proyecto |
| "Missing or insufficient permissions" | Verifica el archivo serviceAccountKey.json |
| "El AUTOR_ID no existe" | Actualiza AUTOR_ID con un usuario válido |
| "CSV parsing failed" | Exporta nuevamente desde Google Sheets |

---

## 📞 Documentación Completa

Para instrucciones detalladas paso a paso, ver: **INSTRUCCIONES_IMPORTAR_CSV.md**

---

## 🎉 Después de Importar

1. Verifica en Firebase Console:
   ```
   https://console.firebase.google.com/project/red-uc-eeuu/firestore/data/material
   ```

2. Verifica en la aplicación:
   ```
   http://localhost:5173/material
   ```

3. Los materiales deberían aparecer en sus carpetas correspondientes

---

¡Listo para importar! 🚀
