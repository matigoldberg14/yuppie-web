// src/components/dashboard/AnalyticsContent.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Progress } from '../ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  CalendarIcon,
  ChevronDown,
  Download,
  TrendingUp,
  Star,
  MessageSquare,
} from 'lucide-react';

const reviewsData = [
  { name: 'Ene', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
  { name: 'Abr', value: 280 },
  { name: 'May', value: 590 },
  { name: 'Jun', value: 320 },
];

export function AnalyticsContent() {
  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="flex gap-2">
          <Button variant="ghost" className="text-white">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Últimos 30 días
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="ghost" className="text-white">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">
              Total de reseñas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2,846</div>
            <p className="text-xs text-white/60">
              <TrendingUp className="h-4 w-4 text-green-400 inline mr-1" />
              +15.3% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">
              Rating promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4.7</div>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <Progress value={94} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">
              Tiempo de respuesta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2.3h</div>
            <p className="text-xs text-white/60">
              <TrendingUp className="h-4 w-4 text-green-400 inline mr-1" />
              -45min vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/10 border-0">
        <CardHeader>
          <CardTitle className="text-white">Evolución de reseñas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reviewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4318FF"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
