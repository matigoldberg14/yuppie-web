// src/pages/api/send-review-notification.ts
import type { APIRoute } from 'astro';
import { sendBadReviewAlert } from '../../services/emailService';

export const post: APIRoute = async ({ request }) => {
  try {
    const reviewData = await request.json();

    // Obtener los datos del restaurante de Strapi
    const restaurantResponse = await fetch(
      `${import.meta.env.PUBLIC_API_URL}/restaurants/${
        reviewData.restaurantId
      }?populate=owner`
    );

    if (!restaurantResponse.ok) {
      throw new Error('Error al obtener datos del restaurante');
    }

    const restaurantData = await restaurantResponse.json();
    const { owner, name: restaurantName } = restaurantData.data.attributes;

    // Enviar el email usando nuestro servicio de email
    await sendBadReviewAlert({
      ownerEmail: owner.email,
      ownerName: `${owner.firstName} ${owner.lastName}`,
      restaurantName,
      review: {
        calification: reviewData.calification,
        comment: reviewData.comment,
        typeImprovement: reviewData.typeImprovement,
        email: reviewData.email,
        date: new Date().toISOString(),
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error en send-review-notification:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Error al enviar la notificación',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
