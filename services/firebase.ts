import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAmoRjA7tE6mroIq1P-YXbIn38XkwGcQFw",
  authDomain: "watchlist-app-98f59.firebaseapp.com",
  projectId: "watchlist-app-98f59",
  storageBucket: "watchlist-app-98f59.firebasestorage.app",
  messagingSenderId: "819056028866",
  appId: "1:819056028866:web:045223f5de7b52d8bb9f5b",
  measurementId: "G-HBP2LVRPM7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);