// src/components/dashboard/ObjectivesContent.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/card';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  BarChart2,
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import { getRestaurantByFirebaseUID } from '../../services/api';

interface Objective {
  id: string;
  name: string;
  meta: number;
  actual: number;
  categoria: string;
  endDate: string;
  restaurantId: string;
}

export function ObjectivesContent() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const { toast } = useToast();
  const [newObjective, setNewObjective] = useState({
    name: '',
    meta: '',
    categoria: '',
    endDate: '',
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
        // Aquí irá la llamada a la API para obtener los objetivos cuando la implementes
        setObjectives([
          {
            id: '1',
            name: 'Aumentar calificación promedio',
            meta: 4.8,
            actual: 4.5,
            categoria: 'Calidad',
            endDate: '2024-12-31',
            restaurantId: restaurantData.documentId,
          },
          {
            id: '2',
            name: 'Incrementar reseñas mensuales',
            meta: 100,
            actual: 75,
            categoria: 'Engagement',
            endDate: '2024-12-31',
            restaurantId: restaurantData.documentId,
          },
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los objetivos',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleNewObjective = () => {
    if (
      !newObjective.name ||
      !newObjective.meta ||
      !newObjective.categoria ||
      !newObjective.endDate
    ) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor completa todos los campos',
      });
      return;
    }

    // Aquí irá la llamada a la API para crear el objetivo cuando la implementes
    const objective: Objective = {
      id: Date.now().toString(),
      name: newObjective.name,
      meta: Number(newObjective.meta),
      actual: 0,
      categoria: newObjective.categoria,
      endDate: newObjective.endDate,
      restaurantId: restaurantId || '',
    };

    setObjectives([...objectives, objective]);
    setNewObjective({ name: '', meta: '', categoria: '', endDate: '' });
    toast({
      title: 'Éxito',
      description: 'Objetivo creado correctamente',
    });
  };

  const handleDeleteObjective = (id: string) => {
    // Aquí irá la llamada a la API para eliminar el objetivo cuando la implementes
    setObjectives(objectives.filter((obj) => obj.id !== id));
    toast({
      title: 'Éxito',
      description: 'Objetivo eliminado correctamente',
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-white">Cargando objetivos...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Objetivos del Negocio</h1>
      </header>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="bg-white/10">
          <TabsTrigger
            value="current"
            className="data-[state=active]:bg-white/20"
          >
            Objetivos Actuales
          </TabsTrigger>
          <TabsTrigger value="new" className="data-[state=active]:bg-white/20">
            Nuevo Objetivo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {objectives.map((objective) => (
              <Card key={objective.id} className="bg-white/10 border-0">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">
                        {objective.name}
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        {objective.categoria}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteObjective(objective.id)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Progreso</span>
                        <span className="text-white">
                          {objective.actual} / {objective.meta}
                        </span>
                      </div>
                      <Progress
                        value={(objective.actual / objective.meta) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/60">Fecha límite</span>
                      <span className="text-white">
                        {new Date(objective.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    {objective.actual >= objective.meta ? (
                      <div className="flex items-center text-green-400 text-sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Objetivo alcanzado
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-400 text-sm">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        En progreso
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new">
          <Card className="bg-white/10 border-0">
            <CardHeader>
              <CardTitle className="text-white">Crear Nuevo Objetivo</CardTitle>
              <CardDescription>
                Define un nuevo objetivo para tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Objetivo</Label>
                  <Input
                    id="name"
                    value={newObjective.name}
                    onChange={(e) =>
                      setNewObjective({ ...newObjective, name: e.target.value })
                    }
                    placeholder="Ej: Aumentar calificación promedio"
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta">Meta</Label>
                  <Input
                    id="meta"
                    type="number"
                    value={newObjective.meta}
                    onChange={(e) =>
                      setNewObjective({ ...newObjective, meta: e.target.value })
                    }
                    placeholder="Ej: 4.8"
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewObjective({ ...newObjective, categoria: value })
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Calidad">Calidad</SelectItem>
                      <SelectItem value="Engagement">Engagement</SelectItem>
                      <SelectItem value="Servicio">Servicio</SelectItem>
                      <SelectItem value="Fidelización">Fidelización</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha límite</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newObjective.endDate}
                    onChange={(e) =>
                      setNewObjective({
                        ...newObjective,
                        endDate: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <Button onClick={handleNewObjective} className="w-full mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Objetivo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
