// /Users/Mati/Desktop/yuppie-web/src/components/feedback/CommentForm.tsx
import { useState, useEffect, useCallback, memo } from 'react';
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

// Schema para validación (optimizado para rendimiento con memoización)
const commentSchema = z.object({
  email: z.string().email('Por favor, ingresa un email válido').optional(),
  comment: z
    .string()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(500, 'El comentario no puede exceder los 500 caracteres'),
});

// Función helper para formatear mensajes de error
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
  restaurantId: string; // ID numérico para API
  restaurantDocumentId: string; // ID del documento para tracking
};

// Opciones de mejora (memoizadas para evitar recreaciones en cada render)
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
  // Estado principal
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
  const [hasInteractedWithEmail, setHasInteractedWithEmail] = useState(false);
  const [improvementType, setImprovementType] = useState<string | null>(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const { toast } = useToast();

  // Verificación optimizada al montar componente
  useEffect(() => {
    try {
      // Verificación de submission previa
      if (restaurantDocumentId) {
        const checkSubmission = () => {
          const hasSubmitted = hasSubmittedReviewToday(restaurantDocumentId);
          if (hasSubmitted) {
            setAlreadySubmitted(true);
            toast({
              variant: 'destructive',
              title: 'Ya has opinado hoy',
              description:
                'Podrás compartir otra opinión en 24 horas. ¡Gracias por tu entusiasmo!',
              duration: 5000,
            });
            setIsButtonDisabled(true);
          }
        };

        // Uso de requestIdleCallback para no bloquear el render
        if (window.requestIdleCallback) {
          window.requestIdleCallback(checkSubmission);
        } else {
          setTimeout(checkSubmission, 50);
        }
      }

      // Obtener tipo de mejora del localStorage
      const storedImprovement = localStorage.getItem('yuppie_improvement');
      setImprovementType(storedImprovement);

      // Si es 'Otra' o no hay tipo, mostrar el textarea
      setShowTextArea(
        storedImprovement === null || storedImprovement === 'Otra'
      );

      // Intentar restaurar email si existe
      const savedEmail = localStorage.getItem('yuppie_email');
      if (savedEmail) {
        setFormData((prev) => ({ ...prev, email: savedEmail }));
      }
    } catch (error) {
      console.error('Error en la inicialización del formulario:', error);
    } finally {
      setIsLoadingInitialData(false);
    }
  }, [restaurantDocumentId, toast]);

  const handleBackToOptions = useCallback(() => {
    // Obtener el parámetro "local" de la URL actual
    const urlParams = new URLSearchParams(window.location.search);
    const localId = urlParams.get('local');

    // Volver a improvement con el mismo parámetro local
    if (localId) {
      window.location.href = `/improvement?local=${localId}`;
    } else {
      window.location.href = '/';
    }
  }, []);

  // Validación optimizada
  useEffect(() => {
    // Omitir validación mientras se carga el estado inicial
    if (isLoadingInitialData) return;

    const validateForm = () => {
      let valid = true;
      const newErrors: { [key in keyof CommentFormData]?: string } = {};

      // Si ya ha enviado una opinión, deshabilitar el botón
      if (alreadySubmitted) {
        valid = false;
      } else if (showTextArea) {
        // Validación del comentario
        if (hasInteractedWithComment) {
          if (formData.comment.trim().length < 10) {
            newErrors.comment =
              'El comentario debe tener al menos 10 caracteres';
            valid = false;
          } else if (formData.comment.trim().length > 500) {
            newErrors.comment =
              'El comentario no puede exceder los 500 caracteres';
            valid = false;
          }
        }

        // Validación del email
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
        // En la sección de opciones, validar selección
        if (!selectedOption) {
          valid = false;
        }

        // Validar email si se ha interactuado y tiene contenido
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
    };

    // Usar requestAnimationFrame para mejorar performance
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(validateForm);
    } else {
      validateForm();
    }
  }, [
    formData,
    selectedOption,
    showTextArea,
    hasInteractedWithComment,
    hasInteractedWithEmail,
    alreadySubmitted,
    isLoadingInitialData,
  ]);

  // Manejadores de eventos (optimizados con useCallback)
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleOptionSelect = useCallback(
    (optionId: string) => {
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
    },
    [selectedOption]
  );

  const handleTextAreaFocus = useCallback(() => {
    setHasInteractedWithComment(true);
  }, []);

  // Envío optimizado del formulario
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      try {
        // Verificar si ya envió una opinión
        if (hasSubmittedReviewToday(restaurantDocumentId)) {
          throw new Error(
            'Ya has compartido tu opinión en las últimas 24 horas'
          );
        }

        setIsSubmitting(true);

        // Construir comentario final según el estado
        let finalComment = '';
        if (showTextArea) {
          finalComment = formData.comment;
        } else if (selectedOption && improvementType) {
          const selectedLabel = improvementOptions[
            improvementType as keyof typeof improvementOptions
          ]?.find((opt) => opt.id === selectedOption)?.label;
          finalComment = `${improvementType} - ${selectedLabel}`;
        }

        if (!finalComment) {
          throw new Error(
            'Por favor, selecciona una opción o escribe un comentario'
          );
        }

        // Obtener calificación
        const rating = Number(localStorage.getItem('yuppie_rating'));
        if (!rating) {
          throw new Error('No se encontró la calificación');
        }

        // Verificar coincidencia de restaurante
        const storedRestaurantId = localStorage.getItem('yuppie_restaurant');
        if (storedRestaurantId !== restaurantDocumentId) {
          // Intento de recuperación: actualizar ID
          localStorage.setItem('yuppie_restaurant', restaurantDocumentId);
        }

        // Validar y convertir IDs
        const restaurantIdNumber = parseInt(restaurantId, 10);
        if (isNaN(restaurantIdNumber)) {
          throw new Error('ID de restaurante inválido');
        }

        // Procesar email
        const emailToSend =
          formData.email.trim() || 'prefirio-no-dar-su-email@nodiosuemail.com';

        // Guardar email si se proporcionó
        if (formData.email.trim()) {
          localStorage.setItem('yuppie_email', formData.email.trim());
        }

        // Crear objeto de review
        const reviewData = {
          restaurantId: restaurantIdNumber,
          calification: rating,
          typeImprovement: improvementType || 'Otra',
          email: emailToSend,
          comment: finalComment.trim(),
          googleSent: rating === 5,
        };

        // Registrar submission primero (para mejor percepción de velocidad)
        recordReviewSubmission(restaurantDocumentId);

        // Iniciar creación de review (no esperamos a que termine)
        const reviewPromise = createReview(reviewData);

        // Procesamiento paralelo: envío de email para calificaciones bajas
        let emailPromise = Promise.resolve();
        if (rating <= 2 && formData.email) {
          emailPromise = (async () => {
            try {
              const apiUrl = import.meta.env.PUBLIC_API_URL;
              if (!apiUrl) throw new Error('URL de API no configurada');

              const fetchUrl = `${apiUrl}/restaurants?populate=owner&filters[id][$eq]=${restaurantId}`;
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
              // No bloqueamos el flujo por un error en el email
            }
          })();
        }

        // Mostrar toast de éxito inmediatamente para mejor UX
        toast({
          title: '¡Gracias por tu comentario!',
          description: 'Tu feedback nos ayuda a mejorar!',
          duration: 2000,
        });

        // Limpieza optimizada
        const cleanup = () => {
          try {
            localStorage.removeItem('yuppie_improvement');
            localStorage.removeItem('yuppie_rating');
            localStorage.removeItem('yuppie_restaurant');
          } catch (cleanError) {
            console.error('Error limpiando localStorage:', cleanError);
          }
        };

        // Esperar a que terminen todas las operaciones asíncronas
        // pero con un timeout máximo para no bloquear la navegación
        Promise.race([
          Promise.all([reviewPromise, emailPromise]),
          new Promise((resolve) => setTimeout(resolve, 2000)), // Máximo 2 segundos de espera
        ]).finally(() => {
          cleanup();

          // Redirección optimizada
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = '/thanks';
          document.head.appendChild(link);

          setTimeout(() => {
            window.location.href = '/thanks';
          }, 500); // Pequeño delay para mejor UX
        });
      } catch (error) {
        const errorMessage = formatErrorMessage(error);

        // Toast más visible y amigable
        toast({
          variant: 'destructive',
          title: '¡Un momento!',
          description: `😊 ${errorMessage}\n\nPuedes dejar una nueva opinión en 24 horas`,
          duration: 10000,
        });

        setIsSubmitting(false);
        setIsButtonDisabled(true);

        // Scroll suave hacia arriba
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Fallback para navegadores que no soportan scrollBehavior
          window.scrollTo(0, 0);
        }
      }
    },
    [
      isSubmitting,
      showTextArea,
      formData,
      selectedOption,
      improvementType,
      restaurantId,
      restaurantDocumentId,
      toast,
    ]
  );

  // Renderizado optimizado con lazy loading de componentes

  // Renderizado para estado "ya enviado"
  if (alreadySubmitted) {
    // Redirección inmediata sin useState ni useEffect
    if (typeof window !== 'undefined') {
      window.location.replace('/thanks');
    }
    // Devuelve un componente vacío o de carga mientras ocurre la redirección
    return null;
  }

  // Pantalla de carga (para mejorar percepción de velocidad)
  if (isLoadingInitialData) {
    return (
      <div className="w-full max-w-md flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-white/10 rounded w-3/4 mx-auto mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-white/10 rounded"></div>
          <div className="h-12 bg-white/10 rounded"></div>
          <div className="h-12 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  // Renderizado principal del formulario
  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-md flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }} // Optimizado: reducido de 0.5 a 0.3
    >
      <motion.h2
        className="text-2xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }} // Optimizado: reducido de 0.2 a 0.1
      >
        {showTextArea
          ? 'Por último ¿Nos quisieras dejar un comentario?'
          : `¿Cuál de estos aspectos de ${improvementType?.toLowerCase()} podríamos mejorar?`}
      </motion.h2>

      {/* Lista de opciones específicas (renderizado condicional) */}
      {!showTextArea && improvementType && improvementType !== 'Otra' && (
        <div className="flex flex-col gap-3">
          {improvementOptions[
            improvementType as keyof typeof improvementOptions
          ]?.map((option, index) => (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => handleOptionSelect(option.id)}
              className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                selectedOption === option.id
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.01 }} // Optimizado: reducido de 1.02 a 1.01
              whileTap={{ scale: 0.99 }} // Optimizado: menos agresivo, de 0.98 a 0.99
              initial={{ opacity: 0, y: 5 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: Math.min(0.05 * index, 0.2) }, // Capped max delay
              }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      )}

      {showTextArea && (
        <div className="flex flex-col gap-2">
          <div className="relative">
            {/* Botón para volver a las opciones */}
            {/* Botón para volver a las opciones - siempre visible */}
            <motion.button
              type="button"
              onClick={handleBackToOptions}
              className="absolute -top-8 left-0 text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FiArrowLeft size={24} />
            </motion.button>
            {/* Textarea optimizado */}
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }} // Optimizado: reducido de 0.3 a 0.1
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

              {/* Contador de caracteres */}
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

            {/* Mensajes de error para comentario */}
            <AnimatePresence>
              {errors.comment && hasInteractedWithComment && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }} // Optimizado: reducido de 0.3 a 0.2
                  className="text-red-400 text-sm"
                >
                  {errors.comment}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Campo de email (común a ambos estados) */}
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
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        />

        {/* Mensaje promocional para email */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-400 italic text-center"
        >
          Dejanos tu email para recibir descuentos exclusivos y recompensas
          especiales
        </motion.p>

        {/* Mensaje de error para email */}
        <AnimatePresence>
          {errors.email && hasInteractedWithEmail && (
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

      {/* Botón de envío optimizado */}
      <motion.button
        type="submit"
        disabled={isButtonDisabled || isSubmitting}
        className={`w-full py-3 px-6 bg-white text-black rounded-full font-medium transition-all duration-200 ease-in-out ${
          isButtonDisabled || isSubmitting
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100 hover:scale-[1.01] active:scale-[0.99]'
        }`}
        whileHover={!isButtonDisabled && !isSubmitting ? { scale: 1.01 } : {}}
        whileTap={!isButtonDisabled && !isSubmitting ? { scale: 0.99 } : {}}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </motion.button>
    </motion.form>
  );
}

// Versión memoizada para prevenir re-renders innecesarios
export default memo(CommentForm);
