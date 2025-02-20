// /Users/Mati/Desktop/yuppie-web/src/components/feedback/ImprovementSelector.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useToast } from '../ui/use-toast';

const improvementOptions = [
  { id: 'Atención', label: 'Atención', icon: '🤝' },
  { id: 'Comidas', label: 'Comidas', icon: '🍽️' },
  { id: 'Bebidas', label: 'Bebidas', icon: '🥤' },
  { id: 'Ambiente', label: 'Ambiente', icon: '🎵' },
  { id: 'Otra', label: 'Otra', icon: '✨' },
] as const;

type Props = {
  restaurantDocumentId: string;
  nextUrl: string;
};

export function ImprovementSelector({ restaurantDocumentId, nextUrl }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSelect = async (improvement: string) => {
    try {
      setIsSubmitting(true);

      // Verificar que tenemos el rating guardado
      const rating = localStorage.getItem('yuppie_rating');
      const storedRestaurantId = localStorage.getItem('yuppie_restaurant');
      console.log(
        'ImprovementSelector -> storedRestaurantId:',
        storedRestaurantId
      );
      console.log(
        'ImprovementSelector -> prop restaurantDocumentId:',
        restaurantDocumentId
      );

      if (!rating) {
        throw new Error('No se encontró la calificación');
      }

      // Comparamos los documentIds como strings (no como números)
      if (storedRestaurantId !== restaurantDocumentId) {
        throw new Error('Error de coincidencia de restaurante');
      }

      // Guardar la mejora seleccionada
      localStorage.setItem('yuppie_improvement', improvement);

      // Navegar al siguiente paso
      window.location.href = nextUrl;
    } catch (error) {
      console.error('Error al seleccionar mejora:', error);
      setIsSubmitting(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  return (
    <motion.div
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
        ¿En qué podríamos mejorar?
      </motion.h2>

      <div className="flex flex-col gap-3">
        {improvementOptions.map(({ id, label, icon }, index) => (
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { delay: index * 0.1 },
            }}
          >
            <span className="text-xl">{icon}</span>
            {label}
          </motion.button>
        ))}
      </div>

      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white/80"
        >
          Procesando...
        </motion.div>
      )}
    </motion.div>
  );
}
