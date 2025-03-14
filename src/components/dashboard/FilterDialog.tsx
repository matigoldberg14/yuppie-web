// src/components/dashboard/FilterDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import { Filter, X, Check } from 'lucide-react';
import { Badge } from '../ui/badge';

// Componente personalizado Slider
const Slider = ({
  value,
  min,
  max,
  step,
  onValueChange,
  className,
}: {
  value: number[];
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number[]) => void;
  className?: string;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    // Utilizamos el índice proporcionado si hay múltiples valores, o 0 por defecto
    onValueChange([newValue]);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className={`w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer ${
        className || ''
      }`}
    />
  );
};

// Componente personalizado para manejar rangos de valores
const RangeSlider = ({
  values,
  min,
  max,
  step,
  onValueChange,
  className,
}: {
  values: number[];
  min: number;
  max: number;
  step: number;
  onValueChange: (values: number[]) => void;
  className?: string;
}) => {
  if (values.length !== 2) {
    throw new Error('RangeSlider expects exactly 2 values');
  }

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), values[1] - step);
    onValueChange([newMin, values[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), values[0] + step);
    onValueChange([values[0], newMax]);
  };

  return (
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={values[0]}
        onChange={handleMinChange}
        className={`absolute w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer z-10 ${
          className || ''
        }`}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={values[1]}
        onChange={handleMaxChange}
        className={`absolute w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer z-20 ${
          className || ''
        }`}
      />
    </div>
  );
};

// Componente personalizado Checkbox
const Checkbox = ({
  id,
  checked,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => {
  return (
    <div
      onClick={() => onCheckedChange(!checked)}
      className={`w-5 h-5 flex items-center justify-center rounded cursor-pointer border ${
        checked ? 'bg-blue-500 border-blue-600' : 'bg-white/10 border-white/30'
      }`}
    >
      {checked && <Check className="h-4 w-4 text-white" />}
    </div>
  );
};

export interface FilterOptions {
  minRating: number;
  maxRating: number;
  minReviews: number;
  maxReviews?: number;
  minConversion?: number;
  cities?: string[];
  onlyPositive?: boolean;
}

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  options: FilterOptions;
  onChange: (options: FilterOptions) => void;
  availableCities: string[];
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onClose,
  options,
  onChange,
  availableCities,
}) => {
  // Estado local para gestionar los cambios antes de aplicarlos
  const [localOptions, setLocalOptions] = useState<FilterOptions>({
    ...options,
  });

  // Restablecer estado local cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      setLocalOptions({ ...options });
    }
  }, [isOpen, options]);

  // Manejar cambio en un campo específico
  const handleChange = (field: keyof FilterOptions, value: any) => {
    setLocalOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manejar cambio en el array de ciudades
  const toggleCity = (city: string) => {
    const cities = localOptions.cities || [];
    if (cities.includes(city)) {
      handleChange(
        'cities',
        cities.filter((c) => c !== city)
      );
    } else {
      handleChange('cities', [...cities, city]);
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    onChange(localOptions);
    onClose();
  };

  // Restablecer todos los filtros
  const resetFilters = () => {
    const defaultOptions: FilterOptions = {
      minRating: 0,
      maxRating: 5,
      minReviews: 0,
      cities: [],
    };
    setLocalOptions(defaultOptions);
    onChange(defaultOptions);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-md">
        <DialogTitle className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5" />
          Filtros Avanzados
        </DialogTitle>

        <div className="space-y-5 my-4">
          {/* Filtros de calificación */}
          <div className="space-y-3">
            <Label className="text-sm text-white/70">Calificación</Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={0}
                max={5}
                step={0.5}
                value={localOptions.minRating}
                onChange={(e) =>
                  handleChange(
                    'minRating',
                    Math.min(parseFloat(e.target.value), localOptions.maxRating)
                  )
                }
                className="bg-white/5 border-white/10 w-16"
              />
              <div className="flex-1 h-10 flex items-center">
                <RangeSlider
                  values={[localOptions.minRating, localOptions.maxRating]}
                  min={0}
                  max={5}
                  step={0.5}
                  onValueChange={(values) => {
                    handleChange('minRating', values[0]);
                    handleChange('maxRating', values[1]);
                  }}
                  className="flex-1"
                />
              </div>
              <Input
                type="number"
                min={0}
                max={5}
                step={0.5}
                value={localOptions.maxRating}
                onChange={(e) =>
                  handleChange(
                    'maxRating',
                    Math.max(parseFloat(e.target.value), localOptions.minRating)
                  )
                }
                className="bg-white/5 border-white/10 w-16"
              />
            </div>
          </div>

          {/* Filtros de reseñas */}
          <div className="space-y-3">
            <Label className="text-sm text-white/70">
              Número mínimo de reseñas
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={localOptions.minReviews}
                onChange={(e) =>
                  handleChange('minReviews', parseInt(e.target.value))
                }
                className="bg-white/5 border-white/10 w-20"
              />
              <div className="flex-1">
                <Slider
                  value={[localOptions.minReviews]}
                  min={0}
                  max={500}
                  step={10}
                  onValueChange={(value) =>
                    handleChange('minReviews', value[0])
                  }
                />
              </div>
            </div>
          </div>

          {/* Filtros de conversión */}
          <div className="space-y-3">
            <Label className="text-sm text-white/70">
              Tasa de conversión mínima (%)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={localOptions.minConversion || 0}
                onChange={(e) =>
                  handleChange('minConversion', parseInt(e.target.value))
                }
                className="bg-white/5 border-white/10 w-20"
              />
              <div className="flex-1">
                <Slider
                  value={[localOptions.minConversion || 0]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) =>
                    handleChange('minConversion', value[0])
                  }
                />
              </div>
            </div>
          </div>

          {/* Filtros de ubicación */}
          <div className="space-y-3">
            <Label className="text-sm text-white/70">Ubicaciones</Label>
            <div className="flex flex-wrap gap-2">
              {availableCities.map((city) => {
                const isSelected = (localOptions.cities || []).includes(city);
                return (
                  <Badge
                    key={city}
                    onClick={() => toggleCity(city)}
                    className={`cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {city}
                    {isSelected && <X className="h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Filtros adicionales */}
          <div className="space-y-3">
            <Label className="text-sm text-white/70">
              Opciones adicionales
            </Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="onlyPositive"
                checked={localOptions.onlyPositive || false}
                onCheckedChange={(checked) =>
                  handleChange('onlyPositive', checked)
                }
              />
              <label
                htmlFor="onlyPositive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white cursor-pointer"
                onClick={() =>
                  handleChange(
                    'onlyPositive',
                    !(localOptions.onlyPositive || false)
                  )
                }
              >
                Solo reseñas positivas (≥4)
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Restablecer filtros
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={applyFilters}
              className="bg-white text-black hover:bg-white/90 flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Aplicar filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
