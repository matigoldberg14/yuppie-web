import React, { useState } from 'react';
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
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  return (
    <div
      className={`fixed left-0 top-0 h-full ${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white/10 backdrop-blur-xl p-4 flex flex-col transition-all duration-300`}
    >
      {/* Botón para colapsar */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-6 h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Logo y navegación principal */}
      <div>
        <div className="mb-8">
          {isCollapsed ? (
            <span className="text-2xl font-bold text-white mx-auto block text-center">
              Y
            </span>
          ) : (
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logos-03.jpg-HGxPXf7O388oQVUwJRZhvoGnQoIWQG.jpeg"
              alt="Yuppie Logo"
              className="h-8 w-auto"
            />
          )}
        </div>
        <nav className="space-y-2">
          <a href="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Home className={`${isCollapsed ? '' : 'mr-2'} h-4 w-4`} />
              {!isCollapsed && 'Dashboard'}
            </Button>
          </a>
          <a href="/dashboard/reviews">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <MessageSquare
                className={`${isCollapsed ? '' : 'mr-2'} h-4 w-4`}
              />
              {!isCollapsed && 'Reseñas'}
            </Button>
          </a>
          <a href="/dashboard/team">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Users2 className={`${isCollapsed ? '' : 'mr-2'} h-4 w-4`} />
              {!isCollapsed && 'Equipo'}
            </Button>
          </a>
          <a href="/dashboard/analytics">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <BarChart3 className={`${isCollapsed ? '' : 'mr-2'} h-4 w-4`} />
              {!isCollapsed && 'Analytics'}
            </Button>
          </a>
          <a href="/dashboard/calendar">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Calendar className={`${isCollapsed ? '' : 'mr-2'} h-4 w-4`} />
              {!isCollapsed && 'Calendario'}
            </Button>
          </a>
          <a href="/dashboard/objectives">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Target className={`${isCollapsed ? '' : 'mr-2'} h-4 w-4`} />
              {!isCollapsed && 'Objetivos'}
            </Button>
          </a>
          <a href="/dashboard/improvements">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Lightbulb className={`${isCollapsed ? '' : 'mr-2'} h-4 w-4`} />
              {!isCollapsed && 'Mejoras'}
            </Button>
          </a>
        </nav>
      </div>

      {/* Botón de cerrar sesión en la parte inferior */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-white hover:bg-white/10 group"
        >
          <LogOut
            className={`${
              isCollapsed ? '' : 'mr-2'
            } h-4 w-4 group-hover:text-red-400`}
          />
          {!isCollapsed && (
            <span className="group-hover:text-red-400">Cerrar sesión</span>
          )}
        </Button>
      </div>
    </div>
  );
}
