// src/components/dashboard/RestaurantMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { useTranslations } from '../../i18n/config';
import type { SupportedLang } from '../../i18n/config';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface FilterOptions {
  minRating: number;
  maxRating: number;
  minReviews: number;
  minConversion?: number;
  cities?: string[];
  onlyPositive?: boolean;
}

interface RestaurantMetrics {
  totalReviews?: number;
  averageRating?: number;
  conversionRate?: number;
}

export interface RestaurantLocation {
  id: number;
  name: string;
  coordinates: Coordinates;
  documentId: string;
  metrics?: RestaurantMetrics;
  address?: string;
}

export interface RestaurantMapProps {
  restaurants: RestaurantLocation[];
  selectedRestaurantId?: string;
  onRestaurantClick?: (restaurantId: string) => void;
  className?: string;
  onNeedCoordinates?: (restaurantId: string) => void;
  lang: SupportedLang;
}

/* Usamos los tipos oficiales de Google Maps (asegúrate de tener @types/google.maps instalado) */
declare global {
  interface Window {
    google: typeof google & {
      maps: {
        marker?: {
          AdvancedMarkerElement: any;
        };
      };
    };
  }
}

/* Función singleton mejorada para cargar la API de Google Maps */
let googleMapsPromise: Promise<void> | null = null;
let retryCount = 0;
const MAX_RETRIES = 3;

