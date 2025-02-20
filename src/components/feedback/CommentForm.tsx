// /Users/Mati/Desktop/yuppie-web/src/components/feedback/CommentForm.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createReview } from '../../services/api';
import { useToast } from '../ui/use-toast';
import { z } from 'zod';
import emailjs from '@emailjs/browser';
import { FiArrowLeft } from 'react-icons/fi';
import {
  hasSubmittedReviewToday,
  recordReviewSubmission,
} from '../../utils/reviewLimiter';

const commentSchema = z.object({
  email: z.string().email('Por favor, ingresa un email válido').optional(),
  comment: z
    .string()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(500, 'El comentario no puede exceder los 500 caracteres'),
});

const formatErrorMessage = (error: unknown): string => {
  if (error instanceof z.ZodError) {
    return error.errors.map((e) => e.message).join('\n');
  }

  if (error instanceof Error) {
    // Personalizar mensajes específicos
    if (error.message.includes('24 horas')) {
      return '¡Ups! Ya has compartido tu opinión hoy. ¡Gracias por tu entusiasmo! Te invitamos a volver mañana para contarnos sobre una nueva experiencia.';
    }
    return error.message;
  }

  return 'Error desconocido al procesar tu solicitud';
};
type CommentFormData = {
  email: string;
  comment: string;
};

type Props = {
  // Cambiamos para usar el documentId estable
  restaurantId: string; // ID numérico para API
  restaurantDocumentId: string; // ID del documento para tracking
};

type CreateReviewInput = {
  restaurantId: number;
  calification: number;
  typeImprovement: string;
  email: string;
  comment: string;
  googleSent: boolean;
};

const improvementOptions = {
  Bebidas: [
    { id: 'temperatura', label: '🌡️Temperatura inadecuada' },
    { id: 'variedad', label: '🥤Poca variedad' },
    { id: 'precio', label: '💵Precio elevado' },
    { id: 'calidad', label: '🍸Calidad de las bebidas' },
    { id: 'otro', label: '✨Otro' },
  ],
  Comidas: [
    { id: 'temperatura', label: '🌡️Temperatura inadecuada' },
    { id: 'sabor', label: '🤷‍♂️Sabor no cumplió expectativas' },
    { id: 'porcion', label: '🤏Tamaño de las porciones' },
    { id: 'presentacion', label: '🍽️Presentación del plato' },
    { id: 'otro', label: '✨Otro' },
  ],
  Atención: [
    { id: 'tiempo', label: '⌛️Tiempo de espera muy largo' },
    { id: 'amabilidad', label: '👩‍💼Falta de amabilidad del personal' },
    { id: 'pedido', label: '📝Errores en el pedido' },
    { id: 'disponibilidad', label: '🤵‍♂️Poca disponibilidad del personal' },
    { id: 'otro', label: '✨Otro' },
  ],
  Ambiente: [
    { id: 'ruido', label: '🔊Nivel de ruido elevado' },
    { id: 'temperatura', label: '🌡️Temperatura del local' },
    { id: 'limpieza', label: '🧹Limpieza del local' },
    { id: 'comodidad', label: '🪑Comodidad del mobiliario' },
    { id: 'otro', label: '✨Otro' },
  ],
} as const;

