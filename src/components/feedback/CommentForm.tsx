import { useState, useEffect } from 'react';
import { createReview } from '../../services/api';
import {
  validateReviewData,
  isValidEmail,
  isValidComment,
} from '../../utils/validation';

type Props = {
  restaurantId: string;
  successUrl: string;
};

export function CommentForm({ restaurantId, successUrl }: Props) {
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationState, setValidationState] = useState({
    emailValid: true,
    commentValid: true,
  });

  useEffect(() => {
    // Validación en tiempo real
    setValidationState({
      emailValid: email === '' || isValidEmail(email),
      commentValid: comment === '' || isValidComment(comment),
    });
  }, [email, comment]);

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSubmitting(true);

      const typeImprovement = localStorage.getItem('yuppie_improvement');
      const rating = Number(localStorage.getItem('yuppie_rating'));

      try {
        validateReviewData({
          email,
          comment,
          typeImprovement,
          calification: rating,
        });
      } catch (validationError) {
        if (validationError instanceof Error) {
          setError(validationError.message);
          return;
        }
      }

      await createReview({
        restaurantId,
        calification: rating,
        typeImprovement,
        email,
        comment: comment.trim(),
        googleSent: false,
      });

      localStorage.removeItem('yuppie_improvement');
      localStorage.removeItem('yuppie_rating');
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
          {error.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comentanos aquí (mínimo 10 caracteres)"
          className={`w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400 resize-none h-40 
            ${!validationState.commentValid ? 'border-2 border-red-500' : ''}`}
          required
        />
        {!validationState.commentValid && (
          <p className="text-red-400 text-sm">
            El comentario debe tener al menos 10 caracteres
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          className={`w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400
            ${!validationState.emailValid ? 'border-2 border-red-500' : ''}`}
          required
        />
        {!validationState.emailValid && (
          <p className="text-red-400 text-sm">
            Por favor, ingresa un email válido
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={
          isSubmitting ||
          !validationState.emailValid ||
          !validationState.commentValid ||
          !email ||
          !comment.trim()
        }
        className="w-full py-3 px-6 bg-white text-black rounded-full font-medium 
          hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 ease-in-out"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">⚪</span>
            Enviando...
          </span>
        ) : (
          'Enviar'
        )}
      </button>
    </div>
  );
}
