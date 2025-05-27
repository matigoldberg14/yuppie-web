import { useState, useEffect } from 'react';
import { authClientes } from '@/lib/firebaseClientes';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { createCliente } from '@/services/api';

const TABS = [
  { label: 'Iniciar sesión', value: 'login' },
  { label: 'Registrarse', value: 'register' },
];

function getRedirectUrl() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || '/';
  }
  return '/';
}

export default function LoginCliente({ onCancel }: { onCancel?: () => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Escuchar usuario logueado de Firebase Clientes
  useEffect(() => {
    if (authClientes) {
      const unsubscribe = onAuthStateChanged(authClientes, (user) => {
        setUser(user);
      });
      return () => unsubscribe();
    }
  }, []);

  // Handler para login o registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!authClientes) throw new Error('Firebase no inicializado');
      const redirectUrl = getRedirectUrl();
      if (tab === 'login') {
        const res = await signInWithEmailAndPassword(
          authClientes,
          email,
          password
        );
        setUser(res.user);
        window.location.href = redirectUrl;
      } else {
        const res = await createUserWithEmailAndPassword(
          authClientes,
          email,
          password
        );
        setUser(res.user);
        console.log('Registrando cliente en Strapi...', {
          name: `${firstName} ${lastName}`.trim(),
          email,
          firebase_uid: res.user.uid,
        });
        try {
          const strapiRes = await createCliente({
            name: `${firstName} ${lastName}`.trim(),
            email,
            firebaseUID: res.user.uid,
            level: 'cliente',
            registeredAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          });
          console.log('Respuesta de Strapi:', strapiRes);
          setToast('¡Cliente creado en Strapi!');
        } catch (err) {
          console.error('Error al crear cliente en Strapi:', err);
          setToast('Error al crear cliente en Strapi');
        }
        setToast(null);
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  // Handler para Google
  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      if (!authClientes) throw new Error('Firebase no inicializado');
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(authClientes, provider);
      setUser(res.user);
      const redirectUrl = getRedirectUrl();
      if (tab === 'register') {
        setToast('Intentando crear cliente en Strapi con Google...');
        setTimeout(() => setToast(null), 10000);
        console.log('Registrando cliente en Strapi (Google)...', {
          name: res.user.displayName || res.user.email || '',
          email: res.user.email || '',
          firebase_uid: res.user.uid,
        });
        try {
          const strapiRes = await createCliente({
            name: res.user.displayName || res.user.email || '',
            email: res.user.email || '',
            firebaseUID: res.user.uid,
            level: 'cliente',
            registeredAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          });
          console.log('Respuesta de Strapi (Google):', strapiRes);
          setToast('¡Cliente creado en Strapi!');
        } catch (err) {
          console.error('Error al crear cliente en Strapi (Google):', err);
          setToast('Error al crear cliente en Strapi');
        }
        setToast(null);
        window.location.href = redirectUrl;
      } else {
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      setError(err.message || 'Error con Google');
      console.error('Error con Google:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler para logout
  const handleLogout = async () => {
    setUser(null);
    if (authClientes) await signOut(authClientes);
  };

  if (user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1440] to-[#2e1a7a]">
        <div className="w-full max-w-sm card flex flex-col gap-6 shadow-xl p-6 items-center">
          <span className="text-2xl font-bold text-white mb-2">
            ¡Hola, {user.displayName || user.email}!
          </span>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <span className="font-bold text-lg" style={{ color: '#39DFB2' }}>
              300
            </span>
            <span className="text-lg" style={{ color: '#39DFB2' }}>
              🐔
            </span>
          </div>
          <button
            className="button w-full mt-6"
            onClick={handleLogout}
            type="button"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1440] to-[#2e1a7a]">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-black/90 text-white px-6 py-3 rounded-xl shadow-lg z-50 text-center text-base animate-fade-in">
          {toast}
        </div>
      )}
      <form
        className="w-full max-w-sm card flex flex-col gap-6 shadow-xl p-6"
        onSubmit={handleSubmit}
      >
        {/* Tabs */}
        <div className="flex bg-white/10 rounded-xl overflow-hidden mb-2">
          {TABS.map((t) => (
            <button
              key={t.value}
              className={`flex-1 py-2 text-base font-medium transition-all duration-150 ${
                tab === t.value
                  ? 'bg-white/20 text-white'
                  : 'bg-transparent text-white/60'
              }`}
              onClick={() => setTab(t.value as 'login' | 'register')}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Inputs */}
        {tab === 'register' && (
          <>
            <input
              type="text"
              placeholder="Nombre"
              className="input mb-2"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
            <input
              type="text"
              placeholder="Apellido"
              className="input mb-2"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          className="input mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="input mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
        />
        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm text-center">{error}</div>
        )}
        {/* Botón principal */}
        <button
          className="button w-full"
          disabled={
            loading ||
            !email ||
            !password ||
            (tab === 'register' && (!firstName || !lastName))
          }
          type="submit"
        >
          {loading
            ? 'Cargando...'
            : tab === 'login'
            ? 'Iniciar sesión'
            : 'Crear cuenta'}
        </button>
        {/* Separador */}
        <div className="flex items-center gap-2 my-2">
          <hr className="flex-1 border-white/20" />
          <span className="text-white/40 text-xs">o</span>
          <hr className="flex-1 border-white/20" />
        </div>
        {/* Google */}
        <button
          className="button w-full bg-white/10 text-white flex items-center justify-center gap-2 hover:bg-white/20"
          disabled={loading}
          type="button"
          onClick={handleGoogle}
        >
          <img src="/google.svg" alt="Google" className="w-8 h-8" /> Continuar
          con Google
        </button>
        {/* Cancelar */}
        <button
          className="w-full py-2 text-white/60 rounded-lg font-medium text-base hover:underline mt-2"
          type="button"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
