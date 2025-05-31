import { create } from 'zustand';
import { getRestaurantsByOwner } from '@/services/api/restaurants';
import type { Restaurant } from '@/types/restaurant';
import { auth } from '@/lib/firebase';
import { getEmployeesByRestaurant } from '@/services/api/employees';

const SELECTED_RESTAURANT_KEY = 'selectedRestaurant';

// Helper function to get the user-specific key
const getUserKey = (key: string) => {
  const uid = auth?.currentUser?.uid;
  return uid ? `user_${uid}_${key}` : key;
};

interface RestaurantStore {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchRestaurants: () => Promise<void>;
  setSelectedRestaurant: (restaurant: Restaurant) => void;
  clearRestaurants: () => void;
  fetchEmployees: () => Promise<void>;
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

      // Try to get the previously selected restaurant from localStorage
      const savedRestaurant = localStorage.getItem(
        getUserKey(SELECTED_RESTAURANT_KEY)
      );
      let selectedRestaurant = null;

      if (savedRestaurant) {
        try {
          const parsedRestaurant = JSON.parse(savedRestaurant);
          // Verify that the saved restaurant still exists in the list
          const exists = restaurantsSorted.some(
            (r) => r.documentId === parsedRestaurant.documentId
          );
          if (exists) {
            selectedRestaurant = parsedRestaurant;
          }
        } catch (e) {
          console.error('Error parsing saved restaurant:', e);
        }
      }

      // If no saved restaurant was found or it doesn't exist anymore, select the first one
      if (!selectedRestaurant && restaurantsSorted.length > 0) {
        selectedRestaurant = restaurantsSorted[0];
      }

      set({
        restaurants: restaurantsSorted,
        isLoading: false,
        hasLoaded: true,
        selectedRestaurant,
      });

      // If we found a valid saved restaurant, make sure it's saved in localStorage
      if (selectedRestaurant) {
        localStorage.setItem(
          getUserKey(SELECTED_RESTAURANT_KEY),
          JSON.stringify(selectedRestaurant)
        );
      }
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
    // Save to localStorage
    localStorage.setItem(
      getUserKey(SELECTED_RESTAURANT_KEY),
      JSON.stringify(restaurant)
    );
    set({ selectedRestaurant: restaurant });
  },

  clearRestaurants: () => {
    localStorage.removeItem(getUserKey(SELECTED_RESTAURANT_KEY));
    set({
      restaurants: [],
      selectedRestaurant: null,
      hasLoaded: false,
      error: null,
    });
  },

  fetchEmployees: async () => {
    const selectedRestaurant = get().selectedRestaurant;
    if (!selectedRestaurant) {
      set({ error: 'No restaurant selected' });
      return;
    }

    try {
      const employees = await getEmployeesByRestaurant(
        selectedRestaurant.documentId
      );

      // Update the selected restaurant with employees
      const updatedSelectedRestaurant = {
        ...selectedRestaurant,
        employees,
      };

      // Update the restaurant in the restaurants list
      const updatedRestaurants = get().restaurants.map((restaurant) =>
        restaurant.documentId === selectedRestaurant.documentId
          ? updatedSelectedRestaurant
          : restaurant
      );

      set({
        selectedRestaurant: updatedSelectedRestaurant,
        restaurants: updatedRestaurants,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch employees',
      });
    }
  },
}));
