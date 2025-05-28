import React from 'react';
import { FiBarChart2, FiHome } from 'react-icons/fi';
import { IoChatboxOutline, IoPeopleOutline } from 'react-icons/io5';

export const getNavbarItems = (_plan: string) => [
  {
    icon: <FiHome className='h-4 w-4' />,
    text: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: <IoChatboxOutline className='h-4 w-4' />,
    text: 'Reseñas',
    href: '/dashboard/reviews',
  },
  {
    icon: <IoPeopleOutline className='h-4 w-4' />,
    text: 'Equipo',
    href: '/dashboard/team',
  },
  {
    icon: <FiBarChart2 className='h-4 w-4' />,
    text: 'Analytics',
    href: '/dashboard/analytics',
  },
];
