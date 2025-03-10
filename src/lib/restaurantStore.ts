// src/lib/restaurantStore.ts
import React, { useState, useEffect } from 'react';
import { auth } from './firebase';

export interface Restaurant {
  id: number;
  documentId: string;
  name: string;
  taps: string;
  linkMaps: string;
  owner: {
    firstName: string;
    lastName: string;
  };
  ingresos?: number;
  clientes?: number;
  satisfaccion?: number;
  ocupacion?: number;
}
// Claves para localStorage
const SELECTED_RESTAURANT_KEY = 'selectedRestaurant';
const COMPARE_RESTAURANTS_KEY = 'compareRestaurants';
const RESTAURANTS_LIST_KEY = 'restaurantsList';

// Función para obtener el prefijo de usuario
const getUserPrefix = () => {
  const uid = auth?.currentUser?.uid;
  return uid ? `user_${uid}_` : '';
};

// Función para obtener la clave completa con prefijo de usuario
const getKey = (baseKey: string) => `${getUserPrefix()}${baseKey}`;

// Función para limpiar todas las selecciones del usuario actual
export function clearUserRestaurants(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(getKey(SELECTED_RESTAURANT_KEY));
    localStorage.removeItem(getKey(COMPARE_RESTAURANTS_KEY));
    localStorage.removeItem(getKey(RESTAURANTS_LIST_KEY));
  }
}

// Función para seleccionar un restaurante principal
export function setSelectedRestaurant(restaurant: Restaurant): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      getKey(SELECTED_RESTAURANT_KEY),
      JSON.stringify(restaurant)
    );
    // Disparar un evento para notificar a otros componentes
    window.dispatchEvent(
      new CustomEvent('restaurantChange', { detail: restaurant })
    );
  }
}

// Obtener el restaurante seleccionado
export function getSelectedRestaurant(): Restaurant | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(getKey(SELECTED_RESTAURANT_KEY));
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Limpiar el restaurante seleccionado
export function clearSelectedRestaurant(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(getKey(SELECTED_RESTAURANT_KEY));
    window.dispatchEvent(new CustomEvent('restaurantChange', { detail: null }));
  }
}

// Agregar/quitar restaurante para comparar
export function toggleCompareRestaurant(restaurant: Restaurant): void {
  if (typeof window === 'undefined') return;

  const currentList = getCompareRestaurants();
  const exists = currentList.some((r) => r.id === restaurant.id);

  let newList;
  if (exists) {
    newList = currentList.filter((r) => r.id !== restaurant.id);
  } else {
    newList = [...currentList, restaurant];
  }

  localStorage.setItem(
    getKey(COMPARE_RESTAURANTS_KEY),
    JSON.stringify(newList)
  );
  window.dispatchEvent(
    new CustomEvent('compareRestaurantsChange', { detail: newList })
  );
}

// Obtener restaurantes para comparar
export function getCompareRestaurants(): Restaurant[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(getKey(COMPARE_RESTAURANTS_KEY));
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Limpiar restaurantes para comparar
export function clearCompareRestaurants(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(getKey(COMPARE_RESTAURANTS_KEY), JSON.stringify([]));
    window.dispatchEvent(
      new CustomEvent('compareRestaurantsChange', { detail: [] })
    );
  }
}

// Guardar la lista completa de restaurantes
export function setRestaurantsList(restaurants: Restaurant[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      getKey(RESTAURANTS_LIST_KEY),
      JSON.stringify(restaurants)
    );

    // Selección automática si solo hay un restaurante y ninguno seleccionado
    if (restaurants.length === 1 && !getSelectedRestaurant()) {
      console.log(
        'restaurantStore: Auto-seleccionando único restaurante:',
        restaurants[0].name
      );
      setSelectedRestaurant(restaurants[0]);
    }
  }
}
// Obtener la lista completa de restaurantes
export function getRestaurantsList(): Restaurant[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(getKey(RESTAURANTS_LIST_KEY));
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Hook personalizado para React (usando useState y useEffect)
export function useRestaurantStore() {
  // Este hook debe ser importado en componentes React
  if (typeof window === 'undefined') {
    throw new Error(
      'useRestaurantStore debe usarse en un entorno de navegador'
    );
  }

  const [selectedRestaurant, setSelectedRestaurantState] = useState(
    getSelectedRestaurant()
  );
  const [compareRestaurants, setCompareRestaurantsState] = useState(
    getCompareRestaurants()
  );

  // Escuchar cambios de otros componentes
  useEffect(() => {
    const handleSelectedChange = (e: CustomEvent) => {
      setSelectedRestaurantState(e.detail);
    };

    const handleCompareChange = (e: CustomEvent) => {
      setCompareRestaurantsState(e.detail);
    };

    window.addEventListener(
      'restaurantChange',
      handleSelectedChange as EventListener
    );
    window.addEventListener(
      'compareRestaurantsChange',
      handleCompareChange as EventListener
    );

    return () => {
      window.removeEventListener(
        'restaurantChange',
        handleSelectedChange as EventListener
      );
      window.removeEventListener(
        'compareRestaurantsChange',
        handleCompareChange as EventListener
      );
    };
  }, []);

  return {
    selectedRestaurant,
    setSelectedRestaurant: (restaurant: Restaurant) => {
      setSelectedRestaurantState(restaurant);
      setSelectedRestaurant(restaurant);
    },
    compareRestaurants,
    toggleCompareRestaurant: (restaurant: Restaurant) => {
      toggleCompareRestaurant(restaurant);
    },
    clearCompareRestaurants: () => {
      clearCompareRestaurants();
    },
  };
}
