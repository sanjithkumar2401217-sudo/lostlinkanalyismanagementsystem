// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqd38YNh20irquYSYrSQ_HcRwAOo51RVc",
  authDomain: "lostlink-9121d.firebaseapp.com",
  projectId: "lostlink-9121d",
  storageBucket: "lostlink-9121d.firebasestorage.app",
  messagingSenderId: "25659936013",
  appId: "1:25659936013:web:a46d2e316f5bddbd82b444",
  measurementId: "G-4PPE68S8DD",
  databaseURL: "https://lostlink-9121d-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
