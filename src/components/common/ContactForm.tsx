import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { Button } from '../ui/Button';
import { useTranslations } from '../../i18n/config';
import type { SupportedLang } from '../../i18n/config';

interface ContactFormProps {
  lang: SupportedLang;
}

export function ContactForm({ lang }: ContactFormProps) {
  const [state, handleSubmit] = useForm('mzzdwrab');
  const t = useTranslations(lang);

  if (state.succeeded) {
    return (
      <div className='text-center p-8'>
        <h3 className='text-2xl font-bold text-white mb-4'>
          {t('contact.thankYou')}
        </h3>
        <p className='text-white/80'>{t('contact.weWillContactYou')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-white/80 mb-1'>
            {t('contact.firstName')}
          </label>
          <input
            id='nombre'
            name='nombre'
            type='text'
            required
            className='w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/20 
                     focus:border-white/20 transition-colors text-white placeholder-white/40'
            placeholder={t('contact.firstNamePlaceholder')}
          />
          <ValidationError
            prefix={t('contact.firstName')}
            field='nombre'
            errors={state.errors}
            className='text-red-400 text-sm mt-1'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-white/80 mb-1'>
            {t('contact.lastName')}
          </label>
          <input
            id='apellido'
            name='apellido'
            type='text'
            required
            className='w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/20 
                     focus:border-white/20 transition-colors text-white placeholder-white/40'
            placeholder={t('contact.lastNamePlaceholder')}
          />
          <ValidationError
            prefix={t('contact.lastName')}
            field='apellido'
            errors={state.errors}
            className='text-red-400 text-sm mt-1'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-white/80 mb-1'>
          {t('contact.email')}
        </label>
        <input
          id='email'
          name='email'
          type='email'
          required
          className='w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/20 
                   focus:border-white/20 transition-colors text-white placeholder-white/40'
          placeholder={t('contact.emailPlaceholder')}
        />
        <ValidationError
          prefix={t('contact.email')}
          field='email'
          errors={state.errors}
          className='text-red-400 text-sm mt-1'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-white/80 mb-1'>
          {t('contact.businessName')}
        </label>
        <input
          id='negocio'
          name='negocio'
          type='text'
          required
          className='w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/20 
                   focus:border-white/20 transition-colors text-white placeholder-white/40'
          placeholder={t('contact.businessNamePlaceholder')}
        />
        <ValidationError
          prefix={t('contact.businessName')}
          field='negocio'
          errors={state.errors}
          className='text-red-400 text-sm mt-1'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-white/80 mb-1'>
          {t('contact.numberOfLocations')}
        </label>
        <select
          id='locales'
          name='locales'
          required
          className='w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/20 
                   focus:border-white/20 transition-colors text-white'
        >
          <option value=''>{t('contact.selectOption')}</option>
          <option value='1-5'>{t('contact.locations.1-5')}</option>
          <option value='6-10'>{t('contact.locations.6-10')}</option>
          <option value='11-25'>{t('contact.locations.11-25')}</option>
          <option value='25+'>{t('contact.locations.25+')}</option>
        </select>
        <ValidationError
          prefix={t('contact.numberOfLocations')}
          field='locales'
          errors={state.errors}
          className='text-red-400 text-sm mt-1'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-white/80 mb-1'>
          {t('contact.message')}
        </label>
        <textarea
          id='mensaje'
          name='mensaje'
          required
          rows={4}
          className='w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/20 
                   focus:border-white/20 transition-colors text-white placeholder-white/40'
          placeholder={t('contact.messagePlaceholder')}
        />
        <ValidationError
          prefix={t('contact.message')}
          field='mensaje'
          errors={state.errors}
          className='text-red-400 text-sm mt-1'
        />
      </div>

      <Button
        type='submit'
        disabled={state.submitting}
        className='w-full bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white transform hover:scale-105 transition-all duration-200 hover:shadow-lg rounded-full py-3 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {state.submitting ? t('contact.sending') : t('contact.requestDemo')}
      </Button>
    </form>
  );
}
