// Crear este archivo como src/pages/api/check-review-status.ts
// Nota: Para que esto funcione, necesitas configurar API endpoints en Astro

import type { APIRoute } from 'astro';
import { API_CONFIG } from '../../services/api';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const restaurantId = url.searchParams.get('restaurantId');
    const email = url.searchParams.get('email');

    if (!restaurantId || !email) {
      return new Response(
        JSON.stringify({
          error: 'Se requieren parámetros restaurantId y email',
        }),
        { status: 400 }
      );
    }

    // Calcular la fecha de hace 24 horas
    const ayer = new Date();
    ayer.setHours(ayer.getHours() - 24);

    // Endpoint para buscar reviews filtradas
    const apiUrl = `${
      API_CONFIG.baseUrl
    }/reviews?filters[restaurant][documentId][$eq]=${restaurantId}&filters[email][$eq]=${encodeURIComponent(
      email
    )}&filters[createdAt][$gte]=${ayer.toISOString()}&sort=createdAt:desc`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Error en la verificación de email: ${response.status}`);
    }

    const data = await response.json();
    const reviews = data.data || [];

    // Responder con el resultado de la verificación
    return new Response(
      JSON.stringify({
        hasReviewed: reviews.length > 0,
        lastReviewDate: reviews.length > 0 ? reviews[0].createdAt : null,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error en endpoint de verificación:', error);

    return new Response(
      JSON.stringify({
        error: 'Error al verificar estado de review',
        details: error instanceof Error ? error.message : 'Error desconocido',
      }),
      { status: 500 }
    );
  }
};