function loadGoogleMaps(apiKey: string): Promise<void> {
  // Si ya está cargado, retornar promesa resuelta
  if (window.google && window.google.maps && window.google.maps.Map) {
    console.log('Google Maps API ya está cargada');
    return Promise.resolve();
  }

  // Si hay una promesa pendiente, devolverla
  if (googleMapsPromise !== null) {
    return googleMapsPromise;
  }

  // Crear nueva promesa para cargar la API
  googleMapsPromise = new Promise((resolve, reject) => {
    console.log('Iniciando carga de Google Maps API...');

    // Función para verificar si la API está lista
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps && window.google.maps.Map) {
        console.log('Google Maps API cargada exitosamente');
        clearInterval(checkInterval);
        resolve();
        return true;
      }
      return false;
    };

    // Función para cargar el script
    const loadScript = () => {
      console.log(`Intento ${retryCount + 1} de cargar Google Maps API`);

      // Limpiar cualquier script anterior si existe
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=googleMapsCallback`;
      script.async = true;
      script.defer = true;

      // Crear un callback global que será llamado cuando el script se cargue
      (window as any).googleMapsCallback = () => {
        console.log('Callback de Google Maps ejecutado');
        if (checkGoogleMapsLoaded()) {
          delete (window as any).googleMapsCallback;
        }
      };

      // Manejar errores de carga
      script.onerror = () => {
        console.error(
          `Error al cargar Google Maps API (intento ${retryCount + 1})`
        );
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(loadScript, 1000); // Esperar 1 segundo antes de reintentar
        } else {
          reject(
            new Error(
              `Failed to load Google Maps API after ${MAX_RETRIES} attempts`
            )
          );
          googleMapsPromise = null; // Resetear para permitir futuros intentos
        }
      };

      // Añadir el script al documento
      document.head.appendChild(script);
    };

    // Verificar primero si ya está cargado
    if (checkGoogleMapsLoaded()) {
      return;
    }

    // Verificar periódicamente si la API está lista
    const checkInterval = setInterval(checkGoogleMapsLoaded, 100);

    // Configurar un timeout para evitar esperar indefinidamente
    setTimeout(() => {
      if (!window.google || !window.google.maps || !window.google.maps.Map) {
        clearInterval(checkInterval);
        console.warn('Timeout esperando Google Maps API, reiniciando carga...');
        loadScript();
      }
    }, 2000);

    // Iniciar la carga si no hay un script existente
    if (
      !document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')
    ) {
      loadScript();
    }
  });

  return googleMapsPromise;
}

/**
 * Función global para verificar si las coordenadas son válidas
 * Latitud: -90 a 90, Longitud: -180 a 180
 */
const areValidCoordinates = (lat: number, lng: number): boolean => {
  // Verificar primero que son números válidos y no NaN
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    isNaN(lat) ||
    isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return false;
  }
  return true;
};

/**
 * Función para normalizar coordenadas - versión simplificada
 * Solo asegura que las coordenadas estén dentro de los rangos válidos
 */
const normalizeCoordinates = (coordinates: Coordinates): Coordinates => {
  // Si las coordenadas son inválidas, devuelve coordenadas por defecto para Buenos Aires
  if (!areValidCoordinates(coordinates.latitude, coordinates.longitude)) {
    console.warn(
      'Coordenadas inválidas detectadas, usando valores predeterminados'
    );
    return { latitude: -34.61, longitude: -58.44 };
  }

  // Limitar a rangos válidos
  const validLat = Math.max(-90, Math.min(90, coordinates.latitude));
  const validLng = Math.max(-180, Math.min(180, coordinates.longitude));

  // Si tuvo que corregir, mostrar advertencia
  if (validLat !== coordinates.latitude || validLng !== coordinates.longitude) {
    console.warn('Coordenadas corregidas:', {
      original: coordinates,
      corregido: { latitude: validLat, longitude: validLng },
    });
  }

  return { latitude: validLat, longitude: validLng };
};

const RestaurantMap: React.FC<RestaurantMapProps> = ({
  restaurants,
  selectedRestaurantId,
  onRestaurantClick,
  onNeedCoordinates,
  className = 'h-[300px]',
  lang,
}) => {
  const t = useTranslations(lang);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [missingCoordinates, setMissingCoordinates] = useState<string[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  // Procesar restaurantes con coordenadas INMUTABLES
  // Esto es crucial para evitar ciclos de renderizado infinitos
  const validRestaurants = restaurants
    .filter((restaurant) => {
      // Verificación más robusta de coordenadas
      if (!restaurant.coordinates) {
        console.warn(`Restaurante sin coordenadas: ${restaurant.name}`);
        return false;
      }

      const { latitude, longitude } = restaurant.coordinates;

      // Verificar que sean números y no NaN
      const isValid =
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        !isNaN(latitude) &&
        !isNaN(longitude) &&
        areValidCoordinates(latitude, longitude);

      if (!isValid) {
        console.warn(
          `Coordenadas inválidas para ${restaurant.name}:`,
          restaurant.coordinates
        );
      }

      return isValid;
    })
    .map((restaurant) => {
      // Asegurarse de normalizar las coordenadas
      const normalizedCoords = normalizeCoordinates(restaurant.coordinates);

      // Crear copia para no modificar el objeto original
      return {
        ...restaurant,
        coordinates: normalizedCoords,
      };
    });

  // Log de depuración de coordenadas
  useEffect(() => {
    if (restaurants.length > 0) {
      console.log('===== COORDENADAS DE RESTAURANTES =====');
      restaurants.forEach((r) => {
        console.log(`${r.name}:`, {
          coordenadas: r.coordinates,
          es_valido: r.coordinates
            ? areValidCoordinates(
                r.coordinates.latitude,
                r.coordinates.longitude
              )
            : false,
        });
      });
    }
  }, [restaurants]);

  // Estilos para animación de rebote (agregar solo una vez)
  useEffect(() => {
    const bounceStyle = document.createElement('style');
    bounceStyle.innerHTML = `
      @keyframes bounce {
        from { transform: translateY(0); }
        to { transform: translateY(-10px); }
      }
      .custom-marker {
        cursor: pointer;
        transition: transform 0.2s;
      }
      .custom-marker:hover {
        transform: scale(1.2);
      }
    `;

    if (!document.head.querySelector('style#map-marker-styles')) {
      bounceStyle.id = 'map-marker-styles';
      document.head.appendChild(bounceStyle);
    }

    return () => {
      if (document.head.querySelector('style#map-marker-styles')) {
        document.head.querySelector('style#map-marker-styles')?.remove();
      }
    };
  }, []);

  // Inicializar el mapa cuando el componente se monta
  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      setLoadError(null);

      try {
        console.log('Iniciando carga de Google Maps...');

        // Intentar cargar la API de Google Maps
        await loadGoogleMaps(import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY || '');

        if (!isMounted) return;

        // Verificar que la API esté realmente disponible
        if (!window.google || !window.google.maps || !window.google.maps.Map) {
          console.error(
            'Google Maps API no está completamente cargada después de la carga'
          );
          setLoadError('No se pudo cargar la API de Google Maps');
          setIsLoading(false);
          return;
        }

        console.log('Google Maps API cargada, inicializando mapa...');

        // Inicializar el mapa
        if (mapRef.current) {
          if (initMap()) {
            console.log('Mapa inicializado correctamente');
            setIsMapLoaded(true);
          } else {
            console.error('Fallo al inicializar el mapa');
            setLoadError('Error al inicializar el mapa');
          }
        } else {
          console.error('Referencia del mapa no disponible');
          setLoadError('Error: Contenedor del mapa no disponible');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error al cargar Google Maps API:', error);
        setLoadError(
          `Error: ${error instanceof Error ? error.message : 'Desconocido'}`
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Función para inicializar el mapa
  const initMap = (): boolean => {
    try {
      if (!mapRef.current) {
        console.error('Referencia del mapa no disponible en initMap');
        return false;
      }

      console.log('Creando instancia del mapa...');

      // Definir un centro predeterminado global (por ejemplo, en medio del mapa mundial)
      let center = { lat: 0, lng: 0 };
      let defaultZoom = 2; // Zoom más alejado para ver más del mapa

      if (validRestaurants.length > 0) {
        // Si hay restaurantes válidos, usar el primero como centro
        center = {
          lat: validRestaurants[0].coordinates.latitude,
          lng: validRestaurants[0].coordinates.longitude,
        };
        defaultZoom = 12; // Zoom más cercano para una ubicación específica
        console.log(
          `Centrando mapa en restaurante: "${validRestaurants[0].name}" [${center.lat}, ${center.lng}]`
        );
      } else {
        console.log(
          'No hay restaurantes con coordenadas válidas. Mostrando mapa mundial.'
        );
      }

      // Configuración del mapa
      const mapOptions: google.maps.MapOptions = {
        center,
        zoom: defaultZoom,
        styles: [
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#ffffff' }],
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#000000' }, { lightness: 13 }],
          },
          {
            featureType: 'administrative',
            elementType: 'geometry.fill',
            stylers: [{ color: '#000000' }],
          },
          {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#144b53' }, { lightness: 14 }, { weight: 1.4 }],
          },
          {
            featureType: 'landscape',
            elementType: 'all',
            stylers: [{ color: '#08304b' }],
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ color: '#0c4152' }, { lightness: 5 }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [{ color: '#000000' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#0b434f' }, { lightness: 25 }],
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry.fill',
            stylers: [{ color: '#000000' }],
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#0b3d51' }, { lightness: 16 }],
          },
          {
            featureType: 'road.local',
            elementType: 'geometry',
            stylers: [{ color: '#000000' }],
          },
          {
            featureType: 'transit',
            elementType: 'all',
            stylers: [{ color: '#146474' }],
          },
          {
            featureType: 'water',
            elementType: 'all',
            stylers: [{ color: '#021019' }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
      };

      // Crear la instancia del mapa
      mapInstanceRef.current = new window.google.maps.Map(
        mapRef.current,
        mapOptions
      );

      // Identificar restaurantes sin coordenadas válidas
      const missing = restaurants
        .filter(
          (r) => !validRestaurants.some((vr) => vr.documentId === r.documentId)
        )
        .map((r) => r.documentId);

      setMissingCoordinates(missing);
      return true;
    } catch (error) {
      console.error('Error en initMap:', error);
      return false;
    }
  };

  console.log('COORDENADAS ORIGINALES ENVIADAS AL MAPA:');
  restaurants.forEach((r) => {
    console.log(
      `${r.name}: [${r.coordinates.latitude}, ${r.coordinates.longitude}]`
    );
  });
  // Actualizar marcadores cuando cambian los datos o se selecciona un restaurante
  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current && validRestaurants.length > 0) {
      createAdvancedMarkers(validRestaurants);
    }
  }, [isMapLoaded, validRestaurants, selectedRestaurantId, onRestaurantClick]);

  // Función para crear los marcadores
  const createAdvancedMarkers = (restaurants: RestaurantLocation[]) => {
    // Verificar que la API está disponible
    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      console.error(
        'Google Maps API no está disponible en createAdvancedMarkers'
      );
      return;
    }

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => {
      if (marker) marker.setMap(null);
    });
    markersRef.current = [];

    if (!mapInstanceRef.current) return;

    // Crear bounds con verificación
    const bounds = new window.google.maps.LatLngBounds();

    restaurants.forEach((restaurant) => {
      // Usar objeto literal directamente
      const position = {
        lat: restaurant.coordinates.latitude,
        lng: restaurant.coordinates.longitude,
      };

      // Extender bounds con la posición (convertir a LatLng primero)
      const latLng = new window.google.maps.LatLng(position.lat, position.lng);
      bounds.extend(latLng);

      // Contenido del InfoWindow
      const contentString = `
        <div style="padding: 10px; max-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${
            restaurant.name
          }</h3>
          ${
            restaurant.address
              ? `<p style="margin: 3px 0; font-size: 12px; color: #666;">${restaurant.address}</p>`
              : ''
          }
          ${
            restaurant.metrics
              ? `<div style="font-size: 12px; margin-top: 5px;">
                <p style="margin: 3px 0;">Reseñas: ${
                  restaurant.metrics.totalReviews || 0
                }</p>
                <p style="margin: 3px 0;">Rating: ${(
                  restaurant.metrics.averageRating || 0
                ).toFixed(1)}/5</p>
                <p style="margin: 3px 0;">Conversión: ${(
                  restaurant.metrics.conversionRate || 0
                ).toFixed(1)}%</p>
              </div>`
              : ''
          }
        </div>
      `;

      const isSelected = selectedRestaurantId === restaurant.documentId;

      // Verificar si la API avanzada está disponible
      if (
        window.google.maps.marker &&
        window.google.maps.marker.AdvancedMarkerElement
      ) {
        // Crear elemento para el marcador avanzado
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.style.width = '20px';
        markerElement.style.height = '20px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.backgroundColor = isSelected
          ? '#4318FF'
          : '#FF4500';
        markerElement.style.border = '2px solid #ffffff';
        markerElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

        // Animar si está seleccionado
        if (isSelected) {
          markerElement.style.animation = 'bounce 0.8s infinite alternate';
        }

        // Crear marcador avanzado
        const advancedMarker =
          new window.google.maps.marker.AdvancedMarkerElement({
            position,
            map: mapInstanceRef.current,
            title: restaurant.name,
            content: markerElement,
          });

        // InfoWindow para el marcador
        const infowindow = new window.google.maps.InfoWindow({
          content: contentString,
          ariaLabel: restaurant.name,
        });

        // Event listener para el clic
        advancedMarker.addListener('click', () => {
          // Cerrar otros infowindows
          markersRef.current.forEach((m: any) => {
            if (m.infowindow) m.infowindow.close();
          });

          // Abrir infowindow y llamar al callback
          infowindow.open({
            anchor: advancedMarker,
            map: mapInstanceRef.current!,
          });

          if (onRestaurantClick) onRestaurantClick(restaurant.documentId);
        });

        // Guardar referencia al infowindow
        (advancedMarker as any).infowindow = infowindow;
        markersRef.current.push(advancedMarker);
      } else {
        // Fallback a marcadores tradicionales si AdvancedMarkerElement no está disponible
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current!,
          title: restaurant.name,
          animation: isSelected
            ? window.google.maps.Animation.BOUNCE
            : (null as any),
          icon: {
            path: (window.google.maps.SymbolPath as any).CIRCLE,
            fillColor: isSelected ? '#4318FF' : '#FF4500',
            fillOpacity: 0.9,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            scale: 10,
          },
        });

        // InfoWindow para el marcador tradicional
        const infowindow = new window.google.maps.InfoWindow({
          content: contentString,
          ariaLabel: restaurant.name,
        });

        // Event listener para el clic
        marker.addListener('click', () => {
          markersRef.current.forEach((m: any) => {
            if (m.infowindow) m.infowindow.close();
          });

          infowindow.open({
            anchor: marker,
            map: mapInstanceRef.current!,
          });

          if (onRestaurantClick) onRestaurantClick(restaurant.documentId);
        });

        // Guardar referencia al infowindow
        (marker as any).infowindow = infowindow;
        markersRef.current.push(marker);
      }
    });

    // Ajustar el mapa para mostrar todos los marcadores
    if (restaurants.length > 1) {
      mapInstanceRef.current.fitBounds(bounds);
    } else if (restaurants.length === 1) {
      // Usar objeto literal para center
      mapInstanceRef.current.setCenter({
        lat: restaurants[0].coordinates.latitude,
        lng: restaurants[0].coordinates.longitude,
      });
      mapInstanceRef.current.setZoom(15);
    }
  };

  // Centrar mapa en el restaurante seleccionado
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    // Actualizar estado de selección (esto reconstruirá los marcadores)
    if (validRestaurants.length > 0) {
      createAdvancedMarkers(validRestaurants);

      // Centrar mapa en el restaurante seleccionado
      if (selectedRestaurantId) {
        const selectedRestaurant = validRestaurants.find(
          (r) => r.documentId === selectedRestaurantId
        );

        if (selectedRestaurant) {
          mapInstanceRef.current.panTo({
            lat: selectedRestaurant.coordinates.latitude,
            lng: selectedRestaurant.coordinates.longitude,
          });
        }
      }
    }
  }, [selectedRestaurantId, validRestaurants, isMapLoaded]);

  // Manejar el clic en botón de agregar coordenadas
  const handleAddCoordinates = (id: string) => {
    if (onNeedCoordinates) onNeedCoordinates(id);
  };

  if (mapError) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}
      >
        <div className='text-center p-4'>
          <AlertCircle className='h-8 w-8 text-red-500 mx-auto mb-2' />
          <p className='text-red-500'>{t('map.error')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`${className} rounded-lg overflow-hidden`}
      role='img'
      aria-label={t('map.ariaLabel')}
    />
  );
};

export default RestaurantMap;
