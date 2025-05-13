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
import { incrementTapsForEmployee } from '@/services/api/employees';
import InstagramIcon from '@/components/icons/InstagramIcon';

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
              <InstagramIcon className='w-5 h-5' />
              yuppie.ar
            </a>
            {restaurant.socialNetwork && (
              <a
                href={restaurant.socialNetwork}
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-300 hover:text-white flex items-center gap-2 transform hover:translate-x-1 hover:scale-105 transition-all duration-200'
              >
                <InstagramIcon className='w-5 h-5' />
                {restaurant.name}
              </a>
            )}
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
