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

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const MetricsLineChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
      <XAxis dataKey="date" stroke="#ffffff60" tickFormatter={formatDate} />
      <YAxis stroke="#ffffff60" />
      <Tooltip
        contentStyle={{
          backgroundColor: '#1a1a1a',
          border: 'none',
          padding: '10px',
          borderRadius: '4px',
        }}
        labelStyle={{ color: '#fff', marginBottom: '5px' }}
        labelFormatter={formatDate}
        formatter={(value: number, name: string) => [
          name === 'rating' ? value.toFixed(2) : value,
          name === 'rating' ? 'Rating promedio' : 'Total de reseñas',
        ]}
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

export const MetricsBarChart = React.memo(({ data }: { data: any[] }) => {
  const isDayAnalysis = data.some((item) => item.day);

  const days: Record<string, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };

  const formatDay = (value: string): string => {
    const key = value.toLowerCase();
    return key in days ? days[key] : value;
  };

  if (isDayAnalysis) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis dataKey="day" stroke="#ffffff60" tickFormatter={formatDay} />
          <YAxis stroke="#ffffff60" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: 'none',
              padding: '10px',
              borderRadius: '4px',
            }}
            labelStyle={{ color: '#fff', marginBottom: '5px' }}
            formatter={(value: number, name: string) => {
              if (name === 'count') return [`${value} reseñas`, 'Cantidad'];
              if (name === 'rating')
                return [`${value.toFixed(2)} ⭐`, 'Rating promedio'];
              return [value, name];
            }}
            labelFormatter={(label: string) => `Día: ${formatDay(label)}`}
          />
          <Bar dataKey="count" name="count" fill="#4318FF" />
          <Bar dataKey="rating" name="rating" fill="#00C49F" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
        <XAxis dataKey="rating" stroke="#ffffff60" />
        <YAxis stroke="#ffffff60" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: 'none',
            padding: '10px',
            borderRadius: '4px',
          }}
          labelStyle={{ color: '#fff' }}
          formatter={(value: number) => [`${value} reseñas`, 'Cantidad']}
          labelFormatter={(label) => `${label} estrellas`}
        />
        <Bar dataKey="count" name="Cantidad">
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

export const MetricsPieChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ type, percentage }) => `${type} (${percentage.toFixed(1)}%)`}
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
          padding: '10px',
          borderRadius: '4px',
        }}
        labelStyle={{ color: '#fff' }}
        formatter={(value: number, name: string, props: any) => [
          value,
          `Total de ${props.payload.type}`,
        ]}
      />
    </PieChart>
  </ResponsiveContainer>
));
