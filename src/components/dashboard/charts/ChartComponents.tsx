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

// Tooltip personalizado para LineChart
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#1a1a1a',
          padding: '10px',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
        }}
      >
        <p
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '5px',
            marginBottom: '5px',
          }}
        >
          <b>{formatDate(label)}</b>
        </p>
        {payload.map((entry: any, index: number) => (
          <p
            key={`item-${index}`}
            style={{ color: entry.color, margin: '5px 0' }}
          >
            {entry.name === 'Rating' ? 'Rating promedio' : 'Total de reseñas'}:{' '}
            <b>{entry.value}</b>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Tooltip personalizado para BarChart (días)
const CustomDayBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
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

    return (
      <div
        style={{
          backgroundColor: '#1a1a1a',
          padding: '10px',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
        }}
      >
        <p
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '5px',
            marginBottom: '5px',
          }}
        >
          <b>Día: {formatDay(label)}</b>
        </p>
        {payload.map((entry: any, index: number) => (
          <p
            key={`item-${index}`}
            style={{ color: entry.color, margin: '5px 0' }}
          >
            {entry.name === 'rating'
              ? 'Rating promedio'
              : 'Cantidad de reseñas'}
            : <b>{entry.value}</b>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Tooltip personalizado para BarChart (ratings)
const CustomRatingBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#1a1a1a',
          padding: '10px',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
        }}
      >
        <p
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '5px',
            marginBottom: '5px',
          }}
        >
          <b>{label} estrellas</b>
        </p>
        {payload.map((entry: any, index: number) => (
          <p
            key={`item-${index}`}
            style={{ color: entry.color, margin: '5px 0' }}
          >
            Cantidad: <b>{entry.value} reseñas</b>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Tooltip personalizado para PieChart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: '#1a1a1a',
          padding: '10px',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
        }}
      >
        <p
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '5px',
            marginBottom: '5px',
          }}
        >
          <b>{data.type}</b>
        </p>
        <p style={{ color: payload[0].color, margin: '5px 0' }}>
          Total: <b>{data.count}</b>
        </p>
        <p style={{ color: payload[0].color, margin: '5px 0' }}>
          Porcentaje: <b>{data.percentage.toFixed(1)}%</b>
        </p>
      </div>
    );
  }
  return null;
};

export const MetricsLineChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
      <XAxis dataKey="date" stroke="#ffffff60" tickFormatter={formatDate} />
      <YAxis stroke="#ffffff60" />
      <Tooltip content={<CustomLineTooltip />} />
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

  if (isDayAnalysis) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis dataKey="day" stroke="#ffffff60" />
          <YAxis stroke="#ffffff60" />
          <Tooltip content={<CustomDayBarTooltip />} />
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
        <Tooltip content={<CustomRatingBarTooltip />} />
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
      <Tooltip content={<CustomPieTooltip />} />
    </PieChart>
  </ResponsiveContainer>
));
