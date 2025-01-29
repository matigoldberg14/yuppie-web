// src/components/dashboard/ReviewsContent.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import {
  getRestaurantByFirebaseUID,
  getRestaurantReviews,
} from '../../services/api';
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';

interface Review {
  id: number;
  documentId: string;
  calification: number;
  typeImprovement: string;
  comment: string;
  email: string;
  googleSent: boolean;
  date: string;
  createdAt: string;
}

export function ReviewsContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (!auth?.currentUser?.uid) {
          console.log('No hay usuario autenticado');
          return;
        }

        // Primero obtener el restaurante
        const restaurantData = await getRestaurantByFirebaseUID(
          auth.currentUser.uid
        );
        if (!restaurantData) {
          throw new Error('No se encontró el restaurante');
        }

        // Luego obtener las reviews
        const reviewsData = await getRestaurantReviews(
          restaurantData.documentId
        );
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-white">Cargando reseñas...</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-8">
        <div className="text-white">No hay reseñas disponibles.</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Reseñas</h1>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="bg-white/10 border-0">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-white">{review.email}</CardTitle>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.calification
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-white/60">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-white">{review.comment}</p>
                {review.typeImprovement && (
                  <div className="mt-2">
                    <span className="text-sm bg-white/10 text-white px-2 py-1 rounded-full">
                      {review.typeImprovement}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
