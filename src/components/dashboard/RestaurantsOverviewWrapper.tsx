// src/components/dashboard/RestaurantsOverviewWrapper.tsx
import React, { useEffect } from 'react';
import { RestaurantsOverview } from './RestaurantsOverview';
import { getRestaurantsList } from '../../lib/restaurantStore';

export default function RestaurantsOverviewWrapper() {
  useEffect(() => {
    const list = getRestaurantsList();
    if (list.length <= 1) {
      window.location.href = '/dashboard';
    }
  }, []);

  return <RestaurantsOverview />;
}
