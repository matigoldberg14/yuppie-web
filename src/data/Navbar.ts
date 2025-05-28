import React from 'react';
import { FiHome } from 'react-icons/fi';
import { MessageSquare, Users2, BarChart3, Calendar } from 'lucide-react';
import type { ReactNode } from 'react';

interface NavbarItem {
  icon: ReactNode;
  text: string;
  href: string;
}

export const getNavbarItems = (_plan: string): NavbarItem[] => [
  {
    icon: React.createElement(FiHome, { className: 'h-4 w-4' }),
    text: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: React.createElement(MessageSquare, { className: 'h-4 w-4' }),
    text: 'Reseñas',
    href: '/dashboard/reviews',
  },
  {
    icon: React.createElement(Users2, { className: 'h-4 w-4' }),
    text: 'Equipo',
    href: '/dashboard/team',
  },
  {
    icon: React.createElement(BarChart3, { className: 'h-4 w-4' }),
    text: 'Analytics',
    href: '/dashboard/analytics',
  },
];
