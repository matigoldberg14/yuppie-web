// src/components/reviews/ReviewFilters.tsx
import React from 'react';
import { Button } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Filter, SortAsc } from 'lucide-react';

interface ReviewFiltersProps {
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
}

export function ReviewFilters({
  onFilterChange,
  onSortChange,
}: ReviewFiltersProps) {
  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-white">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onFilterChange('all')}>
            Todas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange('positive')}>
            5 estrellas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange('negative')}>
            1-2 estrellas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange('neutral')}>
            3-4 estrellas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-white">
            <SortAsc className="h-4 w-4 mr-2" />
            Ordenar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onSortChange('date')}>
            Por fecha
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('rating')}>
            Por calificación
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
