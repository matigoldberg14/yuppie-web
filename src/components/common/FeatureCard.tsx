// src/components/common/FeatureCard.tsx
import React from 'react';
import { Card, CardContent, CardTitle, CardDescription } from '../ui/card';

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <Card className="card hover:scale-105 transition-transform duration-300">
      <CardContent className="p-6">
        <Icon className="w-12 h-12 mb-4 text-white/80" />
        <CardTitle className="mb-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
};
