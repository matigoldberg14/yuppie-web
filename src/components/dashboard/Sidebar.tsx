// src/components/dashboard/Sidebar.tsx
import React from 'react';
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
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();

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
    <div className="fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-xl p-4 flex flex-col">
      {/* Logo y navegación principal */}
      <div>
        <div className="mb-8">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logos-03.jpg-HGxPXf7O388oQVUwJRZhvoGnQoIWQG.jpeg"
            alt="Yuppie Logo"
            className="h-8 w-auto"
          />
        </div>
        <nav className="space-y-2">
          <a href="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </a>
          <a href="/dashboard/reviews">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Reseñas
            </Button>
          </a>
          <a href="/dashboard/team">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Users2 className="mr-2 h-4 w-4" />
              Equipo
            </Button>
          </a>
          <a href="/dashboard/analytics">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </a>
          <a href="/dashboard/calendar">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Calendario
            </Button>
          </a>
          <a href="/dashboard/objectives">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Target className="mr-2 h-4 w-4" />
              Objetivos
            </Button>
          </a>
          <a href="/dashboard/improvements">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Mejoras
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
          <LogOut className="mr-2 h-4 w-4 group-hover:text-red-400" />
          <span className="group-hover:text-red-400">Cerrar sesión</span>
        </Button>
      </div>
    </div>
  );
}
