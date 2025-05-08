// src/lib/performance/LazyComponents.ts
import { lazy } from 'react';

export const LazyLineChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.LineChart }))
);

export const LazyBarChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.BarChart }))
);

export const LazyPieChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.PieChart }))
);
