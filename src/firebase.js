import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDRl-RmOjjRBq4QcDO6p2PBEO5wheJDsjo",
  authDomain: "crispy-family.firebaseapp.com",
  projectId: "crispy-family",
  storageBucket: "crispy-family.firebasestorage.app",
  messagingSenderId: "124758250546",
  appId: "1:124758250546:web:1befba6ea71ee22fa7582b",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);