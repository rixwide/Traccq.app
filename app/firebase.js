//Import Firebase
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

//Config from Project Firebase Console
const firebaseconfig = {
    apiKey: "AIzaSyDP68axhcLKlCarf6JAS9x0ylDzHmVTmE8",
    authDomain: "traccq-base.firebaseapp.com",
    projectId: "traccq-base",
    storageBucket: "traccq-base.firebasestorage.app",
    messagingSenderId: "993516633473",
    appId: "1:993516633473:web:0ba72d73c3b71bdc2e7c80",
    measurementId: "G-KMWZ51SCHN"

};

//Init Firebase
const app = initializeApp(firebaseconfig);

export const auth = getAuth(app);
export const db = getFirestore(app);