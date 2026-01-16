import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Config do seu Firebase (copiado exatamente do que você mandou)
const firebaseConfig = {
  apiKey: "AIzaSyDb1WzLdgi49Ptsha5SrDTXWqxJTXW6EkI",
  authDomain: "cofre-digital-9e27c.firebaseapp.com",
  projectId: "cofre-digital-9e27c",
  storageBucket: "cofre-digital-9e27c.firebasestorage.app",
  messagingSenderId: "825052089750",
  appId: "1:825052089750:web:fbce97a1b99c710972e1b7",
  measurementId: "G-19MGNL21LN",
};

// ✅ Evita erro de inicializar Firebase mais de 1x no Next
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// exports usados no projeto
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);