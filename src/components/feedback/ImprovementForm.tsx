import { getImprovementOptions } from '@/data/Reviews';
import type { ImprovementValue } from '@/types/reviews';
import { useTranslations } from '../../i18n/config';
import type { SupportedLang } from '../../i18n/config';

interface Props {
  onClick: (improvement: ImprovementValue) => void;
  lang: SupportedLang;
}

export default function ImprovementForm({ onClick, lang }: Props) {
  const t = useTranslations(lang);
  return (
    <div className='w-full max-w-md flex flex-col items-center gap-3'>
      {getImprovementOptions(lang).map(({ id, icon }) => (
        <button
          key={id}
          className='w-full p-4 rounded-lg flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors text-white'
          onClick={() => onClick(id as ImprovementValue)}
        >
          <span
            className='text-xl'
            role='img'
            aria-label={t(`feedback.improvements.categories.${id}`)}
          >
            {icon}
          </span>
          {t(`feedback.improvements.categories.${id}`)}
        </button>
      ))}
    </div>
  );
}
