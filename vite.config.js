import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    // Configuración optimizada para producción
    rollupOptions: {
      output: {
        // Separar vendors en chunks específicos para mejor caché
        manualChunks: (id) => {
          // Chunk para node_modules (vendors)
          if (id.includes('node_modules')) {
            // React y TODOS sus relacionados en un solo chunk para evitar problemas
            if (id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('use-sync-external-store') ||
              id.includes('@react-aria') ||
              id.includes('@react-stately') ||
              id.includes('@tanstack/react')) {
              return 'react-vendor';
            }

            // Firebase
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'firebase-vendor';
            }

            // UI libraries
            if (id.includes('lucide-react') ||
              id.includes('@headlessui') ||
              id.includes('@floating-ui')) {
              return 'ui-vendor';
            }

            // Resto de vendors
            return 'vendor';
          }
        },
      },
    },

    // Aumentar el límite de advertencia de tamaño de chunk
    chunkSizeWarningLimit: 1000,

    // Deshabilitar sourcemaps para producción por seguridad
    sourcemap: false,

    // Minificación con esbuild (más rápido que terser)
    minify: 'esbuild',
  },

  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
    css: true,
  },
});
