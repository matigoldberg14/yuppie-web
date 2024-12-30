// src/components/dashboard/TeamContent.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import { Search, Plus, MoreVertical, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const teamData = [
  {
    id: 1,
    name: 'Ana Rodríguez',
    role: 'Community Manager',
    performance: 95,
    reviewsHandled: 230,
    avgRating: 4.8,
    avatar: '/placeholder.svg',
  },
  {
    id: 2,
    name: 'Carlos Gómez',
    role: 'Customer Success',
    performance: 88,
    reviewsHandled: 180,
    avgRating: 4.6,
    avatar: '/placeholder.svg',
  },
  // Puedes agregar más miembros aquí
];

export function TeamContent() {
  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Equipo</h1>
        <Button variant="primary">
          <Plus className="mr-2 h-4 w-4" /> Agregar miembro
        </Button>
      </header>

      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
          <Input
            placeholder="Buscar miembro..."
            className="pl-9 bg-white/10 border-0 text-white"
          />
        </div>
      </div>

      <Card className="bg-white/10 border-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-white/60">Miembro</th>
              <th className="text-left p-4 text-white/60">Rol</th>
              <th className="text-left p-4 text-white/60">Performance</th>
              <th className="text-left p-4 text-white/60">Reseñas</th>
              <th className="text-left p-4 text-white/60">Rating</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {teamData.map((member) => (
              <tr key={member.id} className="border-b border-white/10">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-white">{member.role}</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                    {member.performance}%
                  </span>
                </td>
                <td className="p-4 text-white">{member.reviewsHandled}</td>
                <td className="p-4">
                  <div className="flex items-center text-white">
                    {member.avgRating}
                    <Star className="h-4 w-4 text-yellow-400 ml-1" />
                  </div>
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
