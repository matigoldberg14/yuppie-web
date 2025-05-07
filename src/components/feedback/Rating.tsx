// src/components/feedback/Rating.tsx
import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/use-toast';
import {
  createReview,
  getRestaurantNumericId,
  getEmployeeNumericId,
  checkEmailReviewStatus,
  checkIfEmailHasFiveStarReview,
} from '../../services/api';
import {
  hasSubmittedReviewToday,
  recordReviewSubmission,
} from '../../utils/reviewLimiter';
import { encryptId } from '../../lib/encryption';
import { useUserAuth } from '../../lib/UserAuthContext';
import {
  addPointsForReview,
  getUserPoints,
} from '../../services/userPointsService';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { GoogleAuthButton } from '../auth/GoogleAuthButton';
import { verifyOrCreateUser } from '../../services/userService';

interface Props {
  restaurantId: string;
  restaurantDocumentId: string;
  nextUrl: string;
  linkMaps: string;
  employeeDocumentId?: string;
}

// Static array that won't re-render - use web-safe emoji Unicode code points
const ratingOptions = [
  { rating: 1, emoji: '😠', label: 'Muy insatisfecho', color: 'bg-red-500' },
  { rating: 2, emoji: '🙁', label: 'Insatisfecho', color: 'bg-orange-500' },
  { rating: 3, emoji: '😐', label: 'Neutral', color: 'bg-yellow-500' },
  { rating: 4, emoji: '🙂', label: 'Satisfecho', color: 'bg-lime-500' },
  { rating: 5, emoji: '😁', label: 'Muy satisfecho', color: 'bg-green-500' },
] as const;

