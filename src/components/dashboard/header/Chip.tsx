import React from 'react';

export default function Chip({
  isSelected,
  label,
}: {
  isSelected: boolean;
  label: string;
}) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-primary-dark ${
        isSelected ? 'bg-green' : 'bg-white/70'
      }`}
    >
      {label}
    </span>
  );
}
