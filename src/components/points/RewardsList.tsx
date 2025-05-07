// src/components/points/RewardsList.tsx
import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../lib/UserAuthContext';
import {
  getUserPoints,
  getAvailableRewards,
  redeemReward,
} from '../../services/userPointsService';
import { UserAuthForm } from '../auth/UserAuthForm';
import { useToast } from '../ui/use-toast';

interface Reward {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  requiredLevel: string;
  restaurant: {
    id: number;
    name: string;
    documentId: string;
  };
}

interface RestaurantWithPoints {
  id: number;
  documentId: string;
  name: string;
  points: number;
  level: string;
}

export function RewardsList() {
  const { user, loading } = useUserAuth?.() || { user: null, loading: false };
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantWithPoints[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | 'all'>(
    'all'
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoadingData(true);

        // Cargar puntos del usuario por restaurante
        const userPoints = await getUserPoints();
        setRestaurants(
          userPoints.map((point) => ({
            id: point.restaurant.id,
            documentId: point.restaurant.documentId,
            name: point.restaurant.name,
            points: point.points,
            level: point.level || 'Básico',
          }))
        );

        // Cargar todas las recompensas disponibles
        const allRewards: Reward[] = [];

        // Para cada restaurante, cargar sus recompensas
        for (const restaurant of userPoints) {
          const restaurantRewards = await getAvailableRewards(
            restaurant.restaurant.documentId
          );

          // Formatear las recompensas y agregar al array
          const formattedRewards = restaurantRewards.map((reward: any) => ({
            id: reward.id,
            name: reward.attributes?.name || 'Recompensa sin nombre',
            description: reward.attributes?.description || '',
            pointsCost: reward.attributes?.pointsCost || 0,
            requiredLevel: reward.attributes?.requiredLevel || 'Básico',
            restaurant: {
              id: restaurant.restaurant.id,
              name: restaurant.restaurant.name,
              documentId: restaurant.restaurant.documentId,
            },
          }));

          allRewards.push(...formattedRewards);
        }

        setRewards(allRewards);
      } catch (error) {
        console.error('Error cargando datos de recompensas:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            'No pudimos cargar las recompensas. Por favor, intenta más tarde.',
          duration: 5000,
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleRedeem = async (rewardId: number) => {
    if (!user) return;

    try {
      setRedeeming(rewardId);

      const result = await redeemReward(rewardId);

      if (result.success) {
        toast({
          title: '¡Recompensa canjeada!',
          description:
            result.message || 'Tu recompensa ha sido canjeada con éxito',
          duration: 5000,
        });

        // Recargar datos para actualizar puntos
        const userPoints = await getUserPoints();
        setRestaurants(
          userPoints.map((point) => ({
            id: point.restaurant.id,
            documentId: point.restaurant.documentId,
            name: point.restaurant.name,
            points: point.points,
            level: point.level || 'Básico',
          }))
        );
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'No se pudo canjear la recompensa',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error canjeando recompensa:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al canjear la recompensa',
        duration: 5000,
      });
    } finally {
      setRedeeming(null);
    }
  };

  // Filtrar recompensas según el restaurante seleccionado
  const filteredRewards =
    selectedRestaurant === 'all'
      ? rewards
      : rewards.filter(
          (reward) => reward.restaurant.documentId === selectedRestaurant
        );

  // Función para verificar si el usuario puede canjear una recompensa
  const canRedeem = (reward: Reward): boolean => {
    // Encontrar el restaurante correspondiente
    const restaurant = restaurants.find(
      (r) => r.documentId === reward.restaurant.documentId
    );

    if (!restaurant) return false;

    // Verificar puntos y nivel
    const hasEnoughPoints = restaurant.points >= reward.pointsCost;
    const hasRequiredLevel =
      getLevelOrder(restaurant.level) >= getLevelOrder(reward.requiredLevel);

    return hasEnoughPoints && hasRequiredLevel;
  };

  // Obtener orden del nivel
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

  // Si el usuario no está autenticado, mostrar formulario de login
  if (!user && !loading) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card p-6 mb-6">
          <div className="text-center mb-6">
            <span className="text-3xl mb-4 block">🎁</span>
            <h2 className="text-xl font-bold mb-2">
              Canjea tus puntos por recompensas
            </h2>
            <p className="text-white/80">
              Inicia sesión para ver y canjear las recompensas disponibles con
              tus puntos acumulados.
            </p>
          </div>
          <UserAuthForm />
        </div>
      </div>
    );
  }

  // Mientras carga
  if (loading || loadingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 animate-pulse">
          <div className="h-8 bg-white/10 rounded mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-52 bg-white/5 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Resumen de puntos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {restaurants.map((restaurant) => (
          <div key={restaurant.documentId} className="card p-4">
            <h3 className="font-bold mb-1">{restaurant.name}</h3>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Nivel: {restaurant.level}</span>
              <span className="font-bold text-lg">
                {restaurant.points} puntos
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filtro de restaurantes */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Recompensas disponibles</h2>

        <div className="relative">
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg py-2 pl-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="all">Todos los restaurantes</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.documentId} value={restaurant.documentId}>
                {restaurant.name}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
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
      </div>

      {/* Lista de recompensas */}
      {filteredRewards.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRewards.map((reward) => {
            const isAvailable = canRedeem(reward);
            const restaurant = restaurants.find(
              (r) => r.documentId === reward.restaurant.documentId
            );

            return (
              <div
                key={reward.id}
                className={`card p-5 ${!isAvailable ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{reward.name}</h3>
                  <div className="flex items-center bg-white/10 px-2 py-1 rounded-lg">
                    <span className="text-yellow-300 mr-1">⭐</span>
                    <span>{reward.pointsCost}</span>
                  </div>
                </div>

                <p className="text-white/80 text-sm mb-3">
                  {reward.description}
                </p>

                <div className="text-sm text-white/60 mb-3">
                  <div>Restaurante: {reward.restaurant.name}</div>
                  <div>Nivel requerido: {reward.requiredLevel}</div>
                </div>

                <div className="text-sm text-white/70 flex justify-between items-center mb-3">
                  {restaurant ? (
                    <span>Tus puntos: {restaurant.points}</span>
                  ) : (
                    <span>Restaurante no disponible</span>
                  )}

                  {!isAvailable && (
                    <span className="text-yellow-400">
                      {!restaurant || restaurant.points < reward.pointsCost
                        ? 'Puntos insuficientes'
                        : 'Nivel insuficiente'}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleRedeem(reward.id)}
                  disabled={!isAvailable || redeeming === reward.id}
                  className={`w-full py-2 rounded-lg transition-colors ${
                    !isAvailable || redeeming === reward.id
                      ? 'bg-white/10 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {redeeming === reward.id ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Canjeando...
                    </span>
                  ) : (
                    'Canjear'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-6 text-center">
          <p className="text-xl mb-4">No hay recompensas disponibles</p>
          <p className="text-white/70">
            {selectedRestaurant === 'all'
              ? 'Aún no hay recompensas disponibles para canjear. Vuelve más tarde.'
              : 'Este restaurante no tiene recompensas disponibles. Selecciona otro restaurante.'}
          </p>
        </div>
      )}

      {/* Explicación */}
      <div className="mt-10 card p-6 bg-white/5">
        <h3 className="font-bold mb-3">¿Cómo funcionan las recompensas?</h3>
        <div className="space-y-2 text-white/80">
          <p className="flex items-start">
            <span className="bg-white/10 rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">
              1
            </span>
            <span>
              Acumula puntos dejando reseñas y subiendo tickets de tus visitas a
              restaurantes
            </span>
          </p>
          <p className="flex items-start">
            <span className="bg-white/10 rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">
              2
            </span>
            <span>
              Alcanza diferentes niveles para acceder a recompensas exclusivas
            </span>
          </p>
          <p className="flex items-start">
            <span className="bg-white/10 rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">
              3
            </span>
            <span>
              Canjea tus puntos por descuentos, productos gratis y experiencias
              especiales
            </span>
          </p>
          <p className="flex items-start">
            <span className="bg-white/10 rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">
              4
            </span>
            <span>
              Ten en cuenta que los puntos caducan después de 3 meses desde que
              los obtuviste
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
