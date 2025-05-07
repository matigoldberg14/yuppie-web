// src/components/points/PointsGained.tsx
import React, { useEffect, useState } from 'react';
import { useUserAuth } from '../../lib/UserAuthContext';
import { motion } from 'framer-motion';

interface PointsGainedProps {
  restaurantId: string;
  rating: number;
  isGoogleReview?: boolean;
}

export function PointsGained({
  restaurantId,
  rating,
  isGoogleReview = false,
}: PointsGainedProps) {
  const { user } = useUserAuth();
  const [points, setPoints] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Calcular puntos basados en la calificación y si es Google review
    const calculatePoints = () => {
      // Puntos base por dejar una reseña
      let basePoints = 100;

      // Puntos extra por Google review
      if (isGoogleReview) {
        basePoints += 100;
      }

      // Intentar obtener la racha (streak) del localStorage
      let streakMultiplier = 1;
      try {
        const streakData = localStorage.getItem(`streak_${restaurantId}`);
        if (streakData) {
          const { count } = JSON.parse(streakData);
          if (count > 1) {
            streakMultiplier = 1.5; // 50% extra por racha
          }
        }
      } catch (error) {
        console.error('Error leyendo datos de racha:', error);
      }

      // Calcular puntos totales
      const totalPoints = Math.round(basePoints * streakMultiplier);
      setPoints(totalPoints);

      // Activar la animación
      setTimeout(() => {
        setShowAnimation(true);
      }, 500);
    };

    // Solo calcular si el usuario está autenticado
    if (user) {
      calculatePoints();
    }
  }, [user, restaurantId, rating, isGoogleReview]);

  // Si el usuario no está autenticado, mostrar mensaje de información
  if (!user) {
    return (
      <div className="p-4 bg-white/10 rounded-lg text-center">
        <p className="mb-2">
          <span className="text-yellow-300 text-xl mr-2">💡</span>
          ¿Sabías que puedes ganar puntos por tus reseñas?
        </p>
        <p className="text-sm text-white/70">
          Inicia sesión para acumular puntos y canjearlos por premios exclusivos
        </p>
      </div>
    );
  }

  // Si el usuario está autenticado, mostrar puntos ganados
  return (
    <div className="p-4 bg-white/10 rounded-lg text-center relative overflow-hidden">
      {showAnimation && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
        >
          <div className="text-4xl font-bold text-yellow-300 flex items-center">
            <span className="text-4xl mr-2">🎉</span>+{points} puntos
          </div>
        </motion.div>
      )}

      <div
        className={
          showAnimation
            ? 'opacity-0'
            : 'opacity-100 transition-opacity duration-500'
        }
      >
        <p className="mb-2">
          <span className="text-yellow-300 text-xl mr-2">🎯</span>
          Calculando puntos ganados...
        </p>
      </div>

      {showAnimation && (
        <div
          className="mt-6 opacity-0 animate-fadeIn"
          style={{ animationDelay: '1s', animationFillMode: 'forwards' }}
        >
          <a
            href="/profile"
            className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Ver mis puntos
          </a>
        </div>
      )}
    </div>
  );
}

// Añadir esta animación al CSS global o inline
const fadeInKeyframes = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 1s ease-in-out forwards;
}
`;
