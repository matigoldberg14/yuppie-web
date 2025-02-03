// src/components/feedback/CommentForm.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/use-toast';
import { z } from 'zod';
import {
  createReview,
  sendLowRatingEmail,
  getRestaurant,
} from '../../services/api';

const commentSchema = z.object({
  email: z.string().email('Por favor, ingresa un email válido'),
  comment: z
    .string()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(500, 'El comentario no puede exceder los 500 caracteres'),
});

type CommentFormData = z.infer<typeof commentSchema>;

type Props = {
  restaurantId: string; // Mantenemos como string aquí
};

export function CommentForm({ restaurantId }: Props) {
  const [formData, setFormData] = useState<CommentFormData>({
    comment: '',
    email: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CommentFormData, string>>
  >({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Validación del formulario
  useEffect(() => {
    try {
      commentSchema.parse(formData);
      setErrors({});
      setIsButtonDisabled(false);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof CommentFormData, string>> = {};
        validationError.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof CommentFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      setIsButtonDisabled(true);
    }
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const validatedData = commentSchema.parse(formData);
      const rating = Number(localStorage.getItem('yuppie_rating'));
      const typeImprovement =
        localStorage.getItem('yuppie_improvement') || undefined;

      if (!rating) {
        throw new Error('No se encontró la calificación');
      }

      const restaurantIdNumber = parseInt(restaurantId, 10);
      if (isNaN(restaurantIdNumber)) {
        throw new Error('ID de restaurante inválido');
      }

      // Crear la review
      await createReview({
        restaurantId: restaurantIdNumber,
        calification: rating,
        typeImprovement: typeImprovement || 'Otra',
        email: validatedData.email,
        comment: validatedData.comment.trim(),
        googleSent: rating === 5,
      });

      // Si la calificación es 1 o 2, enviar email al owner
      if (rating <= 2) {
        // Obtener la información del restaurante
        const restaurant = await getRestaurant(restaurantId);

        if (restaurant && restaurant.owner?.email) {
          await sendLowRatingEmail({
            restaurantId: restaurantIdNumber,
            calification: rating,
            comment: validatedData.comment.trim(),
            email: validatedData.email,
            typeImprovement: typeImprovement || 'Otra',
            ownerEmail: restaurant.owner.email,
            restaurantName: restaurant.name,
          });
        }
      }

      // Limpiar localStorage
      localStorage.removeItem('yuppie_improvement');
      localStorage.removeItem('yuppie_rating');
      localStorage.removeItem('yuppie_restaurant');

      toast({
        title: '¡Gracias por tu comentario!',
        description: 'Tu feedback nos ayuda a mejorar',
        duration: 2000,
      });

      setTimeout(() => {
        window.location.href = '/thanks';
      }, 1500);
    } catch (error) {
      let errorMessage = 'Error desconocido';

      if (error instanceof z.ZodError) {
        errorMessage = error.errors.map((e) => e.message).join('\n');
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });

      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-md flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-2xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Por último ¿Nos quisieras dejar un comentario?
      </motion.h2>

      <div className="flex flex-col gap-2">
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Cuéntanos tu experiencia (mínimo 10 caracteres)"
            className={`w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400 resize-none h-40 transition-all duration-200 ${
              errors.comment
                ? 'border-2 border-red-500'
                : 'border border-white/10'
            } focus:ring-2 focus:ring-white/20 focus:outline-none`}
            disabled={isSubmitting}
          />

          <span
            className={`absolute bottom-2 right-2 text-sm ${
              formData.comment.length > 500 ? 'text-red-400' : 'text-gray-400'
            }`}
          >
            {formData.comment.length}/500
          </span>
        </motion.div>

        <AnimatePresence>
          {errors.comment && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-400 text-sm"
            >
              {errors.comment}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2">
        <motion.input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Tu email"
          className={`w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400 transition-all duration-200 ${
            errors.email ? 'border-2 border-red-500' : 'border border-white/10'
          } focus:ring-2 focus:ring-white/20 focus:outline-none`}
          disabled={isSubmitting}
        />

        <AnimatePresence>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-400 text-sm"
            >
              {errors.email}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        type="submit"
        disabled={isButtonDisabled || isSubmitting}
        className={`w-full py-3 px-6 bg-white text-black rounded-full font-medium transition-all duration-200 ease-in-out ${
          isButtonDisabled || isSubmitting
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </motion.button>
    </motion.form>
  );
}
