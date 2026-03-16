import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
 apiKey: "AIzaSyCfZsPLTR6UVIfq3B6Va2fNLRH6h8Mk9tY",
  authDomain: "medaccess-fcf50.firebaseapp.com",
  projectId: "medaccess-fcf50",
  storageBucket: "medaccess-fcf50.firebasestorage.app",
  messagingSenderId: "863318366655",
  appId: "1:863318366655:web:1043871a5dec432601e90a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
