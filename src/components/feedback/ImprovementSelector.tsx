import { motion, AnimatePresence } from 'framer-motion';

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
  const handleSelect = (improvement: string) => {
    localStorage.setItem('yuppie_improvement', improvement);
    window.location.href = nextUrl;
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
              className="w-full p-4 rounded-lg flex items-center gap-3 
                bg-white/5 hover:bg-white/10 transition-colors text-white"
            >
              <span role="img" aria-label={label} className="text-2xl">
                {icon}
              </span>
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
