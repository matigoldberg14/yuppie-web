//src/components/dashboard/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut, type Auth } from 'firebase/auth';
import { Button } from '../ui/Button';
import {
  Home,
  MessageSquare,
  Users2,
  BarChart3,
  Calendar,
  LogOut,
  Target,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Actualizar el padding del contenido principal cuando cambia el estado del sidebar
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      // Solo aplicamos padding en desktop
      if (window.innerWidth > 768) {
        mainContent.style.paddingLeft = isCollapsed ? '4rem' : '16rem';
      } else {
        mainContent.style.paddingLeft = '1rem';
      }
    }
  }, [isCollapsed, isMobileMenuOpen]);

  // Cerrar menú móvil cuando se cambia el tamaño de la ventana a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase not initialized');
      }
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Botón de menú móvil
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="fixed top-4 right-4 z-50 md:hidden bg-white/10 text-white hover:bg-white/20"
    >
      {isMobileMenuOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <Menu className="h-6 w-6" />
      )}
    </Button>
  );

  return (
    <>
      <MobileMenuButton />

      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div
        className={`fixed left-0 top-0 h-full bg-white/10 backdrop-blur-xl flex flex-col z-50
          md:translate-x-0 transition-all duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'md:w-16' : 'md:w-64'}
          w-64`}
      >
        {/* Botón para colapsar (solo visible en desktop) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full bg-white/10 text-white hover:bg-white/20 items-center justify-center hidden md:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        {/* Logo */}
        <div className="px-2 pt-4 flex items-center">
          {isCollapsed && !isMobileMenuOpen ? (
            <div className="w-full flex justify-center items-center">
              <img
                src="/yblanca.png"
                alt="Yuppie Logo chico"
                className="h-8 w-auto"
              />
            </div>
          ) : (
            <div className="w-full flex items-center px-2">
              <img
                src="/logo_grande.png"
                alt="Yuppie Logo"
                className="h-8 w-auto"
              />
            </div>
          )}
        </div>
        {/* Navegación */}
        <div className="flex flex-col flex-1 justify-between mt-8">
          <nav className="space-y-4">
            {[
              {
                icon: <Home className="h-4 w-4" />,
                text: 'Dashboard',
                href: '/dashboard',
              },
              {
                icon: <MessageSquare className="h-4 w-4" />,
                text: 'Reseñas',
                href: '/dashboard/reviews',
              },
              {
                icon: <Users2 className="h-4 w-4" />,
                text: 'Equipo',
                href: '/dashboard/team',
              },
              {
                icon: <BarChart3 className="h-4 w-4" />,
                text: 'Analytics',
                href: '/dashboard/analytics',
              },
              {
                icon: <Calendar className="h-4 w-4" />,
                text: 'Calendario',
                href: '/dashboard/calendar',
              },
              {
                icon: <Target className="h-4 w-4" />,
                text: 'Proximamente...',
                href: '/dashboard/objectives',
              },
              {
                icon: <Lightbulb className="h-4 w-4" />,
                text: 'Proximamente...',
                href: '/dashboard/improvements',
              },
            ].map((item) => (
              <a key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full flex items-center text-white hover:bg-white/10 px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-8 flex items-center justify-start">
                    {item.icon}
                  </div>
                  {(!isCollapsed || isMobileMenuOpen) && (
                    <span className="text-lg">{item.text}</span>
                  )}
                </Button>
              </a>
            ))}
          </nav>

          {/* Botón de cerrar sesión */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full flex items-center text-white hover:bg-white/10 px-2 group"
            >
              <div className="w-8 flex items-center justify-start">
                <LogOut className="h-4 w-4 group-hover:text-red-400" />
              </div>
              {(!isCollapsed || isMobileMenuOpen) && (
                <span className="text-lg group-hover:text-red-400">
                  Cerrar sesión
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
