// src/pages/api/send-review-notification.ts
import type { APIRoute } from 'astro';

export const post: APIRoute = async ({ request }) => {
  try {
    const reviewData = await request.json();

    // Enviar la notificación usando el mismo servicio que ya funciona
    const response = await fetch(
      `${import.meta.env.PUBLIC_API_URL}/notifications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error del servicio de notificaciones:', errorData);
      throw new Error('Error al enviar la notificación');
    }

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
