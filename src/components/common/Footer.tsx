// src/components/common/Footer.tsx
import React from 'react';
import { useTranslations } from '../../i18n/config';
import type { SupportedLang } from '../../i18n/config';

interface FooterProps {
  lang: SupportedLang;
}

export const Footer = ({ lang }: FooterProps) => {
  const t = useTranslations(lang);

  return (
    <footer className='py-12 px-4 border-t border-white/10'>
      <div className='container mx-auto'>
        <div className='grid md:grid-cols-4 gap-8 mb-8'>
          <div>
            <img
              src='/logo.png'
              alt='Yuppie Logo'
              className='h-8 w-auto mb-4'
            />
            <p className='text-sm text-white/60'>{t('footer.tagline')}</p>
          </div>

          <div>
            <h4 className='font-semibold mb-4'>{t('footer.product.title')}</h4>
            <ul className='space-y-2'>
              <li>
                <a
                  href={`/${lang}#caracteristicas`}
                  className='text-white/60 hover:text-white'
                >
                  {t('footer.product.features')}
                </a>
              </li>
              <li>
                <a
                  href={`/${lang}#precios`}
                  className='text-white/60 hover:text-white'
                >
                  {t('footer.product.pricing')}
                </a>
              </li>
              <li>
                <a
                  href={`/${lang}/guides`}
                  className='text-white/60 hover:text-white'
                >
                  {t('footer.product.guides')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold mb-4'>{t('footer.company.title')}</h4>
            <ul className='space-y-2'>
              <li>
                <a
                  href={`/${lang}/about`}
                  className='text-white/60 hover:text-white'
                >
                  {t('footer.company.about')}
                </a>
              </li>
              <li>
                <a
                  href={`/${lang}/blog`}
                  className='text-white/60 hover:text-white'
                >
                  {t('footer.company.blog')}
                </a>
              </li>
              <li>
                <a
                  href={`/${lang}/contact`}
                  className='text-white/60 hover:text-white'
                >
                  {t('footer.company.contact')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold mb-4'>{t('footer.legal.title')}</h4>
            <ul className='space-y-2'>
              <li>
                <a
                  href={`/${lang}/privacy`}
                  className='text-white/60 hover:text-white'
                >
                  {t('footer.legal.privacy')}
                </a>
              </li>
              <li>
                <a
                  href={`/${lang}/tyc`}
                  className='text-white/60 hover:text-white'
                >
                  {t('footer.legal.terms')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className='text-center text-sm text-white/60'>
          <p>
            &copy; {new Date().getFullYear()} Yuppie. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};
