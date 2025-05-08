// src/components/common/Footer.tsx
import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-white/10">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <img
              src="/logo.png"
              alt="Yuppie Logo"
              className="h-8 w-auto mb-4"
            />
            <p className="text-sm text-white/60">
              Cada experiencia es una oportunidad!
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Características
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Precios
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Guías
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Compañía</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Términos
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center text-sm text-white/60">
          <p>
            &copy; {new Date().getFullYear()} Yuppie. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
