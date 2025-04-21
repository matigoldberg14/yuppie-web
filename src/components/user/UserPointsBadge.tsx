// src/components/user/UserPointsBadge.tsx
import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../lib/UserAuthContext';
import { getUserPoints } from '../../services/userPointsService';

/**
 * Componente para mostrar los puntos del usuario en la barra de navegación
 */
export function UserPointsBadge() {
  const { user } = useUserAuth?.() || { user: null };
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    // Obtener los puntos del usuario cuando esté autenticado
    if (user) {
      const fetchUserPoints = async () => {
        try {
          setLoading(true);
          const points = await getUserPoints();

          // Calcular total de puntos de todos los restaurantes
          let sum = 0;
          for (const restaurant of points) {
            sum += restaurant.points || 0;
          }

          setTotalPoints(sum);
        } catch (error) {
          console.error('Error obteniendo puntos:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserPoints();
    }
  }, [user]);

  // Si no hay usuario, no mostramos nada
  if (!user) {
    return null;
  }

  // Si está cargando, mostramos un esqueleto
  if (loading) {
    return (
      <div className="animate-pulse flex items-center bg-white/10 rounded-full px-3 py-1">
        <div className="h-4 w-16 bg-white/20 rounded-full"></div>
      </div>
    );
  }

  // Mostrar el badge con los puntos
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition-colors"
      >
        <span className="mr-1 text-yellow-300">⭐</span>
        <span className="font-semibold">{totalPoints}</span>
        <span className="text-xs ml-1 text-white/70">pts</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-md rounded-lg shadow-lg p-4 z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">Tus Puntos</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mb-3">
            <div className="text-2xl font-bold text-center">
              {totalPoints}{' '}
              <span className="text-xs text-white/70">puntos</span>
            </div>
          </div>

          <div className="text-sm text-white/70 mb-3">
            <p>
              Gana puntos dejando reseñas y subiendo tickets de tus restaurantes
              favoritos.
            </p>
          </div>

          <a
            href="/profile"
            className="block w-full py-2 text-center bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Ver mi perfil
          </a>
        </div>
      )}
    </div>
  );
}
