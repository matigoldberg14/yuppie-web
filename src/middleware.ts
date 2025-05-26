import { defineMiddleware } from 'astro:middleware';
import { defaultLang, supportedLangs, type SupportedLang } from './i18n/config';
import type { MiddlewareHandler } from 'astro';

export const onRequest = defineMiddleware(async (context, next) => {
  const host = context.request.headers.get('host');
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  if (host === 'yuppiecx.com' && !pathname.startsWith('/en')) {
    return context.redirect(`/en${pathname}${url.search}`, 302);
  }

  if (
    ((host === 'localhost:4321' && !pathname.startsWith('/en')) ||
      host === 'yuppiecx.com.ar') &&
    !pathname.startsWith('/es')
  ) {
    return context.redirect(`/es${pathname}${url.search}`, 302);
  }

  // Skip middleware for static assets
  if (
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api')
  ) {
    return next();
  }

  // Get language from URL or cookie
  let lang: SupportedLang = defaultLang;
  const pathParts = pathname.split('/');

  if (supportedLangs.includes(pathParts[1] as SupportedLang)) {
    lang = pathParts[1] as SupportedLang;
  } else {
    // Try to get language from cookie
    const cookieLang = context.cookies.get('i18nlang')?.value;
    if (cookieLang && supportedLangs.includes(cookieLang as SupportedLang)) {
      lang = cookieLang as SupportedLang;
    } else {
      // Try to get language from Accept-Language header
      const acceptLanguage = context.request.headers.get('accept-language');
      if (acceptLanguage) {
        const preferredLang = acceptLanguage
          .split(',')[0]
          .split('-')[0]
          .toLowerCase();
        if (supportedLangs.includes(preferredLang as SupportedLang)) {
          lang = preferredLang as SupportedLang;
        }
      }
    }

    // Redirect to the language-specific URL
    if (pathname === '/') {
      return context.redirect(`/${lang}`);
    } else {
      return context.redirect(`/${lang}${pathname}`);
    }
  }

  // Set the language cookie
  context.cookies.set('i18nlang', lang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return next();
});
