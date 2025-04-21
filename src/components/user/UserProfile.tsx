// src/components/user/UserProfile.tsx
import React, { useEffect, useState } from 'react';
import { useUserAuth } from '../../lib/UserAuthContext';
import { UserAuthForm } from '../auth/UserAuthForm';
import { getUserPoints } from '../../services/userPointsService';
import type { UserPoints } from '../../services/userPointsService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { motion } from 'framer-motion';
import {
  checkExpiringPoints,
  getSoonToExpireTransactions,
  formatExpirationDate,
} from '../../services/pointsExpirationService';

// Componente para mostrar el detalle de puntos por expirar
const ExpiringSoonPoints = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const result = await getSoonToExpireTransactions();
        setTransactions(result);
      } catch (error) {
        console.error('Error obteniendo transacciones por expirar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return <div className="text-center py-2">Cargando...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-2">
        No hay transacciones por expirar pronto.
      </div>
    );
  }

  // Agrupar por restaurante
  const byRestaurant = transactions.reduce((acc: any, transaction: any) => {
    const restaurantId = transaction.restaurant.documentId;

    if (!acc[restaurantId]) {
      acc[restaurantId] = {
        restaurant: transaction.restaurant,
        transactions: [],
        totalPoints: 0,
      };
    }

    acc[restaurantId].transactions.push(transaction);
    acc[restaurantId].totalPoints += transaction.amount;

    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.values(byRestaurant).map((group: any) => (
        <div
          key={group.restaurant.documentId}
          className="bg-white/5 p-3 rounded-lg"
        >
          <div className="flex justify-between items-center mb-2">
            <h5 className="font-medium">{group.restaurant.name}</h5>
            <span className="font-bold">{group.totalPoints} puntos</span>
          </div>
          <div className="text-sm text-white/70">
            Expira el {formatExpirationDate(group.transactions[0].expiresAt)}
          </div>
        </div>
      ))}

      <div className="text-center text-sm text-white/70 pt-2">
        ℹ️ Los puntos expiran 3 meses después de ser obtenidos
      </div>
    </div>
  );
};

