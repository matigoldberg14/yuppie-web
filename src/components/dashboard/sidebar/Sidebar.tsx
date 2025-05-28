// src/components/dashboard/Sidebar.tsx
import { useState } from 'react';
import { auth } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';
import { clearUserRestaurants } from '../../../lib/restaurantStore';
import { IoIosArrowBack } from 'react-icons/io';
import { getNavbarItems } from '@/data/Navbar';
import Anchor from './Anchor';
import { FiLogOut } from 'react-icons/fi';
import { useSidebarStore } from '@/store/useSidebarStore';
import HamburguerIcon from '../../icons/hamburguer/HamburguerIcon';
import Button from './Button';

export function Sidebar({ section }: { section: string }) {
  const { isCollapsed, toggleSidebar, hydrated } = useSidebarStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!hydrated) {
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      clearUserRestaurants();
      if (!auth) throw new Error('Firebase not initialized');
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div
      className={`h-20 w-full md:h-dvh fixed flex md:flex-col flex-row pt-4 pb-4 md:pb-0 z-50 items-center md:items-start justify-between bg-white/10 backdrop-blur-md transition-all duration-300 ${
        isCollapsed
          ? 'md:w-16 md:min-w-16 md:max-w-16'
          : 'md:w-64 md:min-w-64 md:max-w-64'
      }`}
    >
      <button
        onClick={toggleSidebar}
        className='hidden cursor-pointer z-50 md:flex absolute top-5 -right-3 transition-all duration-300 rounded-full bg-white/10 hover:bg-white/20 p-1'
      >
        <IoIosArrowBack
          className={`h-4 w-4 transition-all duration-300 ${
            isCollapsed ? 'rotate-y-180' : ''
          }`}
        />
      </button>
      <div className='w-full flex px-2 flex-row md:flex-col items-start justify-start gap-4 z-40'>
        <div className='flex items-center w-full'>
          <div
            className={`w-full flex ${
              isCollapsed ? 'justify-center' : 'justify-start'
            } items-center`}
          >
            {isCollapsed && !isMobileMenuOpen ? (
              <img
                src='/yblanca.png'
                alt='Yuppie Logo chico'
                className='h-8 w-auto'
              />
            ) : (
              <img
                src='/logo_grande.png'
                alt='Yuppie Logo'
                className='h-8 w-auto'
              />
            )}
          </div>
        </div>
        <nav
          className={`w-full fixed md:static top-20 md:translate-x-0 pt-4 md:pt-0 px-2 md:px-0 left-0 rounded-b-lg md:rounded-b-none bg-primary-light md:bg-transparent z-40 flex flex-col gap-2 transition-all duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {getNavbarItems('REPLACE_WITH_PLAN').map((item) => (
            <Anchor
              key={item.href}
              href={item.href}
              selected={section === item.href.split('/').pop()}
              isCollapsed={isCollapsed}
              icon={item.icon}
              text={item.text}
            />
          ))}
          <div className='w-full flex md:hidden border-t border-white/20 py-2'>
            <Button
              type='button'
              onClick={handleLogout}
              isCollapsed={isCollapsed}
              icon={<FiLogOut className='h-4 w-4' />}
              text='Cerrar sesión'
            />
          </div>
        </nav>
        <div className='flex md:hidden'>
          <HamburguerIcon
            isSelected={isMobileMenuOpen}
            handleClick={toggleMobileMenu}
          />
        </div>
      </div>
      <div className='w-full border-t border-white/20 py-2 hidden md:flex px-2'>
        <Button
          type='button'
          onClick={handleLogout}
          isCollapsed={isCollapsed}
          icon={<FiLogOut className='h-4 w-4' />}
          text='Cerrar sesión'
        />
      </div>
    </div>
  );
}
