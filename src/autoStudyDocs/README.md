# Auto Study Docs Feature

Este módulo implementa la funcionalidad de generación automática de documentos de estudio utilizando IA (OpenAI).

## Estructura

- `aiService.js`: Servicio encargado de comunicarse con la API de OpenAI.
- `contextProcessor.js`: Módulo para procesar y extraer texto de archivos (PDF, TXT, MD).
- `AutoStudyWidget.jsx`: Componente principal de la interfaz de usuario (Modal).

## Configuración

Para que funcione, se requiere una API Key de OpenAI configurada en el archivo `.env` del proyecto:

```env
VITE_OPENAI_API_KEY=sk-...
```

## Uso

1. El usuario accede a la sección "Material" (solo Admins).
2. Hace clic en el botón "Generar con IA".
3. Ingresa un tema y selecciona un estilo.
4. Opcionalmente sube archivos de contexto.
5. Genera el documento y puede exportarlo a PDF o TXT.

## Dependencias

- `openai`: Cliente oficial de OpenAI.
- `pdfjs-dist`: Para lectura de PDFs.
- `jspdf` & `html2canvas`: Para exportación a PDF.
