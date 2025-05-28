import { create } from 'zustand';
import { getRestaurantsByOwner } from '@/services/api/restaurants';
import type { Restaurant } from '@/types/restaurant';
import { auth } from '@/lib/firebase';

interface RestaurantStore {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchRestaurants: () => Promise<void>;
  setSelectedRestaurant: (restaurant: Restaurant) => void;
  clearRestaurants: () => void;
}

export const useRestaurantStore = create<RestaurantStore>((set, get) => ({
  restaurants: [],
  selectedRestaurant: null,
  isLoading: false,
  hasLoaded: false,
  error: null,

  fetchRestaurants: async () => {
    // If we already have loaded the restaurants, don't fetch again
    if (get().hasLoaded) return;

    const userId = auth?.currentUser?.uid;
    if (!userId) {
      set({ error: 'No user logged in' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const restaurants = await getRestaurantsByOwner(userId);
      const restaurantsSorted = restaurants.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      set({
        restaurants: restaurantsSorted,
        isLoading: false,
        hasLoaded: true,
        selectedRestaurant: restaurantsSorted[0],
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch restaurants',
        isLoading: false,
      });
    }
  },

  setSelectedRestaurant: (restaurant: Restaurant) => {
    set({ selectedRestaurant: restaurant });
  },

  clearRestaurants: () => {
    set({
      restaurants: [],
      selectedRestaurant: null,
      hasLoaded: false,
      error: null,
    });
  },
}));
