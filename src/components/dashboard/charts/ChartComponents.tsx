// src/components/dashboard/charts/ChartComponents.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const MetricsLineChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
      <XAxis dataKey="date" stroke="#ffffff60" />
      <YAxis stroke="#ffffff60" />
      <Tooltip
        contentStyle={{
          backgroundColor: '#1a1a1a',
          border: 'none',
        }}
        labelStyle={{ color: '#fff' }}
      />
      <Line
        type="monotone"
        dataKey="reviews"
        stroke="#4318FF"
        strokeWidth={2}
        name="Reseñas"
      />
      <Line
        type="monotone"
        dataKey="rating"
        stroke="#00C49F"
        strokeWidth={2}
        name="Rating"
      />
    </LineChart>
  </ResponsiveContainer>
));

export const MetricsBarChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
      <XAxis dataKey="rating" stroke="#ffffff60" />
      <YAxis stroke="#ffffff60" />
      <Tooltip
        contentStyle={{
          backgroundColor: '#1a1a1a',
          border: 'none',
        }}
        labelStyle={{ color: '#fff' }}
      />
      <Bar dataKey="count" name="Cantidad">
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
));

export const MetricsPieChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ type, percentage }) => `${type} (${percentage.toFixed(0)}%)`}
        outerRadius={150}
        fill="#8884d8"
        dataKey="count"
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          backgroundColor: '#1a1a1a',
          border: 'none',
        }}
        labelStyle={{ color: '#fff' }}
      />
    </PieChart>
  </ResponsiveContainer>
));
