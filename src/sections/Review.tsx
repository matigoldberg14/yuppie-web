import CommentForm from '@/components/feedback/CommentForm';
import ImprovementForm from '@/components/feedback/ImprovementForm';
import RatingForm from '@/components/feedback/RatingForm';
import type { Employee } from '@/types/employee';
import type {
  CommentCategory,
  CommentOption,
  CommentValue,
  ImprovementValue,
  RatingValue,
} from '@/types/reviews';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createReview, existsReviewWithEmail } from '@/services/api/reviews';
import type { Restaurant } from '@/types/restaurant';
import { validateEmail } from '@/utils/validation';
import useLoading from '@/hooks/useLoading';
import { incrementTapsForEmployee } from '@/services/api/employees';
import InstagramIcon from '@/components/icons/InstagramIcon';
import { commentOptions } from '@/data/Reviews';
import ErrorModal from '@/components/ui/Modal';
import emailjs from '@emailjs/browser';

type Pages = 'rating' | 'improvement' | 'comment' | 'thanks';

interface Props {
  restaurant: Restaurant;
  employee: Employee;
}

export default function Review({ restaurant, employee }: Props) {
  const [page, setPage] = useState<Pages>('rating');
  const [rating, setRating] = useState<RatingValue | 0>(0);
  const [improvement, setImprovement] = useState<ImprovementValue | ''>('');
  const [comment, setComment] = useState<CommentValue | ''>('');
  const [email, setEmail] = useState('');
  const [emailFromLS, setEmailFromLS] = useState<string>('');
  const [customComment, setCustomComment] = useState('');
  const [showCustomComment, setShowCustomComment] = useState(false);
  const [sendButtonDisabled, setSendButtonDisabled] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState({ type: '', message: '' });
  const { loading, startLoading, stopLoading } = useLoading();
  // Variable de prueba para simular login
  const isLoggedIn = false; // Cambia a true para ver la barra fija de usuario robertito

  useEffect(() => {
    const alreadyVisited = localStorage.getItem(
      `visit-${restaurant.slug}-${employee.eid}`
    );
    const today = new Date().toISOString().split('T')[0];

    if (alreadyVisited && alreadyVisited === today) {
      setError({
        type: 'user-error',
        message: 'Ya has dejado una review para este empleado hoy',
      });
      return;
    }

    const incrementTaps = async () => {
      await incrementTapsForEmployee(employee);
    };

    incrementTaps();
    setEmailFromLS(localStorage.getItem('yuppie_email') || '');
  }, []);

  useEffect(() => {
    if (emailFromLS) {
      setEmail(emailFromLS);
    }
  }, [emailFromLS]);

  useEffect(() => {
    if (page !== 'comment') {
      setEmail(emailFromLS);
    }
  }, [page]);

  useEffect(() => {
    setSendButtonDisabled(
      (improvement === 'Otra' && customComment.length < 10) ||
        (improvement !== 'Otra' && comment === '') ||
        (improvement !== 'Otra' &&
          comment === 'otro' &&
          customComment.length < 10)
    );
  }, [customComment, comment, improvement]);

  const handleRatingSelect = useCallback(
    async (rating: RatingValue) => {
      const googleReviewDone =
        localStorage.getItem(`google-review-${restaurant.slug}`) === 'true';
      const googleReview = rating === 5 && !googleReviewDone;

      if (googleReview) {
        await handleSubmit(true);
        window.location.href = restaurant.linkMaps;
        return;
      }

      setRating(rating);
      setPage('improvement');
    },
    [restaurant.slug]
  );

  const handleImprovementSelect = useCallback(
    (improvement: ImprovementValue) => {
      setImprovement(improvement);
      setShowCustomComment(improvement === 'Otra');
      setPage('comment');
    },
    []
  );

  const handleCommentSubmit = useCallback((comment: CommentValue) => {
    setComment(comment);
    setShowCustomComment(comment === 'otro');
  }, []);

  const handleCustomCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCustomComment(e.target.value);
    },
    []
  );

  const handleChangeEmail = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (emailError) {
        setEmailError('');
      }
      setEmail(e.target.value);
    },
    [emailError]
  );

  const saveReviewInLS = useCallback(
    (googleReview: boolean = false, email: string) => {
      localStorage.setItem('yuppie_email', email);
      const key = `visit-${restaurant.slug}-${employee.eid}`;
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(key, today);
      if (googleReview) {
        localStorage.setItem(`google-review-${restaurant.slug}`, 'true');
      }
    },
    [restaurant.slug]
  );

  const handleSubmit = useCallback(
    async (googleReview: boolean = false) => {
      if (email) {
        if (email !== emailFromLS) {
          const isEmailValid = validateEmail(email);
          if (!isEmailValid) {
            setEmailError('Email inválido');
            return;
          }
        }

        const alreadyReviewedWithEmail = await existsReviewWithEmail(
          restaurant.documentId,
          employee.documentId,
          email
        );

        if (alreadyReviewedWithEmail) {
          if (typeof alreadyReviewedWithEmail === 'object') {
            setError({
              type: 'server-error',
              message: 'Error al buscar la review',
            });
          } else {
            setError({
              type: 'user-error',
              message: 'Ya has dejado una review para este empleado hoy',
            });
          }
          return;
        }
      }

      let commentToSend = '';

      if (googleReview) {
        commentToSend = 'Google Review: 5 estrellas. Review enviada a Google!';
      } else if (comment) {
        const commentOption = commentOptions[
          improvement as CommentCategory
        ].find((option: CommentOption) => option.id === comment);
        commentToSend = `${commentOption?.icon} ${commentOption?.label}`;
      } else {
        commentToSend = customComment;
      }

      const reviewData = {
        restaurant: restaurant.documentId,
        employee: employee.documentId,
        calification: googleReview ? 5 : rating,
        typeImprovement: googleReview ? 'Otra' : improvement,
        email: email || 'prefirio-no-dar-su-email@nodiosuemail.com',
        comment: commentToSend,
        googleSent: googleReview,
        date: new Date().toISOString(),
      };

      startLoading();
      const review = await createReview(reviewData);
      stopLoading();

      if ('error' in review) {
        setError({
          type: 'server-error',
          message: 'Error al crear la review',
        });
        return;
      }

      // Enviar email si la calificación es 1 o 2 estrellas
      if (
        !googleReview &&
        (rating === 1 || rating === 2) &&
        restaurant.owner?.email
      ) {
        try {
          await emailjs.send(
            import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
            import.meta.env.PUBLIC_EMAILJS_COMMENT_TEMPLATE_ID,
            {
              rating: rating,
              improvement_type: improvement,
              comment: commentToSend,
              customer_email: email || 'No proporcionado',
              restaurant_name: restaurant.name,
              to_email: restaurant.owner.email,
            },
            import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY
          );
        } catch (error) {
          console.error('Error al enviar el email:', error);
        }
      }

      saveReviewInLS(googleReview, email);
      if (googleReview) {
        return;
      }
      setPage('thanks');
    },
    [
      email,
      emailFromLS,
      restaurant.slug,
      saveReviewInLS,
      restaurant.documentId,
      employee.documentId,
      rating,
      improvement,
      comment,
      customComment,
      startLoading,
      stopLoading,
      restaurant.name,
      restaurant.owner?.email,
    ]
  );

  const handleBack = useCallback(() => {
    if (page === 'rating' || page === 'thanks') return;

    setPage(page === 'improvement' ? 'rating' : 'improvement');
    if (page === 'improvement') {
      setRating(0);
    }
    if (page === 'comment') {
      setComment('');
      setCustomComment('');
      setImprovement('');
    }
    setEmailError('');
    setSendButtonDisabled(true);
  }, [page]);

  const clearEmail = useCallback(() => {
    setEmail('');
  }, []);

  const handleCloseModal = useCallback(() => {
    if (error.type === 'user-error') {
      window.location.href = import.meta.env.PUBLIC_SITE_URL;
    } else {
      window.location.reload();
    }
    setError({ type: '', message: '' });
  }, [error.type]);

  return (
    <>
      <div
        className={`w-full max-w-md overflow-hidden ${
          isLoggedIn ? 'pb-32' : ''
        }`}
      >
        <span
          onClick={handleBack}
          className={`absolute top-4 left-4 text-sm text-white transition-opacity duration-300 ease-in-out ${
            page === 'rating' || page === 'thanks' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </span>
        <div
          className={`flex items-center gap-6 h-fit transition-transform duration-300 ease-in-out ${
            page === 'rating'
              ? 'translate-x-0'
              : page === 'improvement'
              ? '-translate-x-[calc(100%_+_1.5rem)]'
              : page === 'comment'
              ? '-translate-x-[calc(200%_+_3rem)]'
              : '-translate-x-[calc(300%_+_4.5rem)]'
          }`}
        >
          <div className="card p-6 min-w-full flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-center">
              Califica tu experiencia
            </h2>
            <div className="emoji-container">
              <RatingForm onClick={handleRatingSelect} />
            </div>
          </div>
          <div className="card p-6 min-w-full flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-center">
              ¿En qué podríamos mejorar?
            </h2>
            <ImprovementForm onClick={handleImprovementSelect} />
          </div>
          <div className="card p-6 min-w-full flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-center">
              Déjanos tu comentario
            </h2>
            <CommentForm
              comment={comment}
              customComment={customComment}
              showCustomComment={showCustomComment}
              onChange={handleCustomCommentChange}
              improvement={improvement as ImprovementValue}
              onClick={handleCommentSubmit}
              minLength={10}
              maxLength={500}
            />
            <div className="w-full relative">
              <input
                type="email"
                name="email"
                placeholder="Tu email"
                onChange={handleChangeEmail}
                value={email}
                required
                className={`w-full p-4 pl-8 pr-12 rounded-lg bg-white/5 text-white placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-white/20 focus:outline-none ${
                  emailError ? 'ring-2 ring-red-400' : ''
                }`}
              />
              {restaurant.slug !== 'los-maestros-parana' && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 font-bold">
                  *
                </span>
              )}
              {emailError && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 text-sm">
                  {emailError}
                </span>
              )}
              {email && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={clearEmail}
                  aria-label="Borrar email"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-sm text-gray-400 italic text-center">
              Ingresa tu email para recibir descuentos exclusivos y recompensas
              especiales
            </p>
            <button
              type="submit"
              disabled={sendButtonDisabled}
              onClick={() => handleSubmit()}
              className={`w-full py-3 px-6 bg-white text-black rounded-full font-medium transition-all duration-200 ease-in-out ${
                sendButtonDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
          <div className="card p-6 min-w-full flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-white text-center">
              ¡Gracias por ayudarnos a mejorar!
            </h2>
            <p className="text-lg text-gray-200 text-center">
              Tu opinión es muy valiosa para nosotros y nos ayuda a ofrecer una
              mejor experiencia.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://www.instagram.com/yuppie.ar/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white flex items-center gap-2 transform hover:translate-x-1 hover:scale-105 transition-all duration-200"
              >
                <InstagramIcon className="w-5 h-5" />
                yuppie.ar
              </a>
              {restaurant.socialNetwork && (
                <a
                  href={restaurant.socialNetwork}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white flex items-center gap-2 transform hover:translate-x-1 hover:scale-105 transition-all duration-200"
                >
                  <InstagramIcon className="w-5 h-5" />
                  {restaurant.name}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="fixed top-0 left-0 h-1 bg-white/20 w-full z-50">
          <span
            className={`h-full bg-white absolute inset-0 transition-all duration-200 ease-in-out transform-origin-left ${
              page === 'rating'
                ? 'w-1/4'
                : page === 'improvement'
                ? 'w-1/2'
                : page === 'comment'
                ? 'w-3/4'
                : 'w-full'
            }`}
          />
        </div>

        <ErrorModal
          isOpen={error.message !== ''}
          onClose={handleCloseModal}
          title={error.type === 'user-error' ? 'Error' : 'Error del servidor'}
          message={error.message}
        />
      </div>

      {/* Barra de login/usuario */}
      {!isLoggedIn && (
        <div className="w-full flex justify-center mt-2">
          <div className="flex flex-col items-center justify-center bg-white/10 border border-white/20 rounded-xl py-3 px-4 max-w-md w-full">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-yellow-400">💡</span>
              <span>
                <span
                  className="font-medium cursor-pointer hover:underline"
                  style={{ color: '#39DFB2' }}
                >
                  Inicia Sesión
                </span>{' '}
                para ganar puntos
              </span>
            </div>
            <span className="text-xs text-white/60 mt-1">
              Acumula puntos y canjéalos por descuentos exclusivos
            </span>
          </div>
        </div>
      )}

      {isLoggedIn && (
        <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-4 pointer-events-none flex justify-center">
          <div
            className="flex items-center justify-between max-w-md w-full pointer-events-auto"
            style={{
              background: '#5F50E5',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-yellow-300 text-lg">✨</span>
              <span className="text-white text-sm font-medium">
                Nombre Cliente
              </span>
            </div>
            <div
              className="flex items-center gap-1 rounded-full px-3 py-1"
              style={{ background: '#2B1A6D' }}
            >
              <span className="font-bold text-sm" style={{ color: '#39DFB2' }}>
                300
              </span>
              <span className="text-lg" style={{ color: '#39DFB2' }}>
                🐔
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
