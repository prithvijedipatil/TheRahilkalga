// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqoj3oCQga3DeOYfbJ0M8l4PUL-JHTsQo",
  authDomain: "cafeorderingsystem.firebaseapp.com",
  projectId: "cafeorderingsystem",
  storageBucket: "cafeorderingsystem.firebasestorage.app",
  messagingSenderId: "664765548491",
  appId: "1:664765548491:web:c23645c9f1f0a93883584e",
  measurementId: "G-KZDD63P3NV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // Export auth
export { signInWithEmailAndPassword, signOut };
