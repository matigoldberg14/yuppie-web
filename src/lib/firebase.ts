// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { atom } from 'nanostores';
import type { Restaurant } from '../types/api';

// Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth store
interface AuthState {
  user: User | null;
  restaurant: Restaurant | null;
  loading: boolean;
}

export const authStore = atom<AuthState>({
  user: null,
  restaurant: null,
  loading: true,
});

// Auth functions
export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    authStore.set({ user: null, restaurant: null, loading: false });
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    authStore.set({ user: null, restaurant: null, loading: false });
    return;
  }

  try {
    const response = await fetch(
      `${
        import.meta.env.PUBLIC_API_URL
      }/restaurants?filters[firebaseUID][$eq]=${user.uid}`
    );
    const { data } = await response.json();

    console.log('Respuesta de la API:', data); // Log para debug

    authStore.set({
      user,
      restaurant: data?.[0] || null,
      loading: false,
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    authStore.set({
      user,
      restaurant: null,
      loading: false,
    });
  }
});

export { auth };
