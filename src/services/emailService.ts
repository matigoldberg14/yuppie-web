// src/services/emailService.ts
import nodemailer from 'nodemailer';

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface BadReviewEmail {
  ownerEmail: string;
  ownerName: string;
  restaurantName: string;
  review: {
    calification: number;
    comment: string;
    typeImprovement: string;
    email: string;
    date: string;
  };
}

export async function sendBadReviewAlert({
  ownerEmail,
  ownerName,
  restaurantName,
  review,
}: BadReviewEmail) {
  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #d32f2f;">⚠️ Alerta de Review Negativa</h1>
      
      <p>Hola ${ownerName},</p>
      
      <p>Se ha recibido una review negativa para <strong>${restaurantName}</strong>.</p>
      
      <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Calificación:</strong> ${review.calification} ⭐</p>
        <p><strong>Área de mejora:</strong> ${review.typeImprovement}</p>
        <p><strong>Comentario:</strong> ${review.comment}</p>
        <p><strong>Email del cliente:</strong> ${review.email}</p>
        <p><strong>Fecha:</strong> ${new Date(
          review.date
        ).toLocaleDateString()}</p>
      </div>
      
      <p>Te recomendamos:</p>
      <ul>
        <li>Revisar el feedback detalladamente</li>
        <li>Contactar al cliente si es posible</li>
        <li>Implementar mejoras basadas en el feedback</li>
      </ul>
      
      <p>Este es un email automático de Yuppie - Sistema de Gestión de Reviews.</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ownerEmail,
    subject: `⚠️ Review Negativa - ${restaurantName}`,
    html: emailTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de alerta enviado exitosamente');
    return true;
  } catch (error) {
    console.error('Error enviando email de alerta:', error);
    return false;
  }
}
