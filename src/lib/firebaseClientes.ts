import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';

let authClientes: Auth | undefined;

if (typeof window !== 'undefined') {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.PUBLIC_FIREBASE_CLIENTES_API_KEY,
      authDomain: import.meta.env.PUBLIC_FIREBASE_CLIENTES_AUTH_DOMAIN,
      projectId: import.meta.env.PUBLIC_FIREBASE_CLIENTES_PROJECT_ID,
      storageBucket: import.meta.env.PUBLIC_FIREBASE_CLIENTES_STORAGE_BUCKET,
      messagingSenderId: import.meta.env
        .PUBLIC_FIREBASE_CLIENTES_MESSAGING_SENDER_ID,
      appId: import.meta.env.PUBLIC_FIREBASE_CLIENTES_APP_ID,
      measurementId: import.meta.env.PUBLIC_FIREBASE_CLIENTES_MEASUREMENT_ID,
    };

    const app = initializeApp(firebaseConfig, 'clientes');
    authClientes = getAuth(app);
    console.log('Firebase Clientes inicializado');
  } catch (error) {
    console.error('Error inicializando Firebase Clientes:', error);
  }
}

export { authClientes };
