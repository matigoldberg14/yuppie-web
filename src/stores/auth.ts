// src/stores/auth.ts
import { atom } from 'nanostores';
import type { User } from 'firebase/auth';

interface UserState {
  user: User | null;
  isAdmin: boolean;
  restaurants: string[];
}

export const userStore = atom<UserState>({
  user: null,
  isAdmin: false,
  restaurants: [],
});

export const setUser = (user: User | null) => {
  userStore.set({
    ...userStore.get(),
    user,
  });
};

export const setIsAdmin = (isAdmin: boolean) => {
  userStore.set({
    ...userStore.get(),
    isAdmin,
  });
};

export const setRestaurants = (restaurants: string[]) => {
  userStore.set({
    ...userStore.get(),
    restaurants,
  });
};
