// src/components/points/TransactionsHistory.tsx
import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../lib/UserAuthContext';
import { formatExpirationDate } from '../../services/pointsExpirationService';

interface PointsTransaction {
  id: number;
  amount: number;
  type: 'earned' | 'spent' | 'expired';
  source: string;
  description: string;
  createdAt: string;
  expiresAt?: string;
  restaurant: {
    id: number;
    name: string;
    documentId: string;
  };
}

interface TransactionsHistoryProps {
  restaurantId?: string; // Opcional, para filtrar por restaurante
}

export function TransactionsHistory({
  restaurantId,
}: TransactionsHistoryProps) {
  const { user } = useUserAuth?.() || { user: null };
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'spent' | 'expired'>(
    'all'
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState<'all' | '30days' | '90days'>(
    'all'
  );

  const pageSize = 10; // Transacciones por página

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Construir la URL con parámetros de filtro
        let url = `${
          import.meta.env.PUBLIC_API_URL
        }/points/transactions?page=${page}&pageSize=${pageSize}`;

        // Añadir filtro por tipo
        if (filter !== 'all') {
          url += `&type=${filter}`;
        }

        // Añadir filtro por restaurante
        if (restaurantId) {
          url += `&restaurantId=${restaurantId}`;
        }

        // Añadir filtro por fecha
        if (dateRange !== 'all') {
          const now = new Date();
          const startDate = new Date(now);

          if (dateRange === '30days') {
            startDate.setDate(now.getDate() - 30);
          } else if (dateRange === '90days') {
            startDate.setDate(now.getDate() - 90);
          }

          url += `&from=${startDate.toISOString()}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error obteniendo el historial de transacciones');
        }

        const data = await response.json();
        setTransactions(data.transactions || []);
        setTotalPages(data.pagination?.pageCount || 1);
      } catch (error) {
        console.error('Error cargando historial de transacciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, filter, page, dateRange, restaurantId]);

  // Obtener ícono y color según el tipo de transacción
  const getTransactionInfo = (transaction: PointsTransaction) => {
    switch (transaction.type) {
      case 'earned':
        return {
          icon: '➕',
          color: 'text-green-400',
          label: 'Puntos ganados',
        };
      case 'spent':
        return {
          icon: '🎁',
          color: 'text-blue-400',
          label: 'Puntos canjeados',
        };
      case 'expired':
        return {
          icon: '⏱️',
          color: 'text-red-400',
          label: 'Puntos expirados',
        };
      default:
        return {
          icon: '•',
          color: 'text-white',
          label: 'Transacción',
        };
    }
  };

  // Obtener descripción según la fuente
  const getSourceDescription = (source: string) => {
    switch (source) {
      case 'review':
        return 'Reseña';
      case 'google_review':
        return 'Reseña en Google';
      case 'ticket':
        return 'Ticket de compra';
      case 'streak':
        return 'Racha de visitas';
      case 'redemption':
        return 'Canje de recompensa';
      case 'expiration':
        return 'Expiración automática';
      case 'bonus':
        return 'Puntos de bonificación';
      default:
        return source || 'Otro';
    }
  };

  // Formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="text-center py-4 text-white/70">
        Inicia sesión para ver tu historial de transacciones
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4">Historial de Puntos</h2>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center">
          <label className="mr-2 text-white/70">Tipo:</label>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as any);
              setPage(1); // Resetear página al cambiar filtro
            }}
            className="bg-white/10 border border-white/20 rounded px-3 py-1"
          >
            <option value="all">Todos</option>
            <option value="earned">Ganados</option>
            <option value="spent">Canjeados</option>
            <option value="expired">Expirados</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="mr-2 text-white/70">Período:</label>
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value as any);
              setPage(1); // Resetear página al cambiar filtro
            }}
            className="bg-white/10 border border-white/20 rounded px-3 py-1"
          >
            <option value="all">Todo</option>
            <option value="30days">Últimos 30 días</option>
            <option value="90days">Últimos 90 días</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <div className="inline-block animate-spin h-6 w-6 border-2 border-white/20 border-t-white rounded-full mr-2"></div>
          <span>Cargando transacciones...</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-8 text-center text-white/70">
          No hay transacciones para mostrar con los filtros seleccionados
        </div>
      ) : (
        <>
          {/* Lista de transacciones */}
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const { icon, color, label } = getTransactionInfo(transaction);

              return (
                <div
                  key={transaction.id}
                  className="bg-white/5 rounded-lg p-4 flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center">
                      <span className="mr-2">{icon}</span>
                      <span className={`font-bold ${color}`}>{label}</span>
                    </div>

                    <div className="ml-6 mt-1">
                      <div className="text-sm text-white/80">
                        {transaction.description ||
                          getSourceDescription(transaction.source)}
                      </div>
                      <div className="text-sm text-white/60">
                        {transaction.restaurant.name}
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        {formatDate(transaction.createdAt)}
                        {transaction.type === 'earned' &&
                          transaction.expiresAt && (
                            <span>
                              {' '}
                              • Expira:{' '}
                              {formatExpirationDate(transaction.expiresAt)}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`font-bold text-lg ${
                      transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-lg ${
                    page === 1
                      ? 'bg-white/5 text-white/40 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Anterior
                </button>

                <div className="px-3 py-1 bg-white/5 rounded-lg">
                  Página {page} de {totalPages}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded-lg ${
                    page === totalPages
                      ? 'bg-white/5 text-white/40 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
