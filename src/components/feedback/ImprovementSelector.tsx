// /Users/Mati/Desktop/yuppie-web/src/components/feedback/ImprovementSelector.tsx
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, memo } from 'react';
import { useToast } from '../ui/use-toast';
import { checkEmailReviewStatus } from '../../services/api';

// Memoized constantes para evitar recreaciones en cada render
const improvementOptions = [
  { id: 'Atención', label: 'Atención', icon: '🤝', fallbackIcon: '👥' },
  { id: 'Comidas', label: 'Comidas', icon: '🍽️', fallbackIcon: '🍴' },
  { id: 'Bebidas', label: 'Bebidas', icon: '🥤', fallbackIcon: '🥛' },
  { id: 'Ambiente', label: 'Ambiente', icon: '🎵', fallbackIcon: '🏠' },
  { id: 'Otra', label: 'Otra', icon: '✨', fallbackIcon: '+' },
] as const;

type Props = {
  restaurantDocumentId: string;
  employeeDocumentId?: string;
  nextUrl: string;
};

function ImprovementSelectorComponent({
  restaurantDocumentId,
  employeeDocumentId,
  nextUrl,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emojisLoaded, setEmojisLoaded] = useState(true); // Optimista por defecto
  const { toast } = useToast();

  useEffect(() => {
    const verificarOpinionPrevia = async () => {
      try {
        // Verificar si hay un email guardado
        const emailGuardado = localStorage.getItem('yuppie_email');

        if (emailGuardado && restaurantDocumentId) {
          // Mostrar indicador de carga o alguna UI para el usuario
          // mientras se verifica

          // Verificar si este email ya envió una review en las últimas 24 horas
          const estadoEmail = await checkEmailReviewStatus(
            restaurantDocumentId,
            emailGuardado
          );

          if (estadoEmail.hasReviewed) {
            console.log(
              'Usuario ya envió una opinión, redireccionando a thanks con mensaje especial'
            );

            // Guardar un flag para indicar que debe mostrar mensaje de "ya has opinado"
            localStorage.setItem('yuppie_already_reviewed', 'true');

            // Redireccionar a la página de agradecimiento
            window.location.href = '/thanks';
          }
        }
      } catch (error) {
        console.error('Error verificando estado de opinión:', error);
        // No bloqueamos al usuario en caso de error
      }
    };

    // Ejecutar la verificación cuando el componente se monta
    verificarOpinionPrevia();
  }, [restaurantDocumentId]); // Dependencia: restaurantDocumentId

  // Verificar soporte de emojis al montar
  useEffect(() => {
    const checkEmojiSupport = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dibujar emoji de prueba
      ctx.fillText('🤝', -10, -10);
      const support = ctx.getImageData(0, 0, 1, 1).data[3] !== 0;
      setEmojisLoaded(support);
    };

    // Ejecutar de forma no bloqueante
    if (window.requestIdleCallback) {
      window.requestIdleCallback(checkEmojiSupport);
    } else {
      setTimeout(checkEmojiSupport, 100);
    }

    // Precarga de siguiente URL
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = nextUrl;
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [nextUrl]);

  // Optimización: Memoized handler para evitar recreaciones
  const handleSelect = useCallback(
    async (improvement: string) => {
      if (isSubmitting) return;

      try {
        setIsSubmitting(true);

        // Optimized verification
        const rating = localStorage.getItem('yuppie_rating');
        const storedRestaurantId = localStorage.getItem('yuppie_restaurant');

        if (!rating) {
          throw new Error('No se encontró la calificación');
        }

        if (storedRestaurantId !== restaurantDocumentId) {
          console.warn('Warning: Restaurant IDs do not match', {
            stored: storedRestaurantId,
            current: restaurantDocumentId,
          });
          // Recovery attempt: update the stored ID
          localStorage.setItem('yuppie_restaurant', restaurantDocumentId);
        }

        // For non-5-star reviews, we'll check for potential duplicate submissions
        // using a stored email if available
        const storedEmail = localStorage.getItem('yuppie_email');
        if (storedEmail) {
          // Check if this email has already submitted a review for this restaurant in the last 24 hours
          const emailStatus = await checkEmailReviewStatus(
            restaurantDocumentId,
            storedEmail
          );

          if (emailStatus.hasReviewed) {
            throw new Error(
              'Ya has enviado una opinión para este restaurante en las últimas 24 horas. ¡Gracias por tu entusiasmo!'
            );
          }
        }

        // ONLY propagate the employee ID to the next page if available
        // IMPORTANT: We don't permanently store in localStorage, just pass it via URL
        if (employeeDocumentId) {
          // Only use the employee ID for navigation
          const fullNextUrl = `${nextUrl}${
            nextUrl.includes('?') ? '&' : '?'
          }employee=${employeeDocumentId}`;

          // Save selected improvement
          localStorage.setItem('yuppie_improvement', improvement);

          // Redirect with employee ID in URL
          window.location.href = fullNextUrl;
        } else {
          // Save selected improvement
          localStorage.setItem('yuppie_improvement', improvement);

          // Redirect without employee ID
          window.location.href = nextUrl;
        }
      } catch (error) {
        console.error('Error selecting improvement:', error);
        setIsSubmitting(false);
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Error desconocido',
          duration: 3000,
        });
      }
    },
    [isSubmitting, restaurantDocumentId, employeeDocumentId, nextUrl, toast]
  );

  // Renderizado optimizado con menor carga de animación
  return (
    <div className="w-full max-w-md flex flex-col gap-3">
      {improvementOptions.map(({ id, label, icon, fallbackIcon }, index) => (
        <motion.button
          key={id}
          type="button"
          onClick={() => handleSelect(id)}
          disabled={isSubmitting}
          className={`w-full p-4 rounded-lg flex items-center gap-3 
            ${
              isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-white/5 hover:bg-white/10 transition-colors'
            } 
            text-white`}
          whileHover={{ scale: 1.01 }} // Reducido de 1.02 a 1.01
          whileTap={{ scale: 0.99 }} // Menos agresivo, de 0.98 a 0.99
          initial={{ opacity: 0, x: -10 }} // Reducido el desplazamiento inicial
          animate={{
            opacity: 1,
            x: 0,
            transition: {
              delay: Math.min(0.05 * index, 0.2), // Capped max delay
              duration: 0.2, // Velocidad aumentada
            },
          }}
        >
          <span className="text-xl" role="img" aria-label={label}>
            {emojisLoaded ? icon : fallbackIcon}
          </span>
          {label}
        </motion.button>
      ))}

      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center text-white/80 mt-2"
        >
          Procesando...
        </motion.div>
      )}
    </div>
  );
}

// Exportamos versión memoizada para prevenir re-renders innecesarios
export const ImprovementSelector = memo(ImprovementSelectorComponent);
