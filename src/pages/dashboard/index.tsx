// src/pages/dashboard/index.astro
import DashboardLayout from '../../layouts/DashboardLayout.astro';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Select } from '../../components/ui/select';
import { Icon } from 'astro-icon/components';

// Simulación de datos
const metrics = {
  totalReviews: 245,
  averageRating: 4.8,
  totalTaps: 1250,
  responseRate: 78,
};

const periods = [
  { value: 'today', label: 'Hoy' },
  { value: 'this-week', label: 'Esta semana' },
  { value: 'this-month', label: 'Este mes' },
  { value: 'last-month', label: 'Mes anterior' },
];

const locations = [
  { value: 'all', label: 'Todos los locales' },
  // Aquí irían tus locales
];

<DashboardLayout title="Dashboard">
  <div class="space-y-6">
    <!-- Filtros -->
    <div class="flex items-center justify-between">
      <Select
        client:load
        value="this-month"
        options={periods}
        placeholder="Seleccionar periodo"
        className="w-[180px]"
      />
      
      <Select
        client:load
        value="all"
        options={locations}
        placeholder="Seleccionar local"
        className="w-[180px]"
      />
    </div>

    <!-- Métricas principales -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white/60">Total Reviews</CardTitle>
          <Icon name="lucide:message-square" class="h-4 w-4 text-white/60" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-white">{metrics.totalReviews}</div>
          <p class="text-xs text-green-500">+12.5% vs. periodo anterior</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white/60">Rating Promedio</CardTitle>
          <Icon name="lucide:star" class="h-4 w-4 text-white/60" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-white">{metrics.averageRating}</div>
          <p class="text-xs text-green-500">+0.3 vs. periodo anterior</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white/60">Total Taps</CardTitle>
          <Icon name="lucide:users" class="h-4 w-4 text-white/60" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-white">{metrics.totalTaps}</div>
          <p class="text-xs text-green-500">+18.2% vs. periodo anterior</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white/60">Tasa de Respuesta</CardTitle>
          <Icon name="lucide:trending-up" class="h-4 w-4 text-white/60" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-white">{metrics.responseRate}%</div>
          <p class="text-xs text-green-500">+5.4% vs. periodo anterior</p>
        </CardContent>
      </Card>
    </div>

  </div>
</DashboardLayout>

