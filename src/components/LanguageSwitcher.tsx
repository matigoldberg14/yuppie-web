import { useCallback } from 'react';
import { supportedLangs, langNames, type SupportedLang } from '../i18n/config';
import { useTranslations } from '../i18n/config';

interface LanguageSwitcherProps {
  currentLang: SupportedLang;
}

export default function LanguageSwitcher({
  currentLang,
}: LanguageSwitcherProps) {
  const t = useTranslations(currentLang);

  const switchLanguage = useCallback((lang: SupportedLang) => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');

    // Replace the language code in the URL
    if (supportedLangs.includes(pathParts[1] as SupportedLang)) {
      pathParts[1] = lang;
    } else {
      pathParts.splice(1, 0, lang);
    }

    const newPath = pathParts.join('/');
    window.location.pathname = newPath;
  }, []);

  return (
    <div className='relative inline-block text-left'>
      <div>
        <button
          type='button'
          className='inline-flex items-center justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
          id='language-menu-button'
          aria-expanded='true'
          aria-haspopup='true'
        >
          {t('language.current')}: {langNames[currentLang]}
        </button>
      </div>

      <div
        className='absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
        role='menu'
        aria-orientation='vertical'
        aria-labelledby='language-menu-button'
        tabIndex={-1}
      >
        <div className='py-1' role='none'>
          {supportedLangs.map((lang) => (
            <button
              key={lang}
              onClick={() => switchLanguage(lang)}
              className={`${
                currentLang === lang
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700'
              } block w-full px-4 py-2 text-left text-sm hover:bg-gray-50`}
              role='menuitem'
              tabIndex={-1}
            >
              {langNames[lang]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
