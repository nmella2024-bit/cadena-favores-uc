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
  console.error('Error: Firebase configuration is missing. Please check your environment variables.');
  console.error('Missing variables:', {
    apiKey: !firebaseConfig.apiKey ? 'VITE_FIREBASE_API_KEY' : 'OK',
    authDomain: !firebaseConfig.authDomain ? 'VITE_FIREBASE_AUTH_DOMAIN' : 'OK',
    projectId: !firebaseConfig.projectId ? 'VITE_FIREBASE_PROJECT_ID' : 'OK',
    storageBucket: !firebaseConfig.storageBucket ? 'VITE_FIREBASE_STORAGE_BUCKET' : 'OK',
    messagingSenderId: !firebaseConfig.messagingSenderId ? 'VITE_FIREBASE_MESSAGING_SENDER_ID' : 'OK',
    appId: !firebaseConfig.appId ? 'VITE_FIREBASE_APP_ID' : 'OK',
  });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported (prevents errors in unsupported environments)
let analytics = null;
isSupported().then(yes => {
  if (yes) {
    analytics = getAnalytics(app);
  }
}).catch(err => {
  console.warn('Analytics not supported:', err);
});

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
