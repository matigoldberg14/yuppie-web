import CommentForm from '@/components/feedback/CommentForm';
import ImprovementForm from '@/components/feedback/ImprovementForm';
import RatingForm from '@/components/feedback/RatingForm';
import type { Employee } from '@/types/employee';
import type {
  CommentValue,
  ImprovementValue,
  RatingValue,
} from '@/types/reviews';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createReview } from '@/services/api/reviews';
import type { Restaurant } from '@/types/restaurant';
import { validateEmail } from '@/utils/validation';
import { API_CONFIG } from '@/services/api';

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

  const reviewData = useMemo(
    () => ({
      restaurant: restaurant.documentId,
      employee: employee.documentId,
      calification: rating,
      typeImprovement: improvement,
      email:
        email || emailFromLS || 'prefirio-no-dar-su-email@nodiosuemail.com',
      comment: comment ? comment : customComment,
      googleSent: false,
      date: new Date().toISOString(),
    }),
    [
      restaurant.documentId,
      employee.documentId,
      rating,
      improvement,
      email,
      emailFromLS,
      comment,
      customComment,
    ]
  );

  useEffect(() => {
    const alreadyVisited = localStorage.getItem(
      `visit-${restaurant.slug}-${employee.eid}`
    );

    if (alreadyVisited) {
      // TODO: change alert to a modal
      alert('Ya has dejado una review para este empleado hoy');
      window.location.href = import.meta.env.PUBLIC_SITE_URL;
    }

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
      (improvement === 'otra' && customComment.length < 10) ||
        (improvement !== 'otra' && comment === '') ||
        (improvement !== 'otra' &&
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
        setImprovement('otra');
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
      setShowCustomComment(improvement === 'otra');
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
    (googleReview: boolean = false) => {
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
      if (email && email !== emailFromLS) {
        const isEmailValid = validateEmail(email);
        if (!isEmailValid) {
          setEmailError('Email inválido');
          return;
        }
        localStorage.setItem('yuppie_email', email);
      }

      const finalReviewData = {
        ...reviewData,
        comment: googleReview
          ? 'Google Review: 5 estrellas. Review enviada a Google!'
          : reviewData.comment,
        googleSent: googleReview,
      };

      const review = await createReview(finalReviewData);

      if ('error' in review) {
        console.error('Error creating review:', review.message);
        // TODO: change alert to a modal
        alert('Error al crear la review');
        window.location.reload();
        return;
      }

      saveReviewInLS(googleReview);
      setPage('thanks');
    },
    [reviewData, email, emailFromLS, restaurant.slug, saveReviewInLS]
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

  return (
    <div className='w-full max-w-md overflow-hidden'>
      <span
        onClick={handleBack}
        className={`absolute top-4 left-4 text-sm text-white transition-opacity duration-300 ease-in-out ${
          page === 'rating' || page === 'thanks' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <ArrowLeftIcon className='w-4 h-4' /> Back
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
        <div className='card p-6 min-w-full flex flex-col gap-6'>
          <h2 className='text-2xl font-semibold text-center'>
            Califica tu experiencia
          </h2>
          <div className='emoji-container'>
            <RatingForm onClick={handleRatingSelect} />
          </div>
        </div>
        <div className='card p-6 min-w-full flex flex-col gap-6'>
          <h2 className='text-2xl font-semibold text-center'>
            ¿En qué podríamos mejorar?
          </h2>
          <ImprovementForm onClick={handleImprovementSelect} />
        </div>
        <div className='card p-6 min-w-full flex flex-col gap-6'>
          <h2 className='text-2xl font-semibold text-center'>
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
          <div className='w-full relative'>
            <input
              type='email'
              name='email'
              placeholder='Tu email'
              onChange={handleChangeEmail}
              value={email}
              required
              className={`w-full p-4 pl-8 pr-12 rounded-lg bg-white/5 text-white placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-white/20 focus:outline-none ${
                emailError ? 'ring-2 ring-red-400' : ''
              }`}
            />
            <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 font-bold'>
              *
            </span>
            {emailError && (
              <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 text-sm'>
                {emailError}
              </span>
            )}
            {email && (
              <button
                type='button'
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center'
                onClick={clearEmail}
                aria-label='Borrar email'
              >
                ✕
              </button>
            )}
          </div>
          <p className='text-sm text-gray-400 italic text-center'>
            Ingresa tu email para recibir descuentos exclusivos y recompensas
            especiales
          </p>
          <button
            type='submit'
            disabled={sendButtonDisabled}
            onClick={() => handleSubmit()}
            className={`w-full py-3 px-6 bg-white text-black rounded-full font-medium transition-all duration-200 ease-in-out ${
              sendButtonDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-100 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            Enviar
          </button>
        </div>
        <div className='card p-6 min-w-full flex flex-col gap-6'>
          <h2 className='text-3xl font-bold text-white text-center'>
            ¡Gracias por ayudarnos a mejorar!
          </h2>
          <p className='text-lg text-gray-200 mt-4 text-center'>
            Tu opinión es muy valiosa para nosotros y nos ayuda a ofrecer una
            mejor experiencia.
          </p>
          <div className='flex justify-center mt-6'>
            <a
              href='https://www.instagram.com/yuppie.ar/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-300 hover:text-white flex items-center gap-2 transform hover:translate-x-1 hover:scale-105 transition-all duration-200'
            >
              <svg
                className='w-5 h-5'
                fill='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
              </svg>
              Yuppie.ar
            </a>
            {/* TODO: add link to instagram */}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className='fixed top-0 left-0 h-1 bg-white/20 w-full z-50'>
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
    </div>
  );
}
