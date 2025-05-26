import { translations } from './ui';

export const defaultLang = 'es';
export const supportedLangs = ['en', 'es'] as const;
export type SupportedLang = (typeof supportedLangs)[number];

export const langNames: Record<SupportedLang, string> = {
  en: 'English',
  es: 'Español',
};

export const defaultNS = 'common';
export const cookieName = 'i18nlang';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (supportedLangs.includes(lang as SupportedLang))
    return lang as SupportedLang;
  return defaultLang;
}

type TranslationValue = string | string[] | { [key: string]: TranslationValue };

export function useTranslations(lang: SupportedLang) {
  return function t(key: string) {
    const keys = key.split('.');
    let value: TranslationValue = translations[lang];

    for (const k of keys) {
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        k in value
      ) {
        value = value[k];
      } else {
        // Si no encontramos la traducción en el idioma actual, intentamos con el idioma por defecto
        value = translations[defaultLang];
        for (const k2 of keys) {
          if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            k2 in value
          ) {
            value = value[k2];
          } else {
            return key; // Si no encontramos la traducción, devolvemos la clave
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  };
}
