// src/components/dashboard/DashboardSidebar.tsx
import { useStore } from '@nanostores/react';
import { authStore } from '../../lib/firebase';
import { Home, Building2, Users, MessageSquare, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const navItems = [
  {
    href: '/dashboard',
    icon: <Home className="h-5 w-5" />,
    label: 'Dashboard',
  },
  {
    href: '/dashboard/locales',
    icon: <Building2 className="h-5 w-5" />,
    label: 'Locales',
  },
  {
    href: '/dashboard/personal',
    icon: <Users className="h-5 w-5" />,
    label: 'Personal',
  },
  {
    href: '/dashboard/reviews',
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'Reviews',
  },
  {
    href: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />,
    label: 'Configuración',
  },
];

export function DashboardSidebar() {
  const { restaurant } = useStore(authStore);

  return (
    <aside className="w-64 bg-[#2F02CC] flex flex-col fixed h-full">
      <div className="h-16 flex items-center px-4 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="Yuppie" className="h-8 w-8" />
          <span className="text-lg font-semibold text-white">Yuppie</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {restaurant && (
        <div className="p-4 border-t border-white/10">
          <div className="text-sm text-white/60">
            <p className="font-medium text-white">{restaurant.name}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
