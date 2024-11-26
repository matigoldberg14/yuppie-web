import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createReview } from '../../services/api';
import { useToast } from '../ui/use-toast';
import { z } from 'zod';

const commentSchema = z.object({
  email: z
    .string()
    .email('Por favor, ingresa un email válido')
    .min(1, 'El email es requerido'),
  comment: z
    .string()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(500, 'El comentario no puede exceder los 500 caracteres')
    .refine(
      (value) => !/^\s*$/.test(value),
      'El comentario no puede estar vacío'
    ),
});

type CommentFormData = z.infer<typeof commentSchema>;

type Props = {
  restaurantId: string;
};

export function CommentForm({ restaurantId }: Props) {
  const [formData, setFormData] = useState<CommentFormData>({
    comment: '',
    email: '',
  });
  const [touchedFields, setTouchedFields] = useState<
    Set<keyof CommentFormData>
  >(new Set());
  const [errors, setErrors] = useState<
    Partial<Record<keyof CommentFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const { toast } = useToast();

  // Validación solo para campos tocados
  useEffect(() => {
    const validateField = (field: keyof CommentFormData) => {
      if (!touchedFields.has(field)) return;

      try {
        const fieldSchema = commentSchema.shape[field];
        fieldSchema.parse(formData[field]);
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({
            ...prev,
            [field]: error.errors[0]?.message,
          }));
        }
      }
    };

    const debounceTimeout = setTimeout(() => {
      if (touchedFields.has('email')) validateField('email');
      if (touchedFields.has('comment')) validateField('comment');
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [formData, touchedFields]);

  useEffect(() => {
    setCharCount(formData.comment.length);
  }, [formData.comment]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field: keyof CommentFormData) => {
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos como tocados al intentar enviar
    setTouchedFields(new Set(['email', 'comment']));

    try {
      setIsSubmitting(true);

      // Validar todo el formulario
      const validatedData = commentSchema.parse(formData);

      const typeImprovement = localStorage.getItem('yuppie_improvement');
      const rating = Number(localStorage.getItem('yuppie_rating'));

      if (!rating) {
        throw new Error('No se encontró la calificación');
      }

      await createReview({
        restaurantId,
        calification: rating,
        typeImprovement,
        email: validatedData.email,
        comment: validatedData.comment.trim(),
        googleSent: false,
      });

      localStorage.removeItem('yuppie_improvement');
      localStorage.removeItem('yuppie_rating');

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
            onBlur={() => handleBlur('comment')}
            placeholder="Cuéntanos tu experiencia (mínimo 10 caracteres)"
            className={`
              w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400 
              resize-none h-40 transition-all duration-200
              ${
                touchedFields.has('comment') && errors.comment
                  ? 'border-2 border-red-500'
                  : 'border border-white/10'
              }
              focus:ring-2 focus:ring-white/20 focus:outline-none
            `}
            disabled={isSubmitting}
          />

          <span
            className={`
            absolute bottom-2 right-2 text-sm
            ${charCount > 500 ? 'text-red-400' : 'text-gray-400'}
          `}
          >
            {charCount}/500
          </span>
        </motion.div>

        <AnimatePresence>
          {touchedFields.has('comment') && errors.comment && (
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
          onBlur={() => handleBlur('email')}
          placeholder="Tu email"
          className={`
            w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400
            transition-all duration-200
            ${
              touchedFields.has('email') && errors.email
                ? 'border-2 border-red-500'
                : 'border border-white/10'
            }
            focus:ring-2 focus:ring-white/20 focus:outline-none
          `}
          disabled={isSubmitting}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        />

        <AnimatePresence>
          {touchedFields.has('email') && errors.email && (
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
        disabled={
          isSubmitting ||
          (touchedFields.size > 0 && Object.keys(errors).length > 0)
        }
        className={`
          w-full py-3 px-6 bg-white text-black rounded-full font-medium 
          transition-all duration-200 ease-in-out
          ${
            isSubmitting ||
            (touchedFields.size > 0 && Object.keys(errors).length > 0)
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98]'
          }
        `}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isSubmitting ? (
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Enviando...
          </motion.div>
        ) : (
          'Enviar'
        )}
      </motion.button>
    </motion.form>
  );
}
