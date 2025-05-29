// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNPeX5w86UK6hPKTGslxGLqEAAfzp2TrU",
  authDomain: "dorr-1ae6f.firebaseapp.com",
  projectId: "dorr-1ae6f",
  storageBucket: "dorr-1ae6f.firebasestorage.app",
  messagingSenderId: "212791336381",
  appId: "1:212791336381:web:7008ed9e8048e00776c6d4",
  measurementId: "G-M0WLHXXJWJ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };