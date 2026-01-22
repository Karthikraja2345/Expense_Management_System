import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration with fallback values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCWn-YkmI1Lc28i8JjLMzch7OmZnnG4jhU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "expense-management-syste-1bf2d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "expense-management-syste-1bf2d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "expense-management-syste-1bf2d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "380771918488",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:380771918488:web:950fd8119031e5ed00e6ed"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage };
