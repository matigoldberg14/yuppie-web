// src/services/auth.ts
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { atom } from 'nanostores';
import { API_CONFIG } from './api';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

interface AuthState {
  user: User | null;
  restaurantId: string | null;
  loading: boolean;
}

export const authStore = atom<AuthState>({
  user: null,
  restaurantId: null,
  loading: true,
});

export async function login(email: string, password: string) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    // Buscar el restaurante vinculado al UID de Firebase
    const response = await fetch(
      `${API_CONFIG.baseUrl}/restaurants?filters[firebaseUID][$eq]=${user.uid}`
    );

    if (!response.ok) {
      throw new Error('Error al obtener datos del restaurante');
    }

    const { data } = await response.json();
    const restaurant = data[0];

    if (!restaurant) {
      throw new Error('No se encontró un restaurante vinculado a este usuario');
    }

    authStore.set({
      user,
      restaurantId: restaurant.documentId,
      loading: false,
    });

    return { user, restaurantId: restaurant.documentId };
  } catch (error) {
    console.error('Error de login:', error);
    throw error;
  }
}

// Escuchar cambios de autenticación
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    authStore.set({ user: null, restaurantId: null, loading: false });
    return;
  }

  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/restaurants?filters[firebaseUID][$eq]=${user.uid}`
    );
    const { data } = await response.json();
    const restaurant = data[0];

    authStore.set({
      user,
      restaurantId: restaurant?.documentId || null,
      loading: false,
    });
  } catch (error) {
    console.error('Error actualizando estado de auth:', error);
    authStore.set({ user, restaurantId: null, loading: false });
  }
});
