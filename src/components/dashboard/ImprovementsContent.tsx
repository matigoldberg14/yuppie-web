// src/components/dashboard/ImprovementsContent.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../ui/card';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';
import { MessageSquare, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getRestaurantByFirebaseUID } from '../../services/api';

interface Improvement {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  author: {
    name: string;
    email: string;
  };
  votes: {
    up: number;
    down: number;
  };
  comments: number;
  createdAt: string;
  restaurantId: string;
}

export function ImprovementsContent() {
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const { toast } = useToast();
  const [newImprovement, setNewImprovement] = useState({
    title: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth?.currentUser?.uid) return;

        const restaurantData = await getRestaurantByFirebaseUID(
          auth.currentUser.uid
        );
        if (!restaurantData) throw new Error('No restaurant found');

        setRestaurantId(restaurantData.documentId);
        // Aquí irá la llamada a la API para obtener las mejoras cuando la implementes
        setImprovements([
          {
            id: '1',
            title: 'Implementar sistema de reservas online',
            description:
              'Muchos clientes han solicitado poder hacer reservas a través de nuestra página web.',
            category: 'Tecnología',
            status: 'pending',
            author: {
              name: 'María López',
              email: 'maria@mail.com',
            },
            votes: {
              up: 15,
              down: 2,
            },
            comments: 3,
            createdAt: new Date().toISOString(),
            restaurantId: restaurantData.documentId,
          },
          {
            id: '2',
            title: 'Ampliar el menú vegetariano',
            description:
              'Hemos recibido feedback sobre la falta de opciones vegetarianas.',
            category: 'Menú',
            status: 'in_review',
            author: {
              name: 'Carlos Rodríguez',
              email: 'carlos@mail.com',
            },
            votes: {
              up: 25,
              down: 1,
            },
            comments: 7,
            createdAt: new Date().toISOString(),
            restaurantId: restaurantData.documentId,
          },
        ] as Improvement[]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar las mejoras',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleNewImprovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newImprovement.title ||
      !newImprovement.description ||
      !newImprovement.category
    ) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor completa todos los campos',
      });
      return;
    }

    // Aquí irá la llamada a la API para crear la mejora cuando la implementes
    const improvement: Improvement = {
      id: Date.now().toString(),
      title: newImprovement.title,
      description: newImprovement.description,
      category: newImprovement.category,
      status: 'pending',
      author: {
        name: auth?.currentUser?.displayName || 'Usuario',
        email: auth?.currentUser?.email || '',
      },
      votes: {
        up: 0,
        down: 0,
      },
      comments: 0,
      createdAt: new Date().toISOString(),
      restaurantId: restaurantId || '',
    };

    setImprovements([...improvements, improvement]);
    setNewImprovement({ title: '', description: '', category: '' });
    toast({
      title: 'Éxito',
      description: 'Mejora propuesta correctamente',
    });
  };

  const getStatusColor = (status: Improvement['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'in_review':
        return 'bg-blue-500/20 text-blue-500';
      case 'approved':
        return 'bg-green-500/20 text-green-500';
      case 'rejected':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusText = (status: Improvement['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_review':
        return 'En revisión';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-white">Cargando mejoras...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Tablero de Mejoras</h1>
      </header>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="bg-white/10">
          <TabsTrigger
            value="current"
            className="data-[state=active]:bg-white/20"
          >
            Mejoras Propuestas
          </TabsTrigger>
          <TabsTrigger value="new" className="data-[state=active]:bg-white/20">
            Nueva Propuesta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <div className="space-y-4">
            {improvements.map((improvement) => (
              <Card key={improvement.id} className="bg-white/10 border-0">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-white">
                        {improvement.title}
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        {improvement.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(improvement.status)}>
                      {getStatusText(improvement.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {improvement.author.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">
                          {improvement.author.name}
                        </p>
                        <p className="text-xs text-white/60">
                          {new Date(improvement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-white">
                      {improvement.category}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex space-x-4">
                    <Button variant="ghost" size="sm" className="text-white/60">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      {improvement.votes.up}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white/60">
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      {improvement.votes.down}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-white/60">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {improvement.comments} comentarios
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new">
          <Card className="bg-white/10 border-0">
            <CardHeader>
              <CardTitle className="text-white">
                Proponer Nueva Mejora
              </CardTitle>
              <CardDescription>
                Comparte tu idea para mejorar la experiencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título de la Mejora</Label>
                  <Input
                    id="title"
                    value={newImprovement.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewImprovement({
                        ...newImprovement,
                        title: e.target.value,
                      })
                    }
                    placeholder="Ej: Implementar sistema de reservas online"
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newImprovement.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewImprovement({
                        ...newImprovement,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe tu idea de mejora y cómo beneficiará al negocio..."
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    onValueChange={(value: string) =>
                      setNewImprovement({ ...newImprovement, category: value })
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tecnología">Tecnología</SelectItem>
                      <SelectItem value="Menú">Menú</SelectItem>
                      <SelectItem value="Servicio">
                        Servicio al Cliente
                      </SelectItem>
                      <SelectItem value="Ambiente">Ambiente</SelectItem>
                      <SelectItem value="Procesos">Procesos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleNewImprovement} className="w-full mt-4">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Proponer Mejora
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
