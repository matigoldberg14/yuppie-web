// /Users/Mati/Desktop/yuppie-web/src/components/feedback/ImprovementSelector.tsx
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, memo } from 'react';
import { useToast } from '../ui/use-toast';

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
  nextUrl: string;
};

function ImprovementSelectorComponent({
  restaurantDocumentId,
  nextUrl,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emojisLoaded, setEmojisLoaded] = useState(true); // Optimista por defecto
  const { toast } = useToast();

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

        // Verificación optimizada
        const rating = localStorage.getItem('yuppie_rating');
        const storedRestaurantId = localStorage.getItem('yuppie_restaurant');

        if (!rating) {
          throw new Error('No se encontró la calificación');
        }

        if (storedRestaurantId !== restaurantDocumentId) {
          console.warn('Advertencia: IDs de restaurante no coinciden', {
            stored: storedRestaurantId,
            current: restaurantDocumentId,
          });
          // Intento de recuperación: actualizar el ID almacenado
          localStorage.setItem('yuppie_restaurant', restaurantDocumentId);
        }

        // Guardar mejora seleccionada - No bloqueante
        localStorage.setItem('yuppie_improvement', improvement);

        // Precargar siguiente página para reducir tiempo de carga
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.href = nextUrl;
        preloadLink.as = 'document';
        document.head.appendChild(preloadLink);

        // Navegación optimizada
        const navigationStart = performance.now();

        // Intentar usar navegación moderna si está disponible (para mejor rendimiento)
        if (
          'navigation' in window &&
          typeof (window as any).navigation?.navigate === 'function'
        ) {
          try {
            (window as any).navigation.navigate(nextUrl);
            return; // Salir si la navegación moderna funciona
          } catch (navError) {
            console.warn('Navegación moderna falló, usando método tradicional');
          }
        }

        // Optimización: Delayed redirect para permitir que los eventos de analytics se envíen
        setTimeout(() => {
          window.location.href = nextUrl;
        }, 50); // Pequeño delay para mejor UI feedback
      } catch (error) {
        console.error('Error al seleccionar mejora:', error);
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
    [isSubmitting, restaurantDocumentId, nextUrl, toast]
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
