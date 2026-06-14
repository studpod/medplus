// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC4q0HsqvXSsNOXYQRULDXpYEV0IWd5-as",
    authDomain: "medplus-auth-fb352.firebaseapp.com",
    projectId: "medplus-auth-fb352",
    storageBucket: "medplus-auth-fb352.firebasestorage.app",
    messagingSenderId: "185801907755",
    appId: "1:185801907755:web:6db15c1b8c9ef84d00946e",
    measurementId: "G-D1F2RSQDF7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);