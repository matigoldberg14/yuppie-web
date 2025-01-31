// src/components/feedback/ImprovementSelector.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

const improvementOptions = [
  { id: 'Atención', label: 'Atención', icon: '🤝' },
  { id: 'Comidas', label: 'Comidas', icon: '🍽️' },
  { id: 'Bebidas', label: 'Bebidas', icon: '🥤' },
  { id: 'Ambiente', label: 'Ambiente', icon: '🎵' },
  { id: 'Otra', label: 'Otra', icon: '✨' },
] as const;

type Props = {
  restaurantId: string;
  nextUrl: string;
};

export function ImprovementSelector({ restaurantId, nextUrl }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = async (improvement: string) => {
    try {
      setIsSubmitting(true);

      // Verificar que tenemos el rating guardado
      const rating = localStorage.getItem('yuppie_rating');
      const storedRestaurantId = localStorage.getItem('yuppie_restaurant');

      if (!rating) {
        throw new Error('No se encontró la calificación');
      }

      if (storedRestaurantId !== restaurantId) {
        throw new Error('Error de coincidencia de restaurante');
      }

      // Guardar la mejora seleccionada
      localStorage.setItem('yuppie_improvement', improvement);

      // Navegar al siguiente paso
      window.location.href = nextUrl;
    } catch (error) {
      console.error('Error al seleccionar mejora:', error);
      setIsSubmitting(false);

      toast.error(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl text-center text-white font-medium mb-4"
      >
        ¿En qué podríamos mejorar?
      </motion.h2>

      <AnimatePresence mode="sync">
        <div className="flex flex-col gap-2">
          {improvementOptions.map(({ id, label, icon }, index) => (
            <motion.button
              key={id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelect(id)}
              disabled={isSubmitting}
              className={`w-full p-4 rounded-lg flex items-center gap-3 
                ${
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'bg-white/5 hover:bg-white/10 transition-colors'
                } 
                text-white`}
            >
              <span role="img" aria-label={label} className="text-2xl">
                {icon}
              </span>
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </AnimatePresence>

      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white/80"
        >
          Procesando...
        </motion.div>
      )}
    </div>
  );
}
