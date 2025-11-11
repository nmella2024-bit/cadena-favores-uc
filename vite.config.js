import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    // Configuración optimizada para producción
    rollupOptions: {
      output: {
        // Separar vendors en chunks específicos para mejor caché
        manualChunks: {
          // Chunk para React y librerías relacionadas
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Chunk separado para Firebase (es grande)
          'firebase-vendor': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
            'firebase/analytics'
          ],

          // Chunk para UI components y lucide icons
          'ui-vendor': [
            'lucide-react',
            '@headlessui/react'
          ],
        },
      },
    },

    // Aumentar el límite de advertencia de tamaño de chunk
    chunkSizeWarningLimit: 1000,

    // Desactivar sourcemaps en producción para reducir tamaño
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
