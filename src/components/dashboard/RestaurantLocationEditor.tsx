// src/components/dashboard/RestaurantLocationEditor.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import { Label } from '../ui/label';
import type { Restaurant } from '../../types/restaurant';
import { MapPin, Save, MapIcon } from 'lucide-react';
import { updateRestaurantLocation as apiUpdateLocation } from '../../services/api';
import { useToast } from '../ui/use-toast';

interface LocationEditorProps {
  restaurant: Restaurant;
  onLocationUpdated: (
    location: Restaurant['location'],
    coordinates: Restaurant['coordinates']
  ) => void;
}

export const RestaurantLocationEditor: React.FC<LocationEditorProps> = ({
  restaurant,
  onLocationUpdated,
}) => {
  // Estados para los campos de ubicación
  const [location, setLocation] = useState({
    street: restaurant.location?.street || '',
    number: restaurant.location?.number || '',
    city: restaurant.location?.city || '',
    state: restaurant.location?.state || '',
    country: restaurant.location?.country || '',
    postalCode: restaurant.location?.postalCode || '',
  });

  // Estados para las coordenadas
  const [coordinates, setCoordinates] = useState({
    latitude: restaurant.coordinates?.latitude || 0,
    longitude: restaurant.coordinates?.longitude || 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Manejar cambios en los campos de ubicación
  const handleLocationChange = (
    field: keyof typeof location,
    value: string
  ) => {
    setLocation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manejar cambios en las coordenadas
  const handleCoordinateChange = (
    field: keyof typeof coordinates,
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setCoordinates((prev) => ({
        ...prev,
        [field]: numValue,
      }));
    }
  };

  // Abrir Google Maps para seleccionar ubicación
  const openGoogleMaps = () => {
    window.open('https://www.google.com/maps', '_blank');
  };

  // Guardar los cambios
  const handleSaveLocation = async () => {
    try {
      setIsSubmitting(true);

      // Validar campos obligatorios
      if (
        !location.street ||
        !location.number ||
        !location.city ||
        !location.country
      ) {
        toast({
          title: 'Campos incompletos',
          description:
            'Por favor completa los campos obligatorios de dirección',
          variant: 'destructive',
        });
        return;
      }

      // Validar coordenadas
      if (
        isNaN(coordinates.latitude) ||
        isNaN(coordinates.longitude) ||
        coordinates.latitude < -90 ||
        coordinates.latitude > 90 ||
        coordinates.longitude < -180 ||
        coordinates.longitude > 180
      ) {
        toast({
          title: 'Coordenadas inválidas',
          description:
            'Por favor ingresa coordenadas válidas (lat: -90 a 90, lng: -180 a 180)',
          variant: 'destructive',
        });
        return;
      }

      // Enviar actualización a la API
      await apiUpdateLocation(restaurant.documentId, location, coordinates);

      // Notificar éxito
      toast({
        title: 'Ubicación actualizada',
        description: 'Los datos de ubicación se han guardado correctamente',
      });

      // Notificar al componente padre
      onLocationUpdated(location, coordinates);
    } catch (error) {
      console.error('Error guardando ubicación:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la información de ubicación',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white/10 border-0 mt-4">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Ubicación del restaurante
        </CardTitle>
        <CardDescription className="text-white/60">
          Ingresa la dirección completa y las coordenadas para mostrar tu
          restaurante en el mapa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70">Calle *</Label>
              <Input
                value={location.street}
                onChange={(e) => handleLocationChange('street', e.target.value)}
                placeholder="Nombre de la calle"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white/70">Número *</Label>
              <Input
                value={location.number}
                onChange={(e) => handleLocationChange('number', e.target.value)}
                placeholder="Número"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70">Ciudad *</Label>
              <Input
                value={location.city}
                onChange={(e) => handleLocationChange('city', e.target.value)}
                placeholder="Ciudad"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white/70">Estado/Provincia</Label>
              <Input
                value={location.state}
                onChange={(e) => handleLocationChange('state', e.target.value)}
                placeholder="Estado o provincia"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70">País *</Label>
              <Input
                value={location.country}
                onChange={(e) =>
                  handleLocationChange('country', e.target.value)
                }
                placeholder="País"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white/70">Código Postal</Label>
              <Input
                value={location.postalCode}
                onChange={(e) =>
                  handleLocationChange('postalCode', e.target.value)
                }
                placeholder="Código postal"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>

          {/* Coordenadas */}
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-medium">Coordenadas GPS *</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={openGoogleMaps}
                className="bg-transparent border-white/20 text-white hover:bg-white/10 flex items-center gap-1"
              >
                <MapIcon className="h-4 w-4" />
                Abrir Maps
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Latitud</Label>
                <Input
                  value={coordinates.latitude || ''}
                  onChange={(e) =>
                    handleCoordinateChange('latitude', e.target.value)
                  }
                  placeholder="Ej: 40.416775"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white/70">Longitud</Label>
                <Input
                  value={coordinates.longitude || ''}
                  onChange={(e) =>
                    handleCoordinateChange('longitude', e.target.value)
                  }
                  placeholder="Ej: -3.703790"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="text-white/60 text-xs mt-2">
              Puedes obtener las coordenadas haciendo clic derecho en Google
              Maps y seleccionando "¿Qué hay aquí?"
            </div>
          </div>

          <Button
            onClick={handleSaveLocation}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar ubicación
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// src/services/api.ts
// Función para actualizar la ubicación completa de un restaurante

export async function updateRestaurantLocation(
  documentId: string,
  location: {
    street: string;
    number: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  },
  coordinates: {
    latitude: number;
    longitude: number;
  }
): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.API_URL}/api/restaurants/${documentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            location: {
              ...location,
            },
            coordinates: {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating location: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error in updateRestaurantLocation:', error);
    throw error;
  }
}