// Optimize component for better performance on mobile
export function RatingForm({
  restaurantId,
  restaurantDocumentId,
  nextUrl,
  linkMaps,
  employeeDocumentId,
}: Props) {
  // Parse the ID once
  const numericRestaurantId = parseInt(restaurantId, 10);

  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [emojisLoaded, setEmojisLoaded] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userDisplayName, setUserDisplayName] = useState('');

  // Obtener información del usuario autenticado si existe
  // ESTE ES EL CAMBIO PRINCIPAL - Mover el hook dentro del componente
  const { user, loginWithGoogle, login, register, error, logout } =
    useUserAuth() || {
      user: null,
      loginWithGoogle: async () => {},
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      error: null,
    };

  // Almacenar la URL de retorno para volver después de iniciar sesión
  const saveReturnUrl = () => {
    const currentUrl = window.location.href;
    localStorage.setItem('auth_return_url', currentUrl);
  };

  useEffect(() => {
    const justAuthenticated = localStorage.getItem('just_authenticated');
    const authUserEmail = localStorage.getItem('auth_user_email');

    if (justAuthenticated === 'true') {
      console.log('Rating - Detectada autenticación reciente:', authUserEmail);

      // Limpiar la bandera
      localStorage.removeItem('just_authenticated');

      // Mostrar toast de bienvenida
      toast({
        title: '¡Sesión iniciada!',
        description: `Bienvenido, ${authUserEmail?.split('@')[0] || 'Usuario'}`,
        duration: 3000,
      });

      // Y asegurarse de que el componente se actualice
      setIsAuthenticated(true);
      setUserEmail(authUserEmail || '');
      setUserDisplayName(authUserEmail?.split('@')[0] || 'Usuario');
    }
  }, [toast]);

  const fetchUserPoints = async (restaurantId: string) => {
    try {
      const points = await getUserPoints(restaurantId);
      if (points && points.length > 0) {
        setUserPoints(points[0].points);
        console.log('Rating - Puntos obtenidos:', points[0].points);
      } else {
        setUserPoints(0);
        console.log('Rating - No se encontraron puntos para el usuario');
      }
    } catch (err) {
      console.error('Error obteniendo puntos del usuario:', err);
      setUserPoints(0);
    }
  };

  // Efecto para verificar auth directamente
  useEffect(() => {
    const checkAuthState = async () => {
      // Verificar directamente con Firebase
      const user = auth?.currentUser;
      console.log('Rating - checkAuthState directo, usuario:', user?.email);

      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email || '');
        setUserDisplayName(
          user.displayName || user.email?.split('@')[0] || 'Usuario'
        );

        // Verificar o crear el usuario en Strapi
        try {
          await verifyOrCreateUser();
          console.log('Usuario verificado/creado en Strapi');

          // Obtener puntos si el usuario está autenticado
          if (restaurantDocumentId) {
            fetchUserPoints(restaurantDocumentId);
          }
        } catch (err) {
          console.error('Error verificando/creando usuario en Strapi:', err);
        }
      } else {
        setIsAuthenticated(false);
        setUserEmail('');
        setUserDisplayName('');
      }
    };

    // Verificar inmediatamente
    checkAuthState();

    // Y establecer un listener para cambios de auth
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      console.log('Rating - onAuthStateChanged directo:', user?.email);
      checkAuthState();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [restaurantDocumentId]);

  useEffect(() => {
    // Verificar si acabamos de iniciar sesión
    const checkAuth = () => {
      if (user) {
        console.log('Rating: Usuario autenticado detectado:', user.email);
        // Forzar actualización de puntos
        if (restaurantDocumentId) {
          const fetchUserPoints = async () => {
            try {
              const points = await getUserPoints(restaurantDocumentId);
              if (points && points.length > 0) {
                setUserPoints(points[0].points);
              } else {
                setUserPoints(0);
              }
              console.log('Rating: Puntos actualizados:', userPoints);
            } catch (err) {
              console.error('Error obteniendo puntos del usuario:', err);
            }
          };

          fetchUserPoints();
        }

        // Asegurarnos de que el formulario de login no se muestre
        setShowLoginForm(false);
      }
    };

    checkAuth();
  }, [user, restaurantDocumentId]);

  console.log(
    'Rating - Estado de usuario:',
    user ? `Autenticado como: ${user.email}` : 'No autenticado'
  );

  // Preload emojis
  useEffect(() => {
    // Create a hidden div to preload emojis and ensure they're ready before display
    const preloadEmojis = () => {
      const preloadDiv = document.createElement('div');
      preloadDiv.style.position = 'absolute';
      preloadDiv.style.opacity = '0';
      preloadDiv.style.pointerEvents = 'none';
      preloadDiv.style.width = '0';
      preloadDiv.style.height = '0';
      preloadDiv.style.overflow = 'hidden';

      // Add all emojis with explicit font-size to ensure proper loading
      ratingOptions.forEach((option) => {
        const span = document.createElement('span');
        span.style.fontSize = '40px'; // Match the size you'll display
        span.textContent = option.emoji;
        preloadDiv.appendChild(span);
      });

      document.body.appendChild(preloadDiv);

      // Set a timeout to ensure emojis have time to load
      setTimeout(() => {
        setEmojisLoaded(true);
        document.body.removeChild(preloadDiv);
      }, 300);
    };

    preloadEmojis();
  }, []);

  useEffect(() => {
    // Handle employee ID in localStorage
    if (!employeeDocumentId) {
      localStorage.removeItem('yuppie_employee');
    } else {
      localStorage.setItem('yuppie_employee', employeeDocumentId);
    }
  }, [employeeDocumentId]);

  useEffect(() => {
    if (user && restaurantDocumentId) {
      console.log(
        'Rating - Efecto de carga de puntos activado para usuario:',
        user.email
      );

      const fetchUserPoints = async () => {
        try {
          const points = await getUserPoints(restaurantDocumentId);
          if (points && points.length > 0) {
            setUserPoints(points[0].points);
          } else {
            // Puntos por defecto si no hay datos
            setUserPoints(0);
          }
        } catch (err) {
          console.error('Error obteniendo puntos del usuario:', err);
          setUserPoints(0);
        }
      };

      fetchUserPoints();
    }
  }, [user, restaurantDocumentId]);

  // Check for previous submissions
  useEffect(() => {
    if (!restaurantDocumentId) return;

    const checkSubmission = () => {
      try {
        const hasSubmitted = hasSubmittedReviewToday(restaurantDocumentId);
        if (hasSubmitted) {
          setAlreadySubmitted(true);
          toast({
            variant: 'destructive',
            title: 'Ya has opinado hoy',
            description:
              'Ya has enviado tu calificación para este restaurante. ¡Gracias por compartir tu opinión!',
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error verificando estado de review:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    // Use requestAnimationFrame instead of requestIdleCallback for better compatibility
    requestAnimationFrame(() => {
      checkSubmission();
    });
  }, [restaurantDocumentId, toast]);

  // Precargar datos para optimizar el tiempo de carga
  useEffect(() => {
    if (!restaurantDocumentId) return;

    const preloadData = async () => {
      try {
        // Intentar obtener el ID del restaurante en paralelo
        getRestaurantNumericId(restaurantDocumentId).catch((err: Error) => {
          console.error('Error precargando ID de restaurante:', err);
        });

        // Si hay ID de empleado, también precargarlo
        if (employeeDocumentId) {
          getEmployeeNumericId(employeeDocumentId).catch((err: Error) => {
            console.error('Error precargando ID de empleado:', err);
          });
        }

        // También podemos precargar la verificación de email si existe
        const savedEmail = localStorage.getItem('yuppie_email');
        if (savedEmail) {
          checkIfEmailHasFiveStarReview(restaurantDocumentId, savedEmail).catch(
            (err: Error) => {
              console.error('Error precargando verificación de email:', err);
            }
          );
        }
      } catch (error) {
        console.error('Error en precarga de datos:', error);
      }
    };

    // Usar requestIdleCallback si está disponible, de lo contrario setTimeout
    if (typeof window !== 'undefined') {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => preloadData());
      } else {
        setTimeout(preloadData, 100);
      }
    }
  }, [restaurantDocumentId, employeeDocumentId]);

  useEffect(() => {
    // Este efecto se ejecuta cada vez que cambia el estado de autenticación
    console.log(
      'Rating - Efecto de autenticación ejecutado, user:',
      user ? user.email : 'no autenticado'
    );

    if (user) {
      // Si el usuario está autenticado, cerrar el formulario de login si está abierto
      setShowLoginForm(false);

      // Y mostrar un toast de bienvenida
      toast({
        title: '¡Sesión iniciada!',
        description: `Bienvenido, ${
          user.displayName || user.email?.split('@')[0] || 'Usuario'
        }`,
        duration: 3000,
      });
    }
  }, [user, toast]);

  // Efecto para verificar si debemos redirigir después de iniciar sesión
  useEffect(() => {
    if (user && loginLoading) {
      setLoginLoading(false);

      // Mostrar toast de bienvenida
      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión exitosamente.',
        duration: 3000,
      });

      // Cerrar el formulario de login si está abierto
      setShowLoginForm(false);
    }
  }, [user, toast, loginLoading]);

  const handleRatingHover = useCallback(
    (rating: number) => {
      if (!isSubmitting && !alreadySubmitted) {
        setSelectedRating(rating);
      }
    },
    [isSubmitting, alreadySubmitted]
  );

  const handleGoogleLogin = async () => {
    console.log('1. Botón Google presionado - inicio de handleGoogleLogin');
    try {
      console.log('2. Estableciendo estado de carga...');
      setLoginLoading(true);

      console.log('3. Guardando URL de retorno...');
      saveReturnUrl();
      const savedUrl = localStorage.getItem('auth_return_url');
      console.log('4. URL guardada:', savedUrl);

      console.log('5. Verificando si auth está disponible...');
      if (!auth) {
        console.error('6. ERROR: Firebase no está inicializado');
        throw new Error('Firebase no está inicializado');
      }
      console.log('6. Auth está disponible:', !!auth);

      console.log('7. Llamando a loginWithGoogle del contexto...');
      // Envolver en try-catch para distinguir de dónde viene el error
      try {
        await loginWithGoogle();
        console.log('8. loginWithGoogle completado exitosamente');
      } catch (ctxError) {
        console.error('8. ERROR en loginWithGoogle del contexto:', ctxError);
        throw ctxError; // Re-lanzar para capturar en el catch externo
      }

      console.log('9. Autenticación exitosa, preparando mensaje toast');
      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión exitosamente con Google.',
        duration: 3000,
      });

      console.log('10. Finalizado handleGoogleLogin con éxito');
    } catch (err) {
      console.error('ERROR GENERAL en handleGoogleLogin:', err);
      // Usar tipado seguro para acceder a propiedades posiblemente undefined
      if (err instanceof Error) {
        console.error('Stack trace:', err.stack);
      }
      setLoginLoading(false);

      // Mensaje de error específico
      let errorMessage =
        'No se pudo iniciar sesión con Google. Intenta nuevamente.';

      // Verificar si el error tiene una propiedad code (típico en errores de Firebase)
      const firebaseError = err as { code?: string };
      console.error('Código de error (si existe):', firebaseError.code);

      if (firebaseError.code === 'auth/popup-closed-by-user') {
        errorMessage =
          'Cerraste la ventana de autenticación. Intenta nuevamente.';
      } else if (firebaseError.code === 'auth/popup-blocked') {
        errorMessage =
          'El navegador bloqueó la ventana emergente. Permite ventanas emergentes e intenta nuevamente.';
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
        duration: 3000,
      });
    }
  };

  // Función para iniciar sesión con email y contraseña
  const handleEmailLogin = async (email: string, password: string) => {
    try {
      setLoginLoading(true);
      saveReturnUrl();
      await login(email, password);
    } catch (error) {
      console.error('Error al iniciar sesión con email:', error);
      setLoginLoading(false);
    }
  };

  // Función para registrarse con email y contraseña
  const handleRegister = async (email: string, password: string) => {
    try {
      setLoginLoading(true);
      saveReturnUrl();
      await register(email, password);
    } catch (error) {
      console.error('Error al registrarse:', error);
      setLoginLoading(false);
    }
  };

  // Function to create reviews
  const createReviewWithData = async (
    rating: number,
    restaurantRealId: number,
    employeeRealId?: number,
    email: string = 'prefirio-no-dar-su-email@nodiosuemail.com'
  ) => {
    console.log(`=== INICIO createReviewWithData ===`);
    console.log(
      `📊 Datos: restaurante=${restaurantRealId}, rating=${rating}, email=${email}${
        employeeRealId ? `, empleado=${employeeRealId}` : ', sin empleado'
      }`
    );

    const reviewData: any = {
      restaurantId: restaurantRealId,
      calification: rating,
      typeImprovement: 'Otra',
      email: email,
      comment: 'Google Review: 5 estrellas. Review enviada a Google!',
      googleSent: true,
    };

    if (employeeRealId) {
      reviewData.employeeId = employeeRealId;
    }

    console.log(`📤 Enviando datos a API:`, JSON.stringify(reviewData));

    try {
      const result = await createReview(reviewData);
      console.log(`✅ Review creada exitosamente:`, result);

      // Asignar puntos si el usuario está autenticado
      if (user) {
        try {
          await addPointsForReview(restaurantDocumentId, rating, true);
          console.log(
            '✅ Puntos asignados correctamente por review con Google'
          );
        } catch (pointsError) {
          console.error(
            'Error asignando puntos por Google review:',
            pointsError
          );
        }
      }

      return true;
    } catch (apiError) {
      console.error(`❌ Error en createReview:`, apiError);
      throw apiError;
    } finally {
      console.log(`=== FIN createReviewWithData ===`);
    }
  };

  // Main handler function
  const handleRatingSelect = useCallback(
    async (rating: number) => {
      if (isSubmitting || alreadySubmitted) return;

      try {
        setIsSubmitting(true);
        console.log(`===== Processing rating: ${rating} =====`);

        // Store in localStorage (quick sync operation)
        localStorage.setItem('yuppie_rating', rating.toString());
        localStorage.setItem('yuppie_restaurant', restaurantDocumentId);

        // Parámetros adicionales para la página de thanks
        let thanksUrlParams = `?rating=${rating}&restaurant=${encryptId(
          restaurantDocumentId
        )}`;

        // For 5-star ratings only, we'll decide if redirect to Google or follow Yuppie flow
        if (rating === 5) {
          localStorage.setItem('yuppie_improvement', 'Otra');
          console.log(`==== FLUJO DE RATING 5 ESTRELLAS INICIADO ====`);

          try {
            // VERIFICACIÓN CRUCIAL - Si ya existe una review de 5 estrellas previa para este restaurante
            console.log(
              `🔍 Verificando si ya existe una review de 5 estrellas previa...`
            );
            // Usamos una bandera específica para reviews de 5 estrellas
            const hasFiveStarReviewFlag = localStorage.getItem(
              `review_google_5stars_${restaurantDocumentId}`
            );

            // Si el usuario está autenticado, intentar asignar puntos por la reseña
            if (user) {
              try {
                await addPointsForReview(restaurantDocumentId, rating, false);
                console.log(
                  '✅ Puntos asignados correctamente por reseña en Yuppie'
                );
              } catch (pointsError) {
                console.error(
                  'Error asignando puntos por reseña:',
                  pointsError
                );
              }
            }

            if (hasFiveStarReviewFlag === 'true') {
              console.log(
                `⚠️ REVIEW DE 5 ESTRELLAS PREVIA ENCONTRADA - Redirigiendo a flujo Yuppie`
              );

              toast({
                title: '¡Gracias!',
                description:
                  'Por favor completa algunos detalles más sobre tu experiencia',
                duration: 2000,
              });

              // Redirigir al flujo de Yuppie
              if (employeeDocumentId) {
                // Verificar si la URL ya usa formato encriptado
                if (nextUrl.includes('?id=') || nextUrl.includes('&id=')) {
                  // URL ya está en formato encriptado, añadir empleado encriptado
                  const encryptedEmployeeId = encryptId(employeeDocumentId);
                  const fullNextUrl = `${nextUrl}${
                    nextUrl.includes('?') ? '&' : '?'
                  }emp=${encryptedEmployeeId}`;
                  console.log(
                    `🔀 Redirigiendo a URL encriptada: ${fullNextUrl}`
                  );
                  window.location.href = fullNextUrl;
                } else {
                  // URL en formato antiguo, mantener compatibilidad
                  const fullNextUrl = `${nextUrl}${
                    nextUrl.includes('?') ? '&' : '?'
                  }employee=${employeeDocumentId}`;
                  console.log(`🔀 Redirigiendo a URL antigua: ${fullNextUrl}`);
                  window.location.href = fullNextUrl;
                }
              } else {
                console.log(`🔀 Redirigiendo a: ${nextUrl}`);
                window.location.href = nextUrl;
              }
              return; // CRUCIAL: Terminar la ejecución aquí
            }

            // Si llegamos aquí, es porque NO hay reviews de 5 estrellas previas, continuamos el flujo normal
            console.log(
              `✅ NO HAY REVIEWS DE 5 ESTRELLAS PREVIAS - Continuando flujo a Google Maps`
            );

            toast({
              title: '¡Gracias!',
              description: '¿Nos dejarías un comentario en Google?',
              duration: 2000,
            });

            // Usamos el email guardado si existe (probablemente de una review de 1-4 estrellas)
            const savedEmail = localStorage.getItem('yuppie_email');
            console.log(
              `📧 Verificando email guardado: ${
                savedEmail || 'NO HAY EMAIL GUARDADO'
              }`
            );

            // Usamos el email guardado o el genérico si no hay uno guardado
            const reviewEmail =
              savedEmail || 'prefirio-no-dar-su-email@nodiosuemail.com';

            // El resto del proceso para crear la review y redireccionar a Google
            console.log(
              `🏪 Buscando ID para restaurante: ${restaurantDocumentId}`
            );
            const realRestaurantId = await getRestaurantNumericId(
              restaurantDocumentId
            );

            if (realRestaurantId) {
              console.log(`✅ ID obtenido: ${realRestaurantId}`);

              // Get employee ID if needed
              let employeeRealId: number | undefined;
              if (employeeDocumentId) {
                try {
                  const idResult = await getEmployeeNumericId(
                    employeeDocumentId
                  );
                  // Convertimos null a undefined para asegurar compatibilidad de tipos
                  employeeRealId = idResult || undefined;
                } catch (empError) {
                  console.error('Error obteniendo ID empleado:', empError);
                  employeeRealId = undefined; // Explícitamente asignamos undefined en caso de error
                }
              }

              // Crear la review con el email correspondiente
              try {
                console.log(
                  `📝 Creando review en API con email: ${reviewEmail}`
                );
                await createReviewWithData(
                  5,
                  realRestaurantId,
                  employeeRealId,
                  reviewEmail
                );

                // Añadir el parámetro para la página de thanks
                thanksUrlParams += '&google=true';
              } catch (error) {
                console.error('Error creando review:', error);
                if (employeeRealId) {
                  await createReviewWithData(
                    5,
                    realRestaurantId,
                    undefined,
                    reviewEmail
                  );

                  // Añadir el parámetro para la página de thanks
                  thanksUrlParams += '&google=true';
                }
              }

              // IMPORTANTE: Guardar una bandera ESPECÍFICA para reviews de 5 estrellas
              try {
                localStorage.setItem(
                  `review_google_5stars_${restaurantDocumentId}`,
                  'true'
                );
                console.log(
                  `🔒 Marcando restaurante ${restaurantDocumentId} como ya revisado con 5 estrellas`
                );
              } catch (storageErr) {
                console.error(
                  'Error guardando estado en localStorage:',
                  storageErr
                );
              }

              // Redirect to Google Maps with thanks page as redirect back
              console.log(`🔀 Redirigiendo a Google Maps: ${linkMaps}`);

              // Guardar la URL de redirección de vuelta
              localStorage.setItem(
                'redirect_after_google',
                `/thanks${thanksUrlParams}`
              );

              setTimeout(() => {
                window.location.href = linkMaps;
              }, 200);
            }
          } catch (error) {
            console.error('❌ Error en flujo de 5 estrellas:', error);
            setIsSubmitting(false);

            // En caso de error, vamos al flujo seguro de Yuppie
            if (employeeDocumentId) {
              // Verificar si la URL ya usa formato encriptado
              if (nextUrl.includes('?id=') || nextUrl.includes('&id=')) {
                const encryptedEmployeeId = encryptId(employeeDocumentId);
                window.location.href = `${nextUrl}${
                  nextUrl.includes('?') ? '&' : '?'
                }emp=${encryptedEmployeeId}`;
              } else {
                window.location.href = `${nextUrl}${
                  nextUrl.includes('?') ? '&' : '?'
                }employee=${employeeDocumentId}`;
              }
            } else {
              window.location.href = nextUrl;
            }
          }
        } else {
          // For ratings less than 5

          // Si el usuario está autenticado, intentar asignar puntos por la reseña
          if (user) {
            try {
              await addPointsForReview(restaurantDocumentId, rating, false);
              console.log('✅ Puntos asignados correctamente por reseña');
            } catch (pointsError) {
              console.error('Error asignando puntos por reseña:', pointsError);
            }
          }

          // Redirect to next page
          if (employeeDocumentId) {
            // Verificar si la URL ya usa formato encriptado
            if (nextUrl.includes('?id=') || nextUrl.includes('&id=')) {
              // URL ya está en formato encriptado, añadir empleado encriptado
              const encryptedEmployeeId = encryptId(employeeDocumentId);
              const fullNextUrl = `${nextUrl}${
                nextUrl.includes('?') ? '&' : '?'
              }emp=${encryptedEmployeeId}`;
              window.location.href = fullNextUrl;
            } else {
              // URL en formato antiguo, mantener compatibilidad
              const fullNextUrl = `${nextUrl}${
                nextUrl.includes('?') ? '&' : '?'
              }employee=${employeeDocumentId}`;
              window.location.href = fullNextUrl;
            }
          } else {
            window.location.href = nextUrl;
          }
        }
      } catch (error) {
        console.error('Error processing rating:', error);
        setIsSubmitting(false);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    [
      isSubmitting,
      alreadySubmitted,
      restaurantId,
      restaurantDocumentId,
      numericRestaurantId,
      employeeDocumentId,
      toast,
      linkMaps,
      nextUrl,
      user,
    ]
  );

  // If already submitted, show fallback
  if (alreadySubmitted) {
    return (
      <div className="w-full text-center py-4">
        <p className="text-white text-opacity-80">
          Ya has enviado tu valoración. Gracias.
        </p>
      </div>
    );
  }

  // Show loading state
  if (!isLoaded || !emojisLoaded) {
    return (
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <h2 className="text-2xl font-medium text-white text-center">
          ¿Qué tan satisfecho quedaste con el servicio?
        </h2>
        <div className="flex justify-between w-full px-4">
          {ratingOptions.map(({ rating, emoji }) => (
            <div key={rating} className="flex flex-col items-center opacity-70">
              <span className="text-4xl">{emoji}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Componente de formulario de login
  const LoginForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isLogin) {
        await handleEmailLogin(email, password);
      } else {
        await handleRegister(email, password);
      }
    };

    return (
      <div className="w-full bg-white/10 rounded-lg p-4">
        <div className="flex justify-between mb-4 border-b border-white/20 pb-2">
          <button
            onClick={() => setIsLogin(true)}
            className={`py-2 px-4 font-medium rounded-t-lg transition-colors ${
              isLogin
                ? 'text-yellow-300 border-b-2 border-yellow-300'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`py-2 px-4 font-medium rounded-t-lg transition-colors ${
              !isLogin
                ? 'text-yellow-300 border-b-2 border-yellow-300'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-500/20 text-red-200 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
          />

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-2 bg-white text-blue-900 font-medium rounded flex items-center justify-center"
          >
            {loginLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-900"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Procesando...
              </>
            ) : isLogin ? (
              'Iniciar sesión'
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <div className="my-3 flex items-center">
          <div className="flex-1 border-t border-white/10"></div>
          <p className="mx-3 text-white/60 text-sm">o</p>
          <div className="flex-1 border-t border-white/10"></div>
        </div>

        <GoogleAuthButton
          onSuccess={() => {
            toast({
              title: '¡Bienvenido!',
              description: 'Has iniciado sesión exitosamente con Google.',
              duration: 3000,
            });
            // La redirección se manejará en UserAuthContext
          }}
          onError={(error) => {
            const firebaseError = error as { code?: string };
            let errorMessage =
              'No se pudo iniciar sesión con Google. Intenta nuevamente.';

            if (firebaseError.code === 'auth/popup-closed-by-user') {
              errorMessage =
                'Cerraste la ventana de autenticación. Intenta nuevamente.';
            } else if (firebaseError.code === 'auth/popup-blocked') {
              errorMessage =
                'El navegador bloqueó la ventana emergente. Permite ventanas emergentes e intenta nuevamente.';
            }

            toast({
              variant: 'destructive',
              title: 'Error',
              description: errorMessage,
              duration: 3000,
            });
          }}
        />

        <div className="flex justify-between mt-4">
          <button
            onClick={() => setShowLoginForm(false)}
            className="text-white/60 text-sm hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-8">
      <h2 className="text-2xl font-medium text-white text-center">
        ¿Qué tan satisfecho quedaste con el servicio?
      </h2>

      <div className="flex justify-between w-full px-4 relative">
        {ratingOptions.map(({ rating, emoji, label, color }) => (
          <button
            key={rating}
            onClick={() => handleRatingSelect(rating)}
            onMouseEnter={() => handleRatingHover(rating)}
            onTouchStart={() => handleRatingHover(rating)}
            onFocus={() => handleRatingHover(rating)}
            disabled={isSubmitting}
            className={`relative group flex flex-col items-center ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            aria-label={label}
          >
            {/* Use a simpler approach for the emoji display */}
            <span className="text-4xl transform transition-transform duration-200 group-hover:scale-110">
              {emoji}
            </span>

            {/* Only show label when selected to improve performance */}
            {selectedRating === rating && (
              <div
                className={`absolute -bottom-12 px-3 py-1 rounded-full text-sm text-white ${color} opacity-100`}
              >
                {label}
              </div>
            )}

            {/* Indicator dot when selected */}
            {selectedRating === rating && (
              <div
                className={`absolute -bottom-2 w-2 h-2 rounded-full ${color} opacity-100`}
              />
            )}
          </button>
        ))}
      </div>

      {isSubmitting && (
        <div className="text-center text-white/80 flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Procesando tu calificación...
        </div>
      )}

      {/* Banner de puntos DEBAJO de las opciones de rating */}
      <div className="w-full mt-6">
        {isAuthenticated ? (
          <div className="w-full bg-white/10 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-xl mr-2">🎁</span>
              <span className="text-white font-medium">
                ¡Bienvenido, {userDisplayName}!
              </span>
            </div>

            <div className="bg-white/5 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-center">
                <span className="text-xl mr-2">⭐</span>
                <span className="text-white">
                  Tienes{' '}
                  <span className="font-bold text-yellow-300">
                    {userPoints} puntos
                  </span>{' '}
                  disponibles
                </span>
              </div>
              <p className="text-sm text-white/70 mt-1">
                Obtendrás más puntos al enviar tu valoración
              </p>
            </div>

            <button
              onClick={async () => {
                try {
                  await auth?.signOut();
                  window.location.reload();
                  toast({
                    title: 'Sesión cerrada',
                    description: 'Has cerrado sesión exitosamente.',
                    duration: 3000,
                  });
                } catch (err) {
                  console.error('Error al cerrar sesión:', err);
                }
              }}
              className="text-sm text-white/60 hover:text-white underline"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div>
            {!showLoginForm ? (
              <div className="w-full bg-white/10 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-xl mr-2">💡</span>
                  <span className="text-white">
                    <button
                      onClick={() => setShowLoginForm(true)}
                      className="underline text-yellow-300"
                    >
                      Inicia sesión
                    </button>{' '}
                    para ganar puntos
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  Acumula puntos y canjéalos por descuentos exclusivos
                </p>
              </div>
            ) : (
              <LoginForm />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Export memoized version for better performance
export const MemoizedRatingForm = memo(RatingForm);
