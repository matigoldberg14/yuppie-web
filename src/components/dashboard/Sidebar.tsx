// src/components/dashboard/Sidebar.tsx
import React from 'react';
import { Home, MessageSquare, Users2, BarChart3, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';

export function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-xl p-4">
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
      </nav>
    </div>
  );
}
