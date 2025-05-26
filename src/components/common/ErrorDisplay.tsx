// src/components/common/ErrorDisplay.tsx
import { useTranslations } from '../../i18n/config';
import type { SupportedLang } from '../../i18n/config';

interface ErrorDisplayProps {
  error: Error;
  lang: SupportedLang;
}

export function ErrorDisplay({ error, lang }: ErrorDisplayProps) {
  const t = useTranslations(lang);

  return (
    <div className='p-6 text-center'>
      <div className='bg-red-500/10 text-red-500 p-4 rounded-lg'>
        <h3 className='text-lg font-semibold mb-2'>{t('error.loadingData')}</h3>
        <p>{error.message}</p>
      </div>
    </div>
  );
}
