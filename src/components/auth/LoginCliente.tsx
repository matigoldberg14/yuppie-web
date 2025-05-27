import { useState } from 'react';
import { authClientes } from '@/lib/firebaseClientes';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import type { User } from 'firebase/auth';

const TABS = [
  { label: 'Iniciar sesión', value: 'login' },
  { label: 'Registrarse', value: 'register' },
];

export default function LoginCliente({ onCancel }: { onCancel?: () => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  // Handler para login o registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!authClientes) throw new Error('Firebase no inicializado');
      if (tab === 'login') {
        const res = await signInWithEmailAndPassword(
          authClientes,
          email,
          password
        );
        setUser(res.user);
      } else {
        const res = await createUserWithEmailAndPassword(
          authClientes,
          email,
          password
        );
        setUser(res.user);
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
      console.log('Intentando login con Google...');
      const res = await signInWithPopup(authClientes, provider);
      setUser(res.user);
      console.log('Login con Google exitoso', res.user);
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
    if (authClientes) await authClientes.signOut();
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
          disabled={loading || !email || !password}
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
          <span className="text-lg">{'G'}</span> Continuar con Google
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
