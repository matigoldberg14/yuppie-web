// src/components/dashboard/DashboardContent.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { getRestaurantByFirebaseUID } from '../../services/api';
import {
  Bell,
  ChevronDown,
  Search,
  Star,
  Activity,
  MessageSquare,
  Users2,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

// Datos de ejemplo
const teamData = [
  {
    name: 'Juan Pérez',
    role: 'Community Manager',
    score: 92,
    avatar: '/placeholder.svg',
    reviews: 156,
    rating: 4.8,
  },
  {
    name: 'Matías González',
    role: 'Customer Success',
    score: 88,
    avatar: '/placeholder.svg',
    reviews: 142,
    rating: 4.6,
  },
  {
    name: 'Ian Rodriguez',
    role: 'Support Lead',
    score: 95,
    avatar: '/placeholder.svg',
    reviews: 178,
    rating: 4.9,
  },
];

const recentActivity = [
  {
    type: 'review',
    user: 'Café Central',
    action: 'Nueva reseña 5⭐',
    time: '2m',
  },
  {
    type: 'response',
    user: 'Bar Notable',
    action: 'Respuesta enviada',
    time: '5m',
  },
  {
    type: 'alert',
    user: 'Restaurant Gourmet',
    action: 'Alerta de reseña negativa',
    time: '15m',
  },
  {
    type: 'milestone',
    user: 'Pizzería Italia',
    action: 'Alcanzó 100 reseñas',
    time: '1h',
  },
];

interface RestaurantData {
  name: string;
  owner: {
    firstName: string;
    lastName: string;
  };
}

export function DashboardContent() {
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth?.currentUser?.uid) {
          console.log('No hay usuario autenticado');
          return;
        }

        console.log('Fetching data for:', auth.currentUser.uid);
        const data = await getRestaurantByFirebaseUID(auth.currentUser.uid);
        console.log('Restaurant data:', data);
        setRestaurantData(data);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-white">Cargando datos...</div>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div className="p-8">
        <div className="text-white">
          No se encontraron datos del restaurante.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            ¡Bienvenido {restaurantData.owner.firstName}{' '}
            {restaurantData.owner.lastName}!
          </h1>
          <p className="text-white/60">Restaurante: {restaurantData.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            <Input
              placeholder="Buscar..."
              className="w-64 pl-9 bg-white/10 border-0 text-white placeholder:text-white/60 focus-visible:ring-1 focus-visible:ring-purple-400"
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="relative text-white hover:bg-white/10"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium flex items-center justify-center">
              3
            </span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-white hover:bg-white/10"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>MG</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-4 grid gap-4">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/10 border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-white text-sm font-medium">
                Reseñas Totales
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">1,429</div>
              <p className="text-xs text-white/60">
                <TrendingUp className="h-4 w-4 text-green-400 inline mr-1" />
                +15.3% vs mes anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Team Performance */}
          <Card className="bg-white/10 border-0">
            <CardHeader>
              <CardTitle className="text-white">
                Rendimiento del Equipo
              </CardTitle>
              <p className="text-white/60">
                Top miembros basado en respuestas y calificación
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {teamData.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {member.name}
                        </p>
                        <p className="text-xs text-white/60">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {member.score}%
                      </p>
                      <p className="text-xs text-white/60">
                        {member.reviews} reseñas
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/10 border-0">
            <CardHeader>
              <CardTitle className="text-white">Actividad Reciente</CardTitle>
              <p className="text-white/60">Últimas interacciones y eventos</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
                      {activity.type === 'review' && (
                        <Star className="h-4 w-4 text-yellow-400" />
                      )}
                      {activity.type === 'response' && (
                        <MessageSquare className="h-4 w-4 text-blue-400" />
                      )}
                      {activity.type === 'alert' && (
                        <Bell className="h-4 w-4 text-red-400" />
                      )}
                      {activity.type === 'milestone' && (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {activity.user}
                      </p>
                      <p className="text-xs text-white/60">{activity.action}</p>
                    </div>
                    <p className="text-xs text-white/60">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
