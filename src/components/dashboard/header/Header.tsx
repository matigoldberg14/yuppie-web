import { useSidebarStore } from '@/store/useSidebarStore';
import { useRestaurantStore } from '@/store/useRestaurantStore';
import { useState, useEffect } from 'react';
import Option from './Option';
import type { Restaurant } from '@/types/restaurant';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import ClickOutside from '@/components/ui/ClickOutside';

export default function Header() {
  const { isCollapsed, hydrated } = useSidebarStore();
  const {
    restaurants,
    isLoading,
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

  if (isLoading) {
    return (
      <SkeletonLoader
        className={`h-20 fixed top-4 ${
          isCollapsed
            ? 'w-[calc(100%-8rem)] left-[6rem]'
            : 'w-[calc(100%-20rem)] left-[18rem]'
        }`}
      />
    );
  }

  // TODO: manage this case
  if (!selectedRestaurant) return null;

  return (
    <header
      className={`fixed md:flex bottom-4 w-[calc(100%-2rem)] border border-white/20 left-4 md:top-4 h-20 cursor-pointer rounded-lg bg-primary-dark z-50 transition-all duration-200 ${
        isCollapsed
          ? 'md:w-[calc(100%-8rem)] md:left-[6rem]'
          : 'md:w-[calc(100%-20rem)] md:left-[18rem]'
      } ${
        openHeader ? 'rounded-t-none md:rounded-t-lg md:rounded-b-none' : ''
      }`}
    >
      <Option
        onClick={handleOpenHeader}
        openHeader={openHeader}
        restaurantName={selectedRestaurant.name}
        location={selectedRestaurant.zone ?? ''}
        employeesAmount={selectedRestaurant.employees?.length ?? 0}
      />
      <ClickOutside
        isOpen={openHeader}
        onClickOutside={() => setOpenHeader(false)}
      >
        <div
          className={`absolute bottom-full md:bottom-auto md:top-full px-4 py-4 border border-white/20 cursor-auto left-0 w-full flex flex-col gap-2 bg-primary-dark z-50 rounded-t-lg md:rounded-t-none md:rounded-b-lg transition-all duration-300 ${
            openHeader
              ? 'transform opacity-100 translate-y-0'
              : 'transform opacity-0 translate-y-2 md:-translate-y-2 pointer-events-none'
          }`}
        >
          {restaurants
            .sort((a, b) => {
              if (selectedRestaurant.documentId === a.documentId) return -1;
              if (selectedRestaurant.documentId === b.documentId) return 1;
              return a.name.localeCompare(b.name);
            })
            .map((restaurant) => (
              <Option
                key={restaurant.documentId}
                onClick={() => handleSelectRestaurant(restaurant)}
                openHeader={openHeader}
                restaurantName={restaurant.name}
                location={restaurant.zone ?? ''}
                employeesAmount={0}
                isOption
                selected={
                  restaurant.documentId === selectedRestaurant.documentId
                }
              />
            ))}
        </div>
      </ClickOutside>
    </header>
  );
}
