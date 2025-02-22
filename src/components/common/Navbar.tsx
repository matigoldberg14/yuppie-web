// src/components/common/Navbar.tsx
import React from 'react';
import { Button } from '../ui/Button';

export const Navbar = () => {
  return (
    <header className="fixed w-full z-50 bg-black/10 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <a href="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Yuppie Logo" className="h-8 w-auto" />
        </a>

        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#caracteristicas"
            className="text-white/80 hover:text-white transition-colors"
          >
            Características
          </a>
          <a
            href="#como-funciona"
            className="text-white/80 hover:text-white transition-colors"
          >
            Cómo Funciona
          </a>
          <a
            href="#precios"
            className="text-white/80 hover:text-white transition-colors"
          >
            Precios
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <a href="/login">
            <Button variant="ghost">Iniciar Sesión</Button>
          </a>
          <a href="/register">
            <Button variant="secondary">Comenzar Gratis</Button>
          </a>
        </div>
      </div>
    </header>
  );
};
