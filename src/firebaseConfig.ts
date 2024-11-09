// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPREtelaDY5WSiCRpVhmC53QvJL69aUkw",
  authDomain: "minibus-final.firebaseapp.com",
  projectId: "minibus-final",
  storageBucket: "minibus-final.appspot.com",
  messagingSenderId: "327521691196",
  appId: "1:327521691196:web:216ec5fc7ddf2bb55f4539"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Export the initialized instances
export { db, auth, storage };
