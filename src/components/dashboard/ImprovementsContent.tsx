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
import { useTranslations } from '../../i18n/config';
import type { SupportedLang } from '../../i18n/config';

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

interface Props {
  lang: SupportedLang;
}

export function ImprovementsContent({ lang }: Props) {
  const t = useTranslations(lang);
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
        if (!restaurantData) throw new Error(t('error.noRestaurantFound'));

        setRestaurantId(restaurantData.documentId);
        // Aquí irá la llamada a la API para obtener las mejoras cuando la implementes
        setImprovements([
          {
            id: '1',
            title: t('improvements.sample.title1'),
            description: t('improvements.sample.description1'),
            category: t('improvements.categories.technology'),
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
            title: t('improvements.sample.title2'),
            description: t('improvements.sample.description2'),
            category: t('improvements.categories.menu'),
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
        console.error(t('error.loadingImprovements'), error);
        toast({
          variant: 'destructive',
          title: t('error.title'),
          description: t('error.loadingImprovements'),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, t]);

  const handleNewImprovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newImprovement.title ||
      !newImprovement.description ||
      !newImprovement.category
    ) {
      toast({
        variant: 'destructive',
        title: t('error.title'),
        description: t('improvements.error.incompleteFields'),
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
        name: auth?.currentUser?.displayName || t('improvements.defaultAuthor'),
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
      title: t('success.title'),
      description: t('improvements.success.proposed'),
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
        return t('improvements.status.pending');
      case 'in_review':
        return t('improvements.status.inReview');
      case 'approved':
        return t('improvements.status.approved');
      case 'rejected':
        return t('improvements.status.rejected');
      default:
        return status;
    }
  };

  if (loading) {
    return <div className='p-6'>{t('improvements.loading')}</div>;
  }

  return (
    <div className='p-6'>
      <header className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-white'>
          {t('improvements.title')}
        </h1>
      </header>

      <Tabs defaultValue='list' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='list'>{t('improvements.tabs.list')}</TabsTrigger>
          <TabsTrigger value='new'>{t('improvements.tabs.new')}</TabsTrigger>
        </TabsList>

        <TabsContent value='list' className='space-y-4'>
          {improvements.map((improvement) => (
            <Card key={improvement.id} className='bg-white/10 border-0'>
              <CardHeader>
                <div className='flex justify-between items-start'>
                  <div>
                    <CardTitle className='text-white'>
                      {improvement.title}
                    </CardTitle>
                    <CardDescription className='text-white/60'>
                      {improvement.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(improvement.status)}>
                    {getStatusText(improvement.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-4 text-white/60'>
                  <div className='flex items-center'>
                    <ThumbsUp className='h-4 w-4 mr-1' />
                    {improvement.votes.up}
                  </div>
                  <div className='flex items-center'>
                    <ThumbsDown className='h-4 w-4 mr-1' />
                    {improvement.votes.down}
                  </div>
                  <div className='flex items-center'>
                    <MessageSquare className='h-4 w-4 mr-1' />
                    {improvement.comments}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value='new'>
          <Card className='bg-white/10 border-0'>
            <CardHeader>
              <CardTitle className='text-white'>
                {t('improvements.new.title')}
              </CardTitle>
              <CardDescription className='text-white/60'>
                {t('improvements.new.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNewImprovement} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='title' className='text-white'>
                    {t('improvements.new.fields.title')}
                  </Label>
                  <Input
                    id='title'
                    value={newImprovement.title}
                    onChange={(e) =>
                      setNewImprovement({
                        ...newImprovement,
                        title: e.target.value,
                      })
                    }
                    className='bg-white/10 border-0 text-white'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='category' className='text-white'>
                    {t('improvements.new.fields.category')}
                  </Label>
                  <Select
                    value={newImprovement.category}
                    onValueChange={(value) =>
                      setNewImprovement({ ...newImprovement, category: value })
                    }
                  >
                    <SelectTrigger className='bg-white/10 border-0 text-white'>
                      <SelectValue
                        placeholder={t(
                          'improvements.new.fields.categoryPlaceholder'
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='technology'>
                        {t('improvements.categories.technology')}
                      </SelectItem>
                      <SelectItem value='menu'>
                        {t('improvements.categories.menu')}
                      </SelectItem>
                      <SelectItem value='service'>
                        {t('improvements.categories.service')}
                      </SelectItem>
                      <SelectItem value='facilities'>
                        {t('improvements.categories.facilities')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description' className='text-white'>
                    {t('improvements.new.fields.description')}
                  </Label>
                  <Textarea
                    id='description'
                    value={newImprovement.description}
                    onChange={(e) =>
                      setNewImprovement({
                        ...newImprovement,
                        description: e.target.value,
                      })
                    }
                    className='bg-white/10 border-0 text-white'
                  />
                </div>
                <Button type='submit' className='w-full'>
                  {t('improvements.new.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
