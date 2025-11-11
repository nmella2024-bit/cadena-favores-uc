// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// NUEVO PROYECTO: red-uc-eeuu (región US)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validar que las variables de entorno estén configuradas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const errorMsg = 'FIREBASE ERROR: Variables de entorno faltantes. Revisa la configuración en Vercel.';
  console.error(errorMsg);
  console.error('Variables faltantes:', {
    apiKey: !firebaseConfig.apiKey ? 'VITE_FIREBASE_API_KEY ❌' : '✅',
    authDomain: !firebaseConfig.authDomain ? 'VITE_FIREBASE_AUTH_DOMAIN ❌' : '✅',
    projectId: !firebaseConfig.projectId ? 'VITE_FIREBASE_PROJECT_ID ❌' : '✅',
    storageBucket: !firebaseConfig.storageBucket ? 'VITE_FIREBASE_STORAGE_BUCKET ❌' : '✅',
    messagingSenderId: !firebaseConfig.messagingSenderId ? 'VITE_FIREBASE_MESSAGING_SENDER_ID ❌' : '✅',
    appId: !firebaseConfig.appId ? 'VITE_FIREBASE_APP_ID ❌' : '✅',
  });

  // Mostrar mensaje visible en la página para debugging
  if (typeof document !== 'undefined') {
    document.body.innerHTML = `
      <div style="padding: 40px; font-family: system-ui; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #dc2626;">⚠️ Error de Configuración</h1>
        <p>Las variables de entorno de Firebase no están configuradas correctamente.</p>
        <h2>Variables faltantes:</h2>
        <ul>
          ${!firebaseConfig.apiKey ? '<li>❌ VITE_FIREBASE_API_KEY</li>' : '<li>✅ VITE_FIREBASE_API_KEY</li>'}
          ${!firebaseConfig.authDomain ? '<li>❌ VITE_FIREBASE_AUTH_DOMAIN</li>' : '<li>✅ VITE_FIREBASE_AUTH_DOMAIN</li>'}
          ${!firebaseConfig.projectId ? '<li>❌ VITE_FIREBASE_PROJECT_ID</li>' : '<li>✅ VITE_FIREBASE_PROJECT_ID</li>'}
          ${!firebaseConfig.storageBucket ? '<li>❌ VITE_FIREBASE_STORAGE_BUCKET</li>' : '<li>✅ VITE_FIREBASE_STORAGE_BUCKET</li>'}
          ${!firebaseConfig.messagingSenderId ? '<li>❌ VITE_FIREBASE_MESSAGING_SENDER_ID</li>' : '<li>✅ VITE_FIREBASE_MESSAGING_SENDER_ID</li>'}
          ${!firebaseConfig.appId ? '<li>❌ VITE_FIREBASE_APP_ID</li>' : '<li>✅ VITE_FIREBASE_APP_ID</li>'}
        </ul>
        <h3>Cómo solucionarlo:</h3>
        <ol>
          <li>Ve a tu Dashboard de Vercel</li>
          <li>Selecciona tu proyecto</li>
          <li>Ve a Settings → Environment Variables</li>
          <li>Agrega todas las variables que faltan</li>
          <li>Redeploya el proyecto</li>
        </ol>
      </div>
    `;
  }

  throw new Error(errorMsg);
}

// Initialize Firebase
let app, analytics, auth, db, storage;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase inicializado correctamente');

  // Initialize Analytics only if supported (prevents errors in unsupported environments)
  analytics = null;
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
      console.log('✅ Analytics inicializado');
    }
  }).catch(err => {
    console.warn('Analytics not supported:', err);
  });

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error);
  throw error;
}

export { app, analytics, auth, db, storage };
