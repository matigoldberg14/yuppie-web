import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/use-toast';

const improvementOptions = [
  {
    id: 'Atención',
    label: 'Atención al Cliente',
    icon: '🤝',
    description: 'Servicio, amabilidad y rapidez',
    color: 'from-blue-500/10 to-blue-600/10',
    hoverColor: 'from-blue-500/20 to-blue-600/20',
  },
  {
    id: 'Comidas',
    label: 'Calidad de la Comida',
    icon: '🍽️',
    description: 'Sabor, presentación y temperatura',
    color: 'from-orange-500/10 to-orange-600/10',
    hoverColor: 'from-orange-500/20 to-orange-600/20',
  },
  {
    id: 'Bebidas',
    label: 'Bebidas',
    icon: '🥤',
    description: 'Variedad y calidad de bebidas',
    color: 'from-purple-500/10 to-purple-600/10',
    hoverColor: 'from-purple-500/20 to-purple-600/20',
  },
  {
    id: 'Ambiente',
    label: 'Ambiente del Local',
    icon: '🏠',
    description: 'Música, iluminación y comodidad',
    color: 'from-green-500/10 to-green-600/10',
    hoverColor: 'from-green-500/20 to-green-600/20',
  },
  {
    id: 'Otra',
    label: 'Otro Aspecto',
    icon: '✨',
    description: 'Cuéntanos qué podemos mejorar',
    color: 'from-gray-500/10 to-gray-600/10',
    hoverColor: 'from-gray-500/20 to-gray-600/20',
  },
] as const;

type Props = {
  restaurantId: string;
  nextUrl: string;
};

export function ImprovementSelector({ restaurantId, nextUrl }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSelect = async (improvement: string) => {
    try {
      setSelectedId(improvement);
      setIsSubmitting(true);

      // Efecto visual de selección antes de continuar
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Guardar la selección
      localStorage.setItem('yuppie_improvement', improvement);

      toast({
        title: '¡Gracias por tu feedback!',
        description: 'Un paso más para ayudarnos a mejorar',
        duration: 1500,
      });

      // Redireccionar después de la animación y el toast
      setTimeout(() => {
        window.location.href = nextUrl;
      }, 1000);
    } catch (error) {
      console.error('Error al procesar selección:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Hubo un problema al procesar tu selección. Por favor, intenta nuevamente.',
      });
      setIsSubmitting(false);
      setSelectedId(null);
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
        className="text-2xl text-center text-white font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        ¿En qué podríamos mejorar?
      </motion.h2>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="wait">
          {improvementOptions.map(
            ({ id, label, icon, description, color, hoverColor }, index) => (
              <motion.button
                key={id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !isSubmitting && handleSelect(id)}
                disabled={isSubmitting}
                className={`
                relative w-full p-4 rounded-xl text-left
                bg-gradient-to-r ${color}
                hover:bg-gradient-to-r ${hoverColor}
                border border-white/10
                transition-all duration-200
                group
                ${
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }
                ${selectedId === id ? 'ring-2 ring-white/50' : ''}
              `}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {icon}
                  </span>
                  <div>
                    <h3 className="font-medium text-white mb-1">{label}</h3>
                    <p className="text-sm text-white/70">{description}</p>
                  </div>
                </div>

                {/* Indicador de selección */}
                {selectedId === id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
                  >
                    ✓
                  </motion.div>
                )}

                {/* Ripple effect on click */}
                <motion.div
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={
                    selectedId === id
                      ? { scale: 2, opacity: 0 }
                      : { scale: 0, opacity: 0.5 }
                  }
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-white/20 rounded-xl pointer-events-none"
                />
              </motion.button>
            )
          )}
        </AnimatePresence>
      </div>

      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white/80 mt-4"
        >
          <span className="inline-block animate-spin mr-2">⚪</span>
          Procesando tu selección...
        </motion.div>
      )}
    </motion.div>
  );
}
