import { getCommentOptions } from '@/data/Reviews';
import type {
  CommentCategory,
  CommentValue,
  ImprovementValue,
} from '@/types/reviews';
import { useTranslations } from '../../i18n/config';
import type { SupportedLang } from '../../i18n/config';

interface Props {
  comment: string;
  customComment: string;
  showCustomComment: boolean;
  improvement: ImprovementValue;
  minLength: number;
  maxLength: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClick: (comment: CommentValue) => void;
  lang: SupportedLang;
}

export default function CommentForm({
  comment,
  customComment,
  improvement,
  onChange,
  showCustomComment,
  onClick,
  minLength,
  maxLength,
  lang,
}: Props) {
  const t = useTranslations(lang);

  return (
    <div className='w-full max-w-md flex flex-col items-center gap-3'>
      <h2 className='text-2xl font-medium text-white text-center mb-4'>
        {t('feedback.improvements.title')}
      </h2>

      {showCustomComment || improvement === 'other' ? (
        <div className='w-full flex flex-col gap-2 items-end'>
          <textarea
            name='customComment'
            id='customComment'
            onChange={onChange}
            value={customComment}
            minLength={minLength}
            maxLength={maxLength}
            placeholder={t('feedback.customCommentPlaceholder')}
            className='w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400 resize-none h-40 transition-all duration-200 focus:ring-2 focus:ring-white/20 focus:outline-none'
          />
          <span
            className={`text-sm ${
              customComment.length === 500 ? 'text-red-400' : 'text-gray-400'
            }`}
          >
            {customComment.length}/500
          </span>
        </div>
      ) : (
        (getCommentOptions(lang as SupportedLang)[
          improvement as CommentCategory
        ]
          ? [
              ...getCommentOptions(lang as SupportedLang)[
                improvement as CommentCategory
              ].filter(({ id }) => id !== 'other'),
              ...getCommentOptions(lang as SupportedLang)[
                improvement as CommentCategory
              ].filter(({ id }) => id === 'other'),
            ]
          : []
        ).map(({ id, icon }) => {
          return (
            <button
              key={id}
              className={`w-full p-4 rounded-lg flex text-start items-start gap-3  transition-colors  ${
                comment === id
                  ? 'bg-white text-primary-dark'
                  : 'bg-white/5 text-white'
              }`}
              onClick={() => onClick(id as CommentValue)}
            >
              <span
                className='text-xl'
                role='img'
                aria-label={t(`feedback.commentOptions.${id}`)}
              >
                {icon}
              </span>
              {t(`feedback.commentOptions.${id}`)}
            </button>
          );
        })
      )}
    </div>
  );
}
