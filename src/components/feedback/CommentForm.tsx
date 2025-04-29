// src/components/feedback/CommentForm.tsx
import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getEmployeeNumericId,
  checkEmailReviewStatus,
  getRestaurantNumericId,
} from '../../services/api';
import { useToast } from '../ui/use-toast';
import { z } from 'zod';
import { FiArrowLeft } from 'react-icons/fi';
import {
  hasSubmittedReviewToday,
  recordReviewSubmission,
} from '../../utils/reviewLimiter';

// Schema para validación (optimizado para rendimiento con memoización)
const commentSchema = z.object({
  email: z.string().email('Por favor, ingresa un email válido'),
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
  employeeDocumentId?: string;
  // Nuevos parámetros para URLs amigables
  employeeId?: number | null;
  nextUrl?: string;
  useNewUrlFormat?: boolean;
  restaurantSlug?: string;
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

export function CommentForm({
  restaurantId,
  restaurantDocumentId,
  employeeDocumentId,
  employeeId,
  nextUrl,
  useNewUrlFormat,
  restaurantSlug,
}: Props) {
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

  // Evento especial para procesar la tecla Delete/Backspace
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Permitir que la tecla Delete/Backspace funcione normalmente
        // El cambio se capturará en el evento onChange
        // No es necesario hacer nada especial aquí
      }
    },
    []
  );

  const cleanupAfterSubmit = () => {
    try {
      // Conservamos solo el email para comodidad del usuario
      const userEmail = formData.email.trim();

      // Limpiamos todos los demás datos
      const keysToClean = [
        'yuppie_rating',
        'yuppie_improvement',
        'yuppie_employee',
        'emergency_review_data',
      ];

      keysToClean.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error(`Error al eliminar ${key}:`, e);
        }
      });

      // Guardamos solo el email para futuras reviews
      localStorage.setItem('yuppie_email', userEmail);

      console.log('Datos de review limpiados correctamente después del envío');
    } catch (error) {
      console.error('Error al limpiar datos después del envío:', error);
      // No fallamos si hay error en la limpieza
    }
  };

  // Verificar si hay una discrepancia entre el estado y el valor del input
  useEffect(() => {
    // Este efecto se ejecuta para garantizar que el DOM refleje correctamente el estado
    const emailInput = document.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement;
    if (emailInput && emailInput.value !== formData.email) {
      emailInput.value = formData.email;
    }
  }, [formData.email]);

  // Función para limpiar completamente el email
  const clearEmail = useCallback(() => {
    // Limpiar el campo de forma directa sin usar el estado anterior
    setFormData((prev) => {
      const newData = { ...prev };
      newData.email = '';
      return newData;
    });

    // Eliminar también del localStorage
    try {
      localStorage.removeItem('yuppie_email');
    } catch (error) {
      console.error('Error al eliminar email del localStorage:', error);
    }

    // Asegurarnos de que el campo se marque como interactuado
    setHasInteractedWithEmail(true);

    // Dar foco al campo para que el usuario pueda comenzar a escribir inmediatamente
    setTimeout(() => {
      const emailInput = document.querySelector(
        'input[name="email"]'
      ) as HTMLInputElement;
      if (emailInput) {
        emailInput.focus();
      }
    }, 10);
  }, []);

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

      // Verificar si hay ID de empleado en localStorage (propagado desde páginas anteriores)
      const storedEmployeeId = localStorage.getItem('yuppie_employee');

      // Si tenemos employeeDocumentId en props pero no en localStorage, guardarlo
      if (
        employeeDocumentId &&
        (!storedEmployeeId || storedEmployeeId !== employeeDocumentId)
      ) {
        localStorage.setItem('yuppie_employee', employeeDocumentId);
      }
    } catch (error) {
      console.error('Error en la inicialización del formulario:', error);
    } finally {
      setIsLoadingInitialData(false);
    }
  }, [restaurantDocumentId, employeeDocumentId, toast]);

  const handleBackToOptions = useCallback(() => {
    if (useNewUrlFormat && restaurantSlug) {
      // Construir URL en formato amigable para improvement
      let url = `/${restaurantSlug}?a=improvement`;

      // Añadir ID de empleado si existe
      if (employeeId) {
        url += `&e=${employeeId}`;
      }

      // Redirigir a la URL amigable
      window.location.href = url;
    } else {
      // Formato antiguo - Obtener los parámetros de la URL actual
      const urlParams = new URLSearchParams(window.location.search);
      const localId = urlParams.get('local');
      const employeeIdParam = urlParams.get('employee');

      // Construir la URL con parámetros
      if (localId) {
        let redirectUrl = `/improvement?local=${localId}`;
        if (employeeIdParam) {
          redirectUrl += `&employee=${employeeIdParam}`;
        }
        window.location.href = redirectUrl;
      } else {
        window.location.href = '/';
      }
    }
  }, [useNewUrlFormat, restaurantSlug, employeeId]);

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

        // Validación del email (obligatorio, pero solo mostrar error después de interacción)
        if (hasInteractedWithEmail) {
          if (!formData.email.trim()) {
            newErrors.email = 'El email es obligatorio';
            valid = false;
          } else {
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
          // Email vacío sin interacción - botón deshabilitado pero sin mensaje de error
          if (!formData.email.trim()) {
            valid = false;
          }
        }
      } else {
        // En la sección de opciones, validar selección
        if (!selectedOption) {
          valid = false;
        }

        // Validar email (ahora obligatorio, pero solo mostrar error después de interacción)
        if (hasInteractedWithEmail) {
          if (!formData.email.trim()) {
            newErrors.email = 'El email es obligatorio';
            valid = false;
          } else {
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
          // Email vacío sin interacción - botón deshabilitado pero sin mensaje de error
          if (!formData.email.trim()) {
            valid = false;
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

      // Actualización directa del valor sin dependencias del valor anterior
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Marcar como interactuado cuando se modifica el valor
      if (name === 'email') {
        setHasInteractedWithEmail(true);
      } else if (name === 'comment') {
        setHasInteractedWithComment(true);
      }
    },
    []
  );

  const handleOptionSelect = useCallback(
    (optionId: string) => {
      if (optionId === selectedOption) {
        setSelectedOption(null);
        return;
      }

      console.log(
        'Click en opción:',
        optionId,
        'ShowTextArea antes:',
        showTextArea
      );

      if (optionId === 'otro') {
        // Actualizar ambos estados necesarios para mostrar el textarea
        setShowTextArea(true);
        // Importante: actualizar también el improvementType para que el renderizado condicional funcione
        setImprovementType('Otra'); // Con mayúscula como se espera en la condición de renderizado
        setSelectedOption(null);

        // Actualizar localStorage para mantener consistencia en toda la aplicación
        localStorage.setItem('yuppie_improvement', 'Otra');

        console.log('Estados actualizados:', {
          showTextArea: true,
          improvementType: 'Otra',
          selectedOption: null,
        });
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

  const handleEmailFocus = useCallback(() => {
    // No marcamos inmediatamente como interactuado al recibir el foco
    // Solo lo marcaremos cuando haya cambios o cuando pierda el foco
  }, []);

  const handleEmailBlur = useCallback(() => {
    // Al perder el foco, ahora sí marcamos como interactuado para validar
    setHasInteractedWithEmail(true);
  }, []);

  // Envío optimizado del formulario
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      try {
        setIsSubmitting(true);

        // Validación básica de campos
        if (!formData.email.trim()) {
          throw new Error('El email es obligatorio');
        }

        if (showTextArea && !formData.comment.trim()) {
          throw new Error('Por favor escribe un comentario');
        }

        // Obtener rating
        const rating = Number(localStorage.getItem('yuppie_rating'));
        if (!rating) {
          throw new Error('No se encontró la calificación');
        }

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

        // VERIFICACIÓN: Consultar a la BDD si este email ya envió una review hoy
        const emailStatus = await checkEmailReviewStatus(
          restaurantDocumentId,
          formData.email.trim()
        );

        if (emailStatus.hasReviewed) {
          console.log(
            'El email ya envió una review, redirigiendo a página de gracias'
          );
          cleanupAfterSubmit();

          // Redirigir según el formato de URL
          if (useNewUrlFormat && nextUrl) {
            // URL amigable con parámetro already
            const alreadyUrl = nextUrl.includes('?')
              ? `${nextUrl}&already=true`
              : `${nextUrl}?already=true`;
            window.location.href = alreadyUrl;
          } else {
            // URL antigua
            window.location.href = '/thanks?already=true';
          }
          return;
        }

        // SOLUCIÓN: Obtener el ID numérico actualizado del restaurante usando el documentId
        console.log(
          'Obteniendo ID numérico actualizado para restaurante:',
          restaurantDocumentId
        );
        let restaurantIdNumber;

        try {
          // Usar la función getRestaurantNumericId para obtener el ID numérico actual
          restaurantIdNumber = await getRestaurantNumericId(
            restaurantDocumentId
          );

          if (!restaurantIdNumber) {
            console.error(
              'No se pudo obtener ID numérico para:',
              restaurantDocumentId
            );
            throw new Error('No se pudo obtener información del restaurante');
          }

          console.log('ID numérico actualizado obtenido:', restaurantIdNumber);
        } catch (idError) {
          console.error('Error obteniendo ID numérico actualizado:', idError);
          throw new Error('Error al obtener información del restaurante');
        }

        // Obtener ID de empleado (usando diferentes fuentes)
        let finalEmployeeId: number | undefined;

        // Prioridad 1: employeeId pasado directamente como prop
        if (employeeId) {
          finalEmployeeId = employeeId;
        }
        // Prioridad 2: employeeDocumentId almacenado en localStorage
        else {
          const storedEmployeeId = localStorage.getItem('yuppie_employee');
          if (storedEmployeeId) {
            try {
              const numericEmployeeId = await getEmployeeNumericId(
                storedEmployeeId
              );
              if (numericEmployeeId) {
                finalEmployeeId = numericEmployeeId;
              }
            } catch (err) {
              console.error('Error obteniendo ID numérico del empleado:', err);
            }
          }
        }

        // Crear objeto para enviar a la API
        const reviewData = {
          data: {
            restaurant: restaurantIdNumber, // Usamos el ID actualizado
            calification: rating,
            typeImprovement: improvementType || 'Otra',
            email: formData.email.trim(),
            comment: finalComment.trim(),
            googleSent: rating === 5,
            date: new Date().toISOString(),
          },
        };

        // Añadir empleado si existe
        if (finalEmployeeId) {
          (reviewData.data as any).employee = finalEmployeeId;
        }

        console.log('Enviando review a la API:', reviewData);

        // Enviar review directamente a la API
        const responseApi = await fetch(
          `${import.meta.env.PUBLIC_API_URL}/reviews`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
          }
        );

        if (!responseApi.ok) {
          const errorText = await responseApi.text();
          console.error('Error al enviar review a la API:', errorText);
          throw new Error('Error al enviar tu opinión');
        }

        console.log('Review enviada exitosamente a la API');

        // Resto del código igual...

        // Guardar email para futura referencia
        localStorage.setItem('yuppie_email', formData.email.trim());

        toast({
          title: '¡Gracias por tu comentario!',
          description: 'Tu feedback nos ayuda a mejorar!',
          duration: 2000,
        });

        cleanupAfterSubmit();

        // Redirigir según el formato de URL
        if (useNewUrlFormat && nextUrl) {
          // URL amigable
          window.location.href = nextUrl;
        } else {
          // URL antigua
          window.location.href = '/thanks';
        }
      } catch (error) {
        const errorMessage = formatErrorMessage(error);

        // Toast más visible y amigable
        toast({
          variant: 'destructive',
          title: '¡Un momento!',
          description: `😊 ${errorMessage}`,
          duration: 8000,
        });

        setIsSubmitting(false);
        setIsButtonDisabled(true);
      }
    },
    [
      isSubmitting,
      showTextArea,
      formData,
      selectedOption,
      improvementType,
      restaurantId,
      restaurantDocumentId, // Ahora usamos principalmente el documentId
      toast,
      useNewUrlFormat,
      nextUrl,
      employeeId,
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

      {/* Campo de email (común a ambos estados) - Ahora obligatorio */}
      <div className="flex flex-col gap-2">
        <motion.div className="relative">
          <motion.div className="relative flex items-center">
            {/* Indicador de campo obligatorio - ahora a la izquierda del campo */}
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 font-bold">
              *
            </span>

            <motion.input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={handleEmailFocus}
              onBlur={handleEmailBlur}
              placeholder="Tu email"
              className={`w-full p-4 pl-8 pr-12 rounded-lg bg-white/5 text-white placeholder-gray-400 transition-all duration-200 ${
                errors.email && hasInteractedWithEmail
                  ? 'border-2 border-red-500'
                  : 'border border-white/10'
              } focus:ring-2 focus:ring-white/20 focus:outline-none`}
              disabled={isSubmitting}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              required
            />

            {formData.email && (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                onClick={clearEmail}
                aria-label="Borrar email"
                tabIndex={0}
              >
                ✕
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* Mensaje promocional para email incluyendo mención de campo obligatorio */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-400 italic text-center"
        >
          Ingresa tu email para recibir descuentos exclusivos y recompensas
          especiales{' '}
          <span className="text-red-400 not-italic">(campo obligatorio)</span>
        </motion.p>

        {/* Mensaje de error para email - solo después de interacción */}
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
