// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// NUEVO PROYECTO: red-uc-eeuu (región US)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4ZjQw7PQ1fPSA2P9axFobTPkZmBAnKss",
  authDomain: "red-uc-eeuu.firebaseapp.com",
  projectId: "red-uc-eeuu",
  storageBucket: "red-uc-eeuu.firebasestorage.app",
  messagingSenderId: "705871614487",
  appId: "1:705871614487:web:aab5ec45d47db1f7d44252",
  measurementId: "G-8RV5170JWM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
