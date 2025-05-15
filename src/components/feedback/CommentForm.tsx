import { commentOptions } from '@/data/Reviews';
import type {
  CommentCategory,
  CommentValue,
  ImprovementValue,
} from '@/types/reviews';

interface Props {
  comment: string;
  customComment: string;
  showCustomComment: boolean;
  improvement: ImprovementValue;
  minLength: number;
  maxLength: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClick: (comment: CommentValue) => void;
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
}: Props) {
  return (
    <div className='w-full max-w-md flex flex-col items-center gap-3'>
      {showCustomComment ? (
        <div className='w-full flex flex-col gap-2 items-end'>
          <textarea
            name='customComment'
            id='customComment'
            onChange={onChange}
            value={customComment}
            minLength={minLength}
            maxLength={maxLength}
            placeholder={`Cuéntanos tu experiencia (mínimo ${minLength} caracteres)`}
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
        commentOptions[improvement as CommentCategory]?.map(
          ({ id, icon, label }) => {
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
                <span className='text-xl' role='img' aria-label={label}>
                  {icon}
                </span>
                {label}
              </button>
            );
          }
        )
      )}
    </div>
  );
}
