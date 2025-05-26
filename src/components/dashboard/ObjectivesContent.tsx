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
import { useTranslations } from '../../i18n/config';
import type { SupportedLang } from '../../i18n/config';

interface Objective {
  id: string;
  name: string;
  meta: number;
  actual: number;
  categoria: string;
  endDate: string;
  restaurantId: string;
}

interface Props {
  lang: SupportedLang;
}

export function ObjectivesContent({ lang }: Props) {
  const t = useTranslations(lang);
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
        if (!restaurantData) throw new Error(t('error.noRestaurantFound'));

        setRestaurantId(restaurantData.documentId);
        // Aquí irá la llamada a la API para obtener los objetivos cuando la implementes
        setObjectives([
          {
            id: '1',
            name: t('objectives.sample.title1'),
            meta: 4.8,
            actual: 4.5,
            categoria: t('objectives.categories.quality'),
            endDate: '2024-12-31',
            restaurantId: restaurantData.documentId,
          },
          {
            id: '2',
            name: t('objectives.sample.title2'),
            meta: 100,
            actual: 75,
            categoria: t('objectives.categories.engagement'),
            endDate: '2024-12-31',
            restaurantId: restaurantData.documentId,
          },
        ]);
      } catch (error) {
        console.error(t('error.loadingObjectives'), error);
        toast({
          variant: 'destructive',
          title: t('error.title'),
          description: t('error.loadingObjectives'),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, t]);

  const handleNewObjective = () => {
    if (
      !newObjective.name ||
      !newObjective.meta ||
      !newObjective.categoria ||
      !newObjective.endDate
    ) {
      toast({
        variant: 'destructive',
        title: t('error.title'),
        description: t('objectives.error.incompleteFields'),
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
      title: t('success.title'),
      description: t('objectives.success.created'),
    });
  };

  const handleDeleteObjective = (id: string) => {
    // Aquí irá la llamada a la API para eliminar el objetivo cuando la implementes
    setObjectives(objectives.filter((obj) => obj.id !== id));
    toast({
      title: t('success.title'),
      description: t('objectives.success.deleted'),
    });
  };

  if (loading) {
    return <div className='p-6'>{t('objectives.loading')}</div>;
  }

  return (
    <div className='p-6'>
      <header className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-white'>
          {t('objectives.title')}
        </h1>
      </header>

      <Tabs defaultValue='current' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='current'>
            {t('objectives.tabs.current')}
          </TabsTrigger>
          <TabsTrigger value='new'>{t('objectives.tabs.new')}</TabsTrigger>
        </TabsList>

        <TabsContent value='current'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {objectives.map((objective) => (
              <Card key={objective.id} className='bg-white/10 border-0'>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle className='text-white'>
                        {objective.name}
                      </CardTitle>
                      <CardDescription className='text-white/60'>
                        {objective.categoria}
                      </CardDescription>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDeleteObjective(objective.id)}
                      className='text-red-400 hover:text-red-500 hover:bg-red-400/10'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div>
                      <div className='flex justify-between text-sm mb-2'>
                        <span className='text-white/60'>
                          {t('objectives.progress')}
                        </span>
                        <span className='text-white/60'>
                          {Math.round(
                            (objective.actual / objective.meta) * 100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={(objective.actual / objective.meta) * 100}
                        className='h-2'
                      />
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-sm text-white/60'>
                          {t('objectives.target')}
                        </p>
                        <p className='text-white'>{objective.meta}</p>
                      </div>
                      <div>
                        <p className='text-sm text-white/60'>
                          {t('objectives.current')}
                        </p>
                        <p className='text-white'>{objective.actual}</p>
                      </div>
                    </div>
                    <div>
                      <p className='text-sm text-white/60'>
                        {t('objectives.endDate')}
                      </p>
                      <p className='text-white'>
                        {new Date(objective.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='new'>
          <Card className='bg-white/10 border-0'>
            <CardHeader>
              <CardTitle className='text-white'>
                {t('objectives.new.title')}
              </CardTitle>
              <CardDescription className='text-white/60'>
                {t('objectives.new.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name' className='text-white'>
                    {t('objectives.new.fields.name')}
                  </Label>
                  <Input
                    id='name'
                    value={newObjective.name}
                    onChange={(e) =>
                      setNewObjective({ ...newObjective, name: e.target.value })
                    }
                    className='bg-white/10 border-0 text-white'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='meta' className='text-white'>
                    {t('objectives.new.fields.target')}
                  </Label>
                  <Input
                    id='meta'
                    type='number'
                    value={newObjective.meta}
                    onChange={(e) =>
                      setNewObjective({ ...newObjective, meta: e.target.value })
                    }
                    className='bg-white/10 border-0 text-white'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='categoria' className='text-white'>
                    {t('objectives.new.fields.category')}
                  </Label>
                  <Select
                    value={newObjective.categoria}
                    onValueChange={(value) =>
                      setNewObjective({ ...newObjective, categoria: value })
                    }
                  >
                    <SelectTrigger className='bg-white/10 border-0 text-white'>
                      <SelectValue
                        placeholder={t(
                          'objectives.new.fields.categoryPlaceholder'
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='quality'>
                        {t('objectives.categories.quality')}
                      </SelectItem>
                      <SelectItem value='engagement'>
                        {t('objectives.categories.engagement')}
                      </SelectItem>
                      <SelectItem value='sales'>
                        {t('objectives.categories.sales')}
                      </SelectItem>
                      <SelectItem value='efficiency'>
                        {t('objectives.categories.efficiency')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='endDate' className='text-white'>
                    {t('objectives.new.fields.endDate')}
                  </Label>
                  <Input
                    id='endDate'
                    type='date'
                    value={newObjective.endDate}
                    onChange={(e) =>
                      setNewObjective({
                        ...newObjective,
                        endDate: e.target.value,
                      })
                    }
                    className='bg-white/10 border-0 text-white'
                  />
                </div>
                <Button onClick={handleNewObjective} className='w-full'>
                  {t('objectives.new.submit')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
