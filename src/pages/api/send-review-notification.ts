// src/pages/api/send-review-notification.ts
import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const post: APIRoute = async ({ request }) => {
  const data = await request.json();

  try {
    // Primero obtener los datos del restaurante
    const restaurantResponse = await fetch(
      `${import.meta.env.PUBLIC_API_URL}/restaurants/${
        data.restaurantId
      }?populate=owner`
    );

    if (!restaurantResponse.ok) {
      throw new Error('Error fetching restaurant data');
    }

    const restaurantData = await restaurantResponse.json();
    const owner = restaurantData.data.owner;
    const restaurantName = restaurantData.data.name;

    // Configurar el email
    const emailTemplate = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Alerta de Review Negativa</h1>
          <p>Restaurante: ${restaurantName}</p>
          <p>Calificación: ${data.calification}</p>
          <p>Comentario: ${data.comment}</p>
          <p>Email del cliente: ${data.email}</p>
          <p>Área de mejora: ${data.typeImprovement}</p>
        </div>
      `;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: owner.email,
      subject: `⚠️ Review Negativa - ${restaurantName}`,
      html: emailTemplate,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Error sending notification',
      }),
      { status: 500 }
    );
  }
};
