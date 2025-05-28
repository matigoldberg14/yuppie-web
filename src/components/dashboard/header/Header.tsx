import { useSidebarStore } from '@/store/useSidebarStore';
import { useRestaurantStore } from '@/store/useRestaurantStore';
import { useState, useEffect } from 'react';
import Option from './Option';
import type { Restaurant } from '@/types/restaurant';

export default function Header() {
  const { isCollapsed, hydrated } = useSidebarStore();
  const {
    restaurants,
    selectedRestaurant,
    setSelectedRestaurant,
    fetchRestaurants,
  } = useRestaurantStore();
  const [openHeader, setOpenHeader] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  if (!hydrated) {
    return null;
  }

  const handleOpenHeader = () => {
    setOpenHeader(!openHeader);
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setOpenHeader(false);
  };

  if (!selectedRestaurant) return null;

  return (
    <header
      className={`fixed md:flex hidden top-4 h-20 cursor-pointer rounded-lg bg-primary-dark/50 backdrop-blur-xl z-50 transition-all duration-300 ${
        isCollapsed
          ? 'w-[calc(100%-8rem)] left-[6rem]'
          : 'w-[calc(100%-20rem)] left-[18rem]'
      } ${openHeader ? 'rounded-b-none' : ''}`}
    >
      <Option
        onClick={handleOpenHeader}
        isCollapsed={isCollapsed}
        openHeader={openHeader}
        restaurantName={selectedRestaurant.name}
        location={selectedRestaurant.location?.city ?? ''}
        employeesAmount={0}
      />
      <div
        className={`absolute top-full px-4 py-4 cursor-auto left-0 w-full flex flex-col gap-2 bg-primary-dark/50 backdrop-blur-md z-50 rounded-b-lg transition-all duration-300 ${
          openHeader
            ? 'transform opacity-100 translate-y-0'
            : 'transform opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {restaurants
          .sort((a, b) => {
            if (selectedRestaurant.documentId === a.documentId) return -1;
            if (selectedRestaurant.documentId === b.documentId) return 1;
            return a.name.localeCompare(b.name);
          })
          .map((restaurant, index) => (
            <Option
              key={restaurant.documentId}
              onClick={() => handleSelectRestaurant(restaurant)}
              isCollapsed={isCollapsed}
              openHeader={openHeader}
              restaurantName={restaurant.name}
              location={restaurant.location?.city ?? ''}
              employeesAmount={0}
              isOption
              selected={restaurant.documentId === selectedRestaurant.documentId}
            />
          ))}
      </div>
    </header>
  );
}