export function CommentForm({ restaurantId, restaurantDocumentId }: Props) {
  const [formData, setFormData] = useState<CommentFormData>({
    comment: '',
    email: '',
  });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showTextArea, setShowTextArea] = useState(false);
  const [errors, setErrors] = useState<{
    [key in keyof CommentFormData]?: string;
  }>({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [hasInteractedWithComment, setHasInteractedWithComment] =
    useState(false);
  const { toast } = useToast();
  const [improvementType, setImprovementType] = useState<string | null>(null);
  const [hasInteractedWithEmail, setHasInteractedWithEmail] = useState(false);

  useEffect(() => {
    // Verificar si ya se envió una opinión usando el documentId
    if (restaurantDocumentId) {
      const hasSubmitted = hasSubmittedReviewToday(restaurantDocumentId);
      setAlreadySubmitted(hasSubmitted);

      if (hasSubmitted) {
        toast({
          variant: 'destructive',
          title: 'Ya has opinado hoy',
          description:
            'Podrás compartir otra opinión en 24 horas. ¡Gracias por tu entusiasmo!',
          duration: 5000,
        });
        setIsButtonDisabled(true);
      }
    }
  }, [restaurantDocumentId, toast]);

  useEffect(() => {
    // Obtener el tipo de mejora del localStorage al montar el componente
    const storedImprovement = localStorage.getItem('yuppie_improvement');
    setImprovementType(storedImprovement);

    // Si es 'Otra' o no hay tipo, mostrar el textarea
    setShowTextArea(storedImprovement === null || storedImprovement === 'Otra');
  }, []);

  useEffect(() => {
    let valid = true;
    const newErrors: { [key in keyof CommentFormData]?: string } = {};

    // Si ya ha enviado una opinión, deshabilitar el botón
    if (alreadySubmitted) {
      valid = false;
    } else if (showTextArea) {
      // Validación del comentario (solo si el usuario ya interactuó con el textarea)
      if (hasInteractedWithComment) {
        if (formData.comment.trim().length < 10) {
          newErrors.comment = 'El comentario debe tener al menos 10 caracteres';
          valid = false;
        } else if (formData.comment.trim().length > 500) {
          newErrors.comment =
            'El comentario no puede exceder los 500 caracteres';
          valid = false;
        }
      }

      // Validación del email: se valida solo si hay contenido en el input
      if (hasInteractedWithEmail && formData.email.trim()) {
        try {
          z.string()
            .email('Por favor, ingresa un email válido')
            .parse(formData.email);
        } catch (error) {
          if (error instanceof z.ZodError) {
            newErrors.email = error.errors[0].message;
            valid = false;
          }
        }
      }
    } else {
      // En la sección de opciones, se requiere que se haya seleccionado una opción
      if (!selectedOption) {
        valid = false;
      }

      // Validación del email: se valida solo si hay contenido en el input
      if (hasInteractedWithEmail && formData.email.trim()) {
        try {
          z.string()
            .email('Por favor, ingresa un email válido')
            .parse(formData.email);
        } catch (error) {
          if (error instanceof z.ZodError) {
            newErrors.email = error.errors[0].message;
            valid = false;
          }
        }
      }
    }

    setErrors(newErrors);
    setIsButtonDisabled(!valid);
  }, [
    formData,
    selectedOption,
    showTextArea,
    hasInteractedWithComment,
    hasInteractedWithEmail,
    alreadySubmitted,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionSelect = (optionId: string) => {
    if (optionId === selectedOption) {
      setSelectedOption(null);
      return;
    }

    if (optionId === 'otro') {
      setShowTextArea(true);
      setSelectedOption(null);
    } else {
      setSelectedOption(optionId);
      setShowTextArea(false);
    }
  };

  const handleTextAreaFocus = () => {
    setHasInteractedWithComment(true);
  };

  const handleBackToOptions = () => {
    setShowTextArea(false);
    setSelectedOption(null);
    setFormData((prev) => ({ ...prev, comment: '' }));
    setHasInteractedWithComment(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Verificar si ya envió una opinión usando el documentId
      if (hasSubmittedReviewToday(restaurantDocumentId)) {
        throw new Error('Ya has compartido tu opinión en las últimas 24 horas');
      }

      setIsSubmitting(true);

      let finalComment = '';
      if (showTextArea) {
        finalComment = formData.comment;
      } else if (selectedOption && improvementType) {
        const selectedLabel = improvementOptions[
          improvementType as keyof typeof improvementOptions
        ].find((opt) => opt.id === selectedOption)?.label;
        finalComment = `${improvementType} - ${selectedLabel}`;
      }

      if (!finalComment) {
        throw new Error(
          'Por favor, selecciona una opción o escribe un comentario'
        );
      }

      const rating = Number(localStorage.getItem('yuppie_rating'));
      if (!rating) {
        throw new Error('No se encontró la calificación');
      }

      // Verificar que el restaurante almacenado coincide con el actual
      const storedRestaurantId = localStorage.getItem('yuppie_restaurant');
      if (storedRestaurantId !== restaurantDocumentId) {
        throw new Error('Error de coincidencia de restaurante');
      }

      const restaurantIdNumber = parseInt(restaurantId, 10);
      if (isNaN(restaurantIdNumber)) {
        throw new Error('ID de restaurante inválido');
      }

      const emailToSend =
        formData.email.trim() || 'prefirio-no-dar-su-email@nodiosuemail.com';

      await createReview({
        restaurantId: restaurantIdNumber,
        calification: rating,
        typeImprovement: improvementType || 'Otra',
        email: emailToSend,
        comment: finalComment.trim(),
        googleSent: rating === 5,
      });

      // Registrar la submission con el documentId
      recordReviewSubmission(restaurantDocumentId);

      // Solo intentamos enviar el email si hay uno proporcionado
      if (rating <= 2 && formData.email) {
        try {
          const fetchUrl = `${
            import.meta.env.PUBLIC_API_URL
          }/restaurants?populate=owner&filters[id][$eq]=${restaurantId}`;
          const response = await fetch(fetchUrl);
          const data = await response.json();
          const ownerEmail = data.data[0]?.owner?.email;

          if (ownerEmail) {
            await emailjs.send(
              'service_kovjo5m',
              'template_v2s559p',
              {
                to_email: ownerEmail,
                comment: finalComment.trim(),
                rating: rating,
                improvement_type: improvementType || 'Otra',
                customer_email: formData.email,
              },
              '3wONTqDb8Fwtqf1P0'
            );
          }
        } catch (emailError) {
          console.error('Error al enviar email:', emailError);
        }
      }

      localStorage.removeItem('yuppie_improvement');
      localStorage.removeItem('yuppie_rating');
      localStorage.removeItem('yuppie_restaurant');

      toast({
        title: '¡Gracias por tu comentario!',
        description: 'Tu feedback nos ayuda a mejorar!',
        duration: 2000,
      });

      setTimeout(() => {
        window.location.href = '/thanks';
      }, 1500);
    } catch (error) {
      const errorMessage = formatErrorMessage(error);

      // Toast más visible y amigable
      toast({
        variant: 'destructive',
        title: '¡Un momento!',
        description: `😊 ${errorMessage}\n\nPuedes dejar una nueva opinión en 24 horas`,
        duration: 10000, // 10 segundos para que puedan leerlo bien
      });

      // Deshabilitar el botón de submit y mostrar mensaje claro
      setIsSubmitting(false);
      setIsButtonDisabled(true);

      // Hacer scroll hacia arriba suavemente para asegurar que vean el mensaje
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Si ya envió una opinión, mostrar un mensaje amigable
  if (alreadySubmitted) {
    return (
      <motion.div
        className="w-full max-w-md flex flex-col items-center gap-4 p-8 bg-white/10 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-medium text-white text-center"
        >
          ¡Gracias por compartir tu opinión hoy!
        </motion.h2>
        <p className="text-white text-center">
          Valoramos mucho tu feedback. Vuelve mañana para contarnos sobre una
          nueva experiencia.
        </p>
      </motion.div>
    );
  }

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
        {showTextArea
          ? 'Por último ¿Nos quisieras dejar un comentario?'
          : `¿Cuál de estos aspectos de ${improvementType?.toLowerCase()} podríamos mejorar?`}
      </motion.h2>

      {!showTextArea && improvementType && improvementType !== 'Otra' && (
        <div className="flex flex-col gap-3">
          {improvementOptions[
            improvementType as keyof typeof improvementOptions
          ]?.map((option) => (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => handleOptionSelect(option.id)}
              className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                selectedOption === option.id
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      )}

      {showTextArea && (
        <div className="flex flex-col gap-2">
          <div className="relative">
            {improvementType && improvementType !== 'Otra' && (
              <motion.button
                type="button"
                onClick={handleBackToOptions}
                className="absolute -top-8 left-0 text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FiArrowLeft size={24} />
              </motion.button>
            )}
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
                onFocus={handleTextAreaFocus}
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
                  formData.comment.length > 500
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}
              >
                {formData.comment.length}/500
              </span>
            </motion.div>

            <AnimatePresence>
              {errors.comment && hasInteractedWithComment && (
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
        </div>
      )}

      <div className="flex flex-col gap-2">
        <motion.input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onFocus={() => setHasInteractedWithEmail(true)}
          placeholder="Tu email (opcional)*"
          className={`w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400 transition-all duration-200 ${
            errors.email ? 'border-2 border-red-500' : 'border border-white/10'
          } focus:ring-2 focus:ring-white/20 focus:outline-none`}
          disabled={isSubmitting}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-400 italic text-center"
        >
          Dejanos tu email para recibir descuentos exclusivos y recompensas
          especiales
        </motion.p>

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