export function UserProfile() {
  const { user, logout, loading } = useUserAuth() || {
    user: null,
    logout: async () => {},
    loading: false,
  };
  const [userPoints, setUserPoints] = useState<UserPoints[]>([]);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [expirationInfo, setExpirationInfo] = useState<{
    expiredPoints: number;
    soonToExpirePoints: number;
    nextExpirationDate: string | null;
  }>({
    expiredPoints: 0,
    soonToExpirePoints: 0,
    nextExpirationDate: null,
  });
  const [showExpirationDetails, setShowExpirationDetails] = useState(false);

  // Cargar puntos del usuario
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user) return;

      setLoadingPoints(true);
      try {
        const points = await getUserPoints();
        setUserPoints(points);
      } catch (error) {
        console.error('Error cargando puntos:', error);
      } finally {
        setLoadingPoints(false);
      }
    };

    fetchUserPoints();
  }, [user]);

  // Cargar información de expiración
  useEffect(() => {
    const fetchExpirationInfo = async () => {
      if (!user) return;

      try {
        const info = await checkExpiringPoints();
        setExpirationInfo(info);
      } catch (error) {
        console.error('Error verificando puntos por expirar:', error);
      }
    };

    fetchExpirationInfo();
  }, [user]);

  // Componente de niveles
  const LevelBadge = ({ level }: { level: string }) => {
    const getBadgeColor = () => {
      switch (level) {
        case 'Plata':
          return 'bg-gray-300 text-gray-800';
        case 'Oro':
          return 'bg-yellow-400 text-yellow-900';
        case 'Platino':
          return 'bg-blue-300 text-blue-900';
        default:
          return 'bg-white/20 text-white';
      }
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor()}`}
      >
        {level}
      </span>
    );
  };

  // Si el usuario no está autenticado, mostrar formulario de login
  if (!user && !loading) {
    return (
      <div className="max-w-md mx-auto">
        <UserAuthForm />
      </div>
    );
  }

  // Mientras carga
  if (loading || !user) {
    return (
      <div className="max-w-lg mx-auto p-6 card text-center">
        <div className="animate-pulse">
          <div className="h-10 bg-white/10 rounded mb-4"></div>
          <div className="h-40 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cabecera del perfil */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {user.displayName || user.email}
            </h2>
            <p className="text-white/70">{user.email}</p>
          </div>
          <button
            onClick={() => logout()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Notificación de puntos por expirar */}
      {expirationInfo.soonToExpirePoints > 0 && (
        <motion.div
          className="card p-4 bg-yellow-500/20 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <span className="text-xl mr-2 mt-1">⚠️</span>
              <div>
                <h3 className="font-bold text-lg">Puntos por expirar</h3>
                <p className="text-white/80">
                  Tienes{' '}
                  <span className="font-bold text-yellow-300">
                    {expirationInfo.soonToExpirePoints}
                  </span>{' '}
                  puntos que expirarán pronto
                </p>
                {expirationInfo.nextExpirationDate && (
                  <p className="text-sm text-white/70">
                    Próxima expiración:{' '}
                    {formatExpirationDate(expirationInfo.nextExpirationDate)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowExpirationDetails(!showExpirationDetails)}
              className="text-white/70 hover:text-white"
            >
              {showExpirationDetails ? 'Ocultar' : 'Detalles'}
            </button>
          </div>

          {showExpirationDetails && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="font-medium mb-2">
                Detalle de puntos por expirar:
              </h4>
              <ExpiringSoonPoints />
            </div>
          )}
        </motion.div>
      )}

      {/* Contenido principal */}
      <Tabs defaultValue="points">
        <TabsList className="bg-white/10 mb-6">
          <TabsTrigger value="points">Mis Puntos</TabsTrigger>
          <TabsTrigger value="transactions">Historial</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
        </TabsList>

        {/* Tab de Puntos */}
        <TabsContent value="points">
          {loadingPoints ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white/5 rounded-lg"></div>
              ))}
            </div>
          ) : userPoints.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {userPoints.map((pointsData) => (
                <div key={pointsData.id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">
                        {pointsData.restaurant.name}
                      </h3>
                      <LevelBadge level={pointsData.level || 'Básico'} />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        {pointsData.points}
                      </div>
                      <div className="text-sm text-white/70">Puntos</div>
                    </div>
                  </div>

                  {/* Barra de progreso hacia el siguiente nivel */}
                  <div className="mt-4">
                    <div className="text-sm text-white/70 mb-1 flex justify-between">
                      <span>
                        Progreso hacia{' '}
                        {getNextLevel(pointsData.level || 'Básico')}
                      </span>
                      <span>70%</span>
                    </div>
                    <div className="bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: '70%' }}
                      ></div>
                    </div>
                  </div>

                  {/* Rachas */}
                  {pointsData.streak > 0 && (
                    <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg flex items-center">
                      <span className="text-xl mr-2">🔥</span>
                      <div>
                        <span className="font-bold">{pointsData.streak}</span>{' '}
                        {pointsData.streak === 1 ? 'día' : 'días'} de racha
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-xl mb-4">Aún no tienes puntos acumulados</p>
              <p className="text-white/70">
                Gana puntos dejando reseñas o subiendo tickets de tus
                restaurantes favoritos.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Tab de Transacciones */}
        <TabsContent value="transactions">
          <div className="card p-6">
            <h3 className="text-xl font-bold mb-4">
              Historial de Transacciones
            </h3>

            {/* Aquí irá el historial de transacciones */}
            <p className="text-white/70">
              Próximamente podrás ver el historial detallado de tus puntos.
            </p>
          </div>
        </TabsContent>

        {/* Tab de Recompensas */}
        <TabsContent value="rewards">
          <div className="card p-6">
            <h3 className="text-xl font-bold mb-4">Recompensas Disponibles</h3>

            {/* Aquí irán las recompensas */}
            <p className="text-white/70">
              Próximamente podrás canjear tus puntos por recompensas exclusivas.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Función helper para obtener el siguiente nivel
function getNextLevel(currentLevel: string): string {
  switch (currentLevel) {
    case 'Básico':
      return 'Plata';
    case 'Plata':
      return 'Oro';
    case 'Oro':
      return 'Platino';
    case 'Platino':
      return 'Platino+';
    default:
      return 'Plata';
  }
}
