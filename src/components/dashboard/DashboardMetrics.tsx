// src/components/dashboard/DashboardMetrics.tsx
import { useState, useEffect } from 'react';
import { Card } from '../ui/card';

import { Users, Star, MessageSquare, TrendingUp } from 'lucide-react';

type TimeFilter = 'today' | 'week' | 'month' | 'year';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
}

const MetricCard = ({ title, value, icon, change }: MetricCardProps) => (
  <div className="bg-white/5 rounded-lg p-6">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-white/60">{title}</h3>
      {icon}
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    {change && (
      <p
        className={`text-xs ${
          change.startsWith('+') ? 'text-green-500' : 'text-red-500'
        }`}
      >
        {change} vs. periodo anterior
      </p>
    )}
  </div>
);

export function DashboardMetrics() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [metrics, setMetrics] = useState({
    totalReviews: 0,
    averageRating: 0,
    totalTaps: 0,
    responseRate: 0,
  });

  useEffect(() => {
    // TODO: Implement real metrics fetching
    // For now, using mock data
    setMetrics({
      totalReviews: 245,
      averageRating: 4.8,
      totalTaps: 1250,
      responseRate: 78,
    });
  }, [timeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Métricas</h2>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
          className="bg-white/5 text-white border border-white/10 rounded-lg px-4 py-2"
        >
          <option value="today">Hoy</option>
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
          <option value="year">Último año</option>
        </select>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Reviews"
          value={metrics.totalReviews}
          icon={<MessageSquare className="h-5 w-5 text-white/60" />}
        />
        <MetricCard
          title="Rating Promedio"
          value={metrics.averageRating}
          icon={<Star className="h-5 w-5 text-white/60" />}
        />
        <MetricCard
          title="Total Taps"
          value={metrics.totalTaps}
          icon={<Users className="h-5 w-5 text-white/60" />}
        />
        <MetricCard
          title="Tasa de Respuesta"
          value={`${metrics.responseRate}%`}
          icon={<TrendingUp className="h-5 w-5 text-white/60" />}
        />
      </div>
    </div>
  );
}
