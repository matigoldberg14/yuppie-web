import { useState } from 'react';
import { Button } from '../Button';
import { submitFeedback } from '../../lib/api';

type Props = {
  restaurantId: string;
  successUrl: string;
};

export function CommentForm({ restaurantId, successUrl }: Props) {
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const rating = Number(localStorage.getItem('yuppie_rating'));
      const improvements = JSON.parse(
        localStorage.getItem('yuppie_improvements') || '[]'
      );

      await submitFeedback({
        restaurantId,
        rating,
        improvements,
        comment: comment.trim(),
        email: email.trim(),
      });

      // Limpiar localStorage
      localStorage.removeItem('yuppie_rating');
      localStorage.removeItem('yuppie_improvements');

      window.location.href = successUrl;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(
        'Hubo un error al enviar tu feedback. Por favor, intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <h2 className="text-xl text-center">
        Por último ¿Nos quisieras dejar un comentario?
      </h2>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentanos aquí."
        className="w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400 resize-none h-40"
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Usuario@mail.com"
        className="w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400"
      />

      <p className="text-sm text-center text-gray-400">
        Puede aplicar una compensación.
      </p>

      <Button onClick={handleSubmit} fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </Button>
    </div>
  );
}
