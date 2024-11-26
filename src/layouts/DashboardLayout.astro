---
// src/layouts/DashboardLayout.astro
import { Icon } from 'astro-icon/components';

interface Props {
  title: string;
}

const { title } = Astro.props;

const navItems = [
  { href: '/dashboard', icon: 'lucide:home', label: 'Dashboard' },
  { href: '/dashboard/locales', icon: 'lucide:building-2', label: 'Locales' },
  { href: '/dashboard/personal', icon: 'lucide:users', label: 'Personal' },
  { href: '/dashboard/reviews', icon: 'lucide:message-square', label: 'Reviews' },
  { href: '/dashboard/settings', icon: 'lucide:settings', label: 'Configuración' },
];

// Detectar la ruta actual
const currentPath = Astro.url.pathname;
---

<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | Yuppie Dashboard</title>
  </head>
  <body class="min-h-screen bg-[#1a1a1a]">
    <div class="flex min-h-screen">
      <!-- Sidebar -->
      <aside class="w-64 bg-[#2F02CC] flex flex-col">
        <div class="h-16 flex items-center px-4 border-b border-white/10">
          <a href="/dashboard" class="flex items-center gap-2">
            <img src="/logo.png" alt="Yuppie" class="h-8 w-8" />
            <span class="text-lg font-semibold text-white">Yuppie</span>
          </a>
        </div>

        <nav class="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <a
              href={item.href}
              class={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${currentPath === item.href 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'}
              `}
            >
              <Icon name={item.icon} class="h-5 w-5" />
              <span class="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>

        <div class="p-4 border-t border-white/10">
          <!-- User info aquí -->
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 flex flex-col">
        <header class="h-16 bg-[#2F02CC]/5 border-b border-white/10 flex items-center px-6">
          <h1 class="text-xl font-semibold text-white">{title}</h1>
        </header>

        <main class="flex-1 overflow-y-auto p-6">
          <slot />
        </main>
      </div>
    </div>
  </body>
</html>