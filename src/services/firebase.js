// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYVJ8pWsFCNku7MxDoKmdNh1phqqMyLJI",
  authDomain: "the-rahil-s-d3cdd.firebaseapp.com",
  projectId: "the-rahil-s-d3cdd",
  storageBucket: "the-rahil-s-d3cdd.firebasestorage.app",
  messagingSenderId: "55219823426",
  appId: "1:55219823426:web:650f0e1cbe66af69859edb",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // Export auth
export { signInWithEmailAndPassword, signOut };
