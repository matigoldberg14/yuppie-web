// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';

let auth: Auth | undefined;

if (typeof window !== 'undefined') {
  try {
    const firebaseConfig = {
      apiKey:
        import.meta.env.VITE_FIREBASE_API_KEY ??
        'AIzaSyCUjUKgCdECVCEvIlK1OuB9mx61GtDdxEE',
      authDomain:
        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ??
        'yuppiedashboard.firebaseapp.com',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'yuppiedashboard',
      storageBucket:
        import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
        'yuppiedashboard.firebasestorage.app',
      messagingSenderId:
        import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '619049806507',
      appId:
        import.meta.env.VITE_FIREBASE_APP_ID ??
        '1:619049806507:web:0fe5772a82002b3b4225ee',
    };

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('Firebase inicializado en el cliente!');
  } catch (error) {
    console.error('Error inicializando Firebase:', error);
  }
}

export { auth };
