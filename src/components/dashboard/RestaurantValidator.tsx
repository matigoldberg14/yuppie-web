import React, { useEffect } from 'react';
import { useRestaurantStore } from '@/store/useRestaurantStore';

const RestaurantValidator: React.FC = () => {
  const {
    restaurants,
    selectedRestaurant,
    isLoading,
    hasLoaded,
    fetchRestaurants,
    fetchEmployees,
  } = useRestaurantStore();

  useEffect(() => {
    fetchRestaurants();
    fetchEmployees();
  }, [fetchRestaurants, fetchEmployees]);

  useEffect(() => {
    // If we're still loading or haven't loaded yet, do nothing
    if (isLoading || !hasLoaded) return;

    // If there are no restaurants, redirect to restaurants page
    if (restaurants.length === 0) {
      console.log('No restaurants found');
      return;
    }
  }, [isLoading, hasLoaded, restaurants, selectedRestaurant]);

  return null;
};

export default RestaurantValidator;
