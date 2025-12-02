# Auto Study Docs

Esta carpeta contiene la implementación de la funcionalidad **Auto Study Docs**, que permite generar material de estudio automáticamente utilizando Inteligencia Artificial (OpenAI).

## Estructura

- **`config.js`**: Configuración general y manejo de la API Key.
- **`services/`**:
    - `aiService.js`: Cliente para interactuar con la API de OpenAI.
    - `contextLoader.js`: Utilidad para leer y extraer texto de archivos (PDF, TXT, MD).
    - `generator.js`: Lógica de generación de prompts y creación de documentos.
- **`utils/`**:
    - `exportUtils.js`: Utilidades para exportar el contenido generado a PDF, TXT y Markdown.
- **`components/`**:
    - `AutoStudyInterface.jsx`: Componente principal de la interfaz de usuario.
    - `DocumentPreview.jsx`: Componente para visualizar y exportar el resultado.

## Uso

1.  **Acceso**: La funcionalidad está disponible en la página de **Material** (`/material`).
2.  **Permisos**: Actualmente, solo los usuarios con rol de **Administrador** pueden acceder. Para otros usuarios, el botón aparecerá deshabilitado.
3.  **Configuración**:
    - Al abrir la herramienta por primera vez, se solicitará una **OpenAI API Key**.
    - Esta clave se guarda localmente en el navegador (`localStorage`).
4.  **Generación**:
    - Ingresa un título para el documento.
    - Define los temas específicos que quieres cubrir.
    - Selecciona el estilo (Apuntes, Resumen, Guía, Explicación).
    - (Opcional) Sube archivos de contexto (PDF, TXT, MD) para que la IA los use como base.
5.  **Exportación**:
    - Una vez generado el documento, puedes visualizarlo en pantalla.
    - Usa los botones de exportación para descargar en PDF, Markdown o Texto plano.

## Dependencias

- `openai`: Cliente oficial de OpenAI.
- `jspdf`: Generación de PDFs.
- `html2canvas`: Captura del DOM para PDF.
- `pdfjs-dist`: Lectura de archivos PDF en el cliente.
