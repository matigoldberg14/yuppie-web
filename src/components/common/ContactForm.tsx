import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { Button } from '../ui/Button';

export function ContactForm() {
  const [state, handleSubmit] = useForm('mzzdwrab'); // Reemplaza "mzzdwrab" con tu ID de Formspree

  if (state.succeeded) {
    return (
      <div className="text-center p-8">
        <h3 className="text-2xl font-bold text-white mb-4">
          ¡Gracias por tu mensaje!
        </h3>
        <p className="text-white/80">
          Nos pondremos en contacto contigo pronto.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/20 
                     focus:border-white/20 transition-colors text-white placeholder-white/40"
            placeholder="Tu nombre"
          />
          <ValidationError
            prefix="Nombre"
            field="nombre"
            errors={state.errors}
            className="text-red-400 text-sm mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Apellido
          </label>
          <input
            id="apellido"
            name="apellido"
            type="text"
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/20 
                     focus:border-white/20 transition-colors text-white placeholder-white/40"
            placeholder="Tu apellido"
          />
          <ValidationError
            prefix="Apellido"
            field="apellido"
            errors={state.errors}
            className="text-red-400 text-sm mt-1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/20 
                   focus:border-white/20 transition-colors text-white placeholder-white/40"
          placeholder="tu@email.com"
        />
        <ValidationError
          prefix="Email"
          field="email"
          errors={state.errors}
          className="text-red-400 text-sm mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">
          Nombre del Negocio
        </label>
        <input
          id="negocio"
          name="negocio"
          type="text"
          required
          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/20 
                   focus:border-white/20 transition-colors text-white placeholder-white/40"
          placeholder="Nombre de tu negocio"
        />
        <ValidationError
          prefix="Negocio"
          field="negocio"
          errors={state.errors}
          className="text-red-400 text-sm mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">
          Cantidad de Locales
        </label>
        <select
          id="locales"
          name="locales"
          required
          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/20 
                   focus:border-white/20 transition-colors text-white"
        >
          <option value="">Selecciona una opción</option>
          <option value="1-5">1-5 locales</option>
          <option value="6-10">6-10 locales</option>
          <option value="11-25">11-25 locales</option>
          <option value="25+">Más de 25 locales</option>
        </select>
        <ValidationError
          prefix="Locales"
          field="locales"
          errors={state.errors}
          className="text-red-400 text-sm mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={4}
          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white/20 
                   focus:border-white/20 transition-colors text-white placeholder-white/40"
          placeholder="¿En qué podemos ayudarte?"
        />
        <ValidationError
          prefix="Mensaje"
          field="mensaje"
          errors={state.errors}
          className="text-red-400 text-sm mt-1"
        />
      </div>

      <Button
        type="submit"
        disabled={state.submitting}
        className="w-full bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white transform hover:scale-105 transition-all duration-200 hover:shadow-lg rounded-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state.submitting ? 'Enviando...' : 'Solicitar Demo'}
      </Button>
    </form>
  );
}
