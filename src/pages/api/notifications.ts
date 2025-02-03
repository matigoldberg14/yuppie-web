import type { APIRoute } from 'astro';

export const post: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Aquí enviamos la notificación a nuestro backend que maneja emails
    const response = await fetch(
      `${import.meta.env.PUBLIC_API_URL}/notifications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Error sending notification');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to send notification' }),
      { status: 500 }
    );
  }
};
