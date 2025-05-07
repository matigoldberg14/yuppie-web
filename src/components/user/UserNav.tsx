// src/components/user/UserNav.tsx
import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../lib/UserAuthContext';
import { getUserPoints } from '../../services/userPointsService';

/**
 * Barra de navegación para usuarios finales (clientes) con información de puntos
 */
export function UserNav() {
  const { user, logout } = useUserAuth?.() || {
    user: null,
    logout: async () => {},
  };
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [userLevel, setUserLevel] = useState<string>('Básico');

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        // Verificar si el click fue fuera del dropdown
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setShowDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Cargar puntos del usuario cuando está autenticado
  useEffect(() => {
    if (user) {
      const fetchUserPoints = async () => {
        try {
          setLoading(true);
          const points = await getUserPoints();

          // Calcular total de puntos y determinar nivel
          let sum = 0;
          let highestLevel = 'Básico';

          for (const restaurant of points) {
            sum += restaurant.points || 0;

            // Actualizar el nivel más alto
            const level = restaurant.level || 'Básico';
            if (getLevelOrder(level) > getLevelOrder(highestLevel)) {
              highestLevel = level;
            }
          }

          setTotalPoints(sum);
          setUserLevel(highestLevel);
        } catch (error) {
          console.error('Error obteniendo puntos:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserPoints();
    }
  }, [user]);

  // Función para ordenar niveles
  const getLevelOrder = (level: string): number => {
    switch (level) {
      case 'Básico':
        return 1;
      case 'Plata':
        return 2;
      case 'Oro':
        return 3;
      case 'Platino':
        return 4;
      default:
        return 0;
    }
  };

  // Función para obtener el color del nivel
  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'Plata':
        return 'text-gray-300';
      case 'Oro':
        return 'text-yellow-400';
      case 'Platino':
        return 'text-blue-300';
      default:
        return 'text-white/70';
    }
  };

  // Si no hay usuario autenticado, mostrar opciones de inicio de sesión
  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <a
          href="/profile"
          className="text-white/80 hover:text-white transition-colors"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition-colors"
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        {/* Puntos del usuario */}
        <div className="flex items-center">
          <span className="mr-1 text-yellow-300">⭐</span>
          <span className="font-semibold">{loading ? '...' : totalPoints}</span>
          <span className="text-xs ml-1 text-white/70">pts</span>
        </div>

        {/* Separador */}
        <span className="text-white/30">|</span>

        {/* Usuario */}
        <div className="flex items-center">
          <span className="text-white/80">{user.email?.split('@')[0]}</span>
          <svg
            className={`ml-1 w-3 h-3 transition-transform ${
              showDropdown ? 'rotate-180' : ''
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div
          id="user-dropdown"
          className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-md rounded-lg shadow-lg p-4 z-50 animate-fadeIn"
        >
          <div className="border-b border-white/10 pb-3 mb-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Mi Cuenta</h3>
              <div
                className={`text-sm font-medium ${getLevelColor(userLevel)}`}
              >
                Nivel {userLevel}
              </div>
            </div>
            <div className="text-sm text-white/80">{user.email}</div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white/70">Mis Puntos</span>
              <span className="text-lg font-bold">{totalPoints}</span>
            </div>

            {/* Enlaces rápidos */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <a
                href="/profile"
                className="text-sm bg-white/10 hover:bg-white/20 rounded-lg p-2 text-center transition-colors"
              >
                Perfil
              </a>
              <a
                href="/rewards"
                className="text-sm bg-white/10 hover:bg-white/20 rounded-lg p-2 text-center transition-colors"
              >
                Recompensas
              </a>
            </div>
          </div>

          <button
            onClick={async () => {
              await logout();
              window.location.href = '/';
            }}
            className="w-full py-2 text-center bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
