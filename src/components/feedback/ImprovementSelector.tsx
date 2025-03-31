// src/components/feedback/ImprovementSelector.tsx
// VERSIÓN CORREGIDA - SIN VERIFICACIÓN

import { motion } from 'framer-motion';
import { useState, useCallback, memo } from 'react';
import { useToast } from '../ui/use-toast';
import { encryptId } from '../../lib/encryption';

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

  // Manejador simplificado - SIN verificación
  const handleSelect = useCallback(
    (improvement: string) => {
      if (isSubmitting) return;

      try {
        setIsSubmitting(true);

        // Verificación básica de rating
        const rating = localStorage.getItem('yuppie_rating');
        if (!rating) {
          throw new Error('No se encontró la calificación');
        }

        // Guardar mejora seleccionada
        localStorage.setItem('yuppie_improvement', improvement);

        // Guardar restaurantId para referencia
        localStorage.setItem('yuppie_restaurant', restaurantDocumentId);

        // Construir URL con empleado si existe
        // Construir URL con empleado si existe
        let targetUrl = nextUrl;
        if (employeeDocumentId) {
          // Verificar si la URL ya usa formato encriptado
          if (nextUrl.includes('?id=') || nextUrl.includes('&id=')) {
            // URL ya está en formato encriptado, añadir empleado encriptado
            const encryptedEmployeeId = encryptId(employeeDocumentId);
            targetUrl = `${nextUrl}${
              nextUrl.includes('?') ? '&' : '?'
            }emp=${encryptedEmployeeId}`;
          } else {
            // URL en formato antiguo, mantener compatibilidad
            targetUrl = `${nextUrl}${
              nextUrl.includes('?') ? '&' : '?'
            }employee=${employeeDocumentId}`;
          }
        }

        // Redirigir sin verificación
        window.location.href = targetUrl;
      } catch (error) {
        console.error('Error seleccionando mejora:', error);
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
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          initial={{ opacity: 0, x: -10 }}
          animate={{
            opacity: 1,
            x: 0,
            transition: {
              delay: Math.min(0.05 * index, 0.2),
              duration: 0.2,
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
