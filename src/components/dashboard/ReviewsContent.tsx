// src/components/dashboard/ReviewsContent.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import {
  Search,
  Filter,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const reviewsData = [
  {
    id: 1,
    author: 'María García',
    rating: 5,
    date: '2024-03-15',
    content: 'Excelente servicio y ambiente. La comida estaba deliciosa.',
    likes: 12,
    dislikes: 1,
    replies: 1,
    platform: 'Google',
  },
  // ... puedes agregar más reseñas de ejemplo
];

export function ReviewsContent() {
  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Reseñas</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            <Input
              placeholder="Buscar reseñas..."
              className="pl-9 bg-white/10 border-0 text-white w-64"
            />
          </div>
          <Button variant="ghost" className="text-white">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </header>

      <div className="space-y-4">
        {reviewsData.map((review) => (
          <Card key={review.id} className="bg-white/10 border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{review.author[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-white text-lg">
                      {review.author}
                    </CardTitle>
                    <p className="text-sm text-white/60">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < review.rating ? 'text-yellow-400' : 'text-white/30'
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">{review.content}</p>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="text-white/60">
                  <ThumbsUp className="mr-1 h-4 w-4" /> {review.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-white/60">
                  <ThumbsDown className="mr-1 h-4 w-4" /> {review.dislikes}
                </Button>
                <Button variant="ghost" size="sm" className="text-white/60">
                  <MessageSquare className="mr-1 h-4 w-4" /> {review.replies}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
