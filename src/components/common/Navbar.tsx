// src/components/common/Navbar.tsx
import React from 'react';
import { Button } from '../ui/Button';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslations } from '../../i18n/config';
import type { SupportedLang } from '../../i18n/config';

interface NavbarProps {
  lang: SupportedLang;
}

export const Navbar = ({ lang }: NavbarProps) => {
  const t = useTranslations(lang);

  return (
    <header className='fixed w-full z-50 bg-black/10 backdrop-blur-md border-b border-white/10'>
      <div className='container mx-auto px-4 h-20 flex items-center justify-between'>
        <a href={`/${lang}`} className='flex items-center space-x-2'>
          <img src='/logo.png' alt='Yuppie Logo' className='h-8 w-auto' />
        </a>

        <nav className='hidden md:flex items-center space-x-8'>
          <a
            href='#caracteristicas'
            className='text-white/80 hover:text-white transition-colors'
          >
            {t('nav.features')}
          </a>
          <a
            href='#como-funciona'
            className='text-white/80 hover:text-white transition-colors'
          >
            {t('nav.howItWorks')}
          </a>
          <a
            href='#precios'
            className='text-white/80 hover:text-white transition-colors'
          >
            {t('nav.pricing')}
          </a>
        </nav>

        <div className='flex items-center space-x-4'>
          <LanguageSwitcher currentLang={lang} />
          <a href={`/${lang}/login`}>
            <Button variant='ghost'>{t('auth.login')}</Button>
          </a>
          <a href={`/${lang}/register`}>
            <Button variant='secondary'>{t('auth.register')}</Button>
          </a>
        </div>
      </div>
    </header>
  );
};
