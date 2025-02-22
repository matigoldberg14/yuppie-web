// src/data/features.ts
import {
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  BoltIcon,
  StarIcon,
  ArrowRightIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Feature {
  title: string;
  description: string;
  icon: any;
}

export const features: Feature[] = [
  {
    title: 'Feedback en Tiempo Real',
    description: 'Recibe y gestiona comentarios de tus clientes al instante',
    icon: ChatBubbleBottomCenterTextIcon,
  },
  {
    title: 'Análisis Detallado',
    description: 'Métricas y estadísticas para mejorar tu negocio',
    icon: ChartBarIcon,
  },
  {
    title: 'Respuesta Rápida',
    description: 'Actúa inmediatamente ante las opiniones de tus clientes',
    icon: BoltIcon,
  },
];
