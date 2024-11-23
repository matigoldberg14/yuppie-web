import { useState } from 'react';
import { createReview } from '../../services/api';

type Props = {
  restaurantId: string;
  successUrl: string;
};

export function CommentForm({ restaurantId, successUrl }: Props) {
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSubmitting(true);

      const typeImprovement = localStorage.getItem('yuppie_improvement');
      console.log('Attempting to submit:', {
        restaurantId,
        typeImprovement,
        email,
        comment,
      });

      if (!typeImprovement) {
        throw new Error('Por favor, selecciona qué podemos mejorar');
      }

      await createReview({
        restaurantId,
        typeImprovement,
        email,
        comment: comment.trim(),
      });

      localStorage.removeItem('yuppie_improvement');
      window.location.href = successUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error submitting review:', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <h2 className="text-xl text-center">
        Por último ¿Nos quisieras dejar un comentario?
      </h2>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentanos aquí."
        className="w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400 resize-none h-40"
        required
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu email"
        className="w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400"
        required
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !email || !comment.trim()}
        className="w-full py-3 px-6 bg-white text-black rounded-full font-medium hover:bg-gray-100 disabled:opacity-50"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </button>
    </div>
  );
}
