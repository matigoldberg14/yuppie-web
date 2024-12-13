// src/pages/dashboard/index.tsx
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DashboardMetrics } from '../../components/dashboard/DashboardMetrics';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardMetrics />
    </DashboardLayout>
  );
}
