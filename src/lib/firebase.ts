// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';

let auth: Auth | undefined;

// Solo inicializar Firebase en el cliente
if (typeof window !== 'undefined') {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
      authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
    };

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('Firebase inicializado en el cliente!');
  } catch (error) {
    console.error('Error inicializando Firebase:', error);
  }
}

export { auth };
