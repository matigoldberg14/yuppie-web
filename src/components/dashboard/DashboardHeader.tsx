// src/components/dashboard/DashboardHeader.tsx
import { useStore } from '@nanostores/react';
import { authStore, logout } from '../../lib/firebase';
import { LogOut } from 'lucide-react';

export function DashboardHeader() {
  const { user } = useStore(authStore);

  return (
    <header className="h-16 bg-[#2F02CC]/5 border-b border-white/10 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-white">Dashboard</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/60">{user?.email}</span>
        <button
          onClick={() => logout()}
          className="text-white/60 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
