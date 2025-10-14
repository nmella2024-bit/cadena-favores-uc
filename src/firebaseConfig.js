// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKoXS4QXnf-7MtCQk_pnNaa3anfsJ3dSU",
  authDomain: "red-uc-8c043.firebaseapp.com",
  projectId: "red-uc-8c043",
  storageBucket: "red-uc-8c043.firebasestorage.app",
  messagingSenderId: "164069116151",
  appId: "1:164069116151:web:5564c7bc858ee678d96bf2",
  measurementId: "G-VBRSLB5Q5V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
