'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Store {
  id: string;
  name: string;
  chain: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  hours?: string;
  rating?: number;
}

interface StoreMapProps {
  stores: Store[];
  userLocation?: { lat: number; lng: number };
  onStoreSelect?: (store: Store) => void;
  selectedChain?: string;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function StoreMap({ stores, userLocation, onStoreSelect, selectedChain }: StoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Colores para cada cadena de supermercados
  const chainColors: Record<string, string> = {
    'Walmart': '#0071ce',
    'Soriana': '#ff6b35',
    'Chedraui': '#00a651'
  };

  // Iconos personalizados para cada cadena
  const getMarkerIcon = (chain: string) => {
    const color = chainColors[chain] || '#666666';
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
          <path d="M8 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(24, 24),
      anchor: new google.maps.Point(12, 12)
    };
  };

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key no configurada');
      setIsLoading(false);
      return;
    }

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      // Centro por defecto (CDMX)
      const defaultCenter = { lat: 19.4326, lng: -99.1332 };
      const center = userLocation || defaultCenter;

      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;
      setIsLoading(false);
    }).catch((err) => {
      setError('Error cargando Google Maps');
      setIsLoading(false);
      console.error('Error loading Google Maps:', err);
    });
  }, [userLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current || !stores.length) return;

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Filtrar tiendas por cadena seleccionada
    const filteredStores = selectedChain 
      ? stores.filter(store => store.chain === selectedChain)
      : stores;

    // Crear marcadores
    filteredStores.forEach(store => {
      const marker = new google.maps.Marker({
        position: { lat: store.latitude, lng: store.longitude },
        map: mapInstanceRef.current,
        title: store.name,
        icon: getMarkerIcon(store.chain),
        animation: google.maps.Animation.DROP
      });

      // Info window para cada tienda
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: ${chainColors[store.chain]}; font-weight: bold;">
              ${store.name}
            </h3>
            <p style="margin: 4px 0; font-size: 14px;">
              <strong>${store.chain}</strong>
            </p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              ${store.address}
            </p>
            ${store.phone ? `
              <p style="margin: 4px 0; font-size: 12px;">
                📞 ${store.phone}
              </p>
            ` : ''}
            ${store.hours ? `
              <p style="margin: 4px 0; font-size: 12px;">
                🕒 ${store.hours}
              </p>
            ` : ''}
            ${store.rating ? `
              <p style="margin: 4px 0; font-size: 12px;">
                ⭐ ${store.rating}/5
              </p>
            ` : ''}
            <button 
              onclick="window.selectStore('${store.id}')"
              style="margin-top: 8px; padding: 4px 8px; background: ${chainColors[store.chain]}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
              Seleccionar Tienda
            </button>
          </div>
        `
      });

      // Event listeners
      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
        setSelectedStore(store);
      });

      // Exponer función global para el botón
      (window as any).selectStore = (storeId: string) => {
        const store = stores.find(s => s.id === storeId);
        if (store && onStoreSelect) {
          onStoreSelect(store);
        }
      };

      markersRef.current.push(marker);
    });

    // Ajustar zoom para mostrar todos los marcadores
    if (filteredStores.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filteredStores.forEach(store => {
        bounds.extend({ lat: store.latitude, lng: store.longitude });
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [stores, selectedChain, onStoreSelect]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-sm text-gray-600">
            Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu archivo .env
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96 rounded-lg shadow-lg" />
      
      {selectedStore && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-semibold text-lg mb-2">{selectedStore.name}</h3>
          <p className="text-sm text-gray-600 mb-1">{selectedStore.address}</p>
          {selectedStore.phone && (
            <p className="text-sm text-gray-600 mb-1">📞 {selectedStore.phone}</p>
          )}
          {selectedStore.hours && (
            <p className="text-sm text-gray-600 mb-1">🕒 {selectedStore.hours}</p>
          )}
          {selectedStore.rating && (
            <p className="text-sm text-gray-600 mb-2">⭐ {selectedStore.rating}/5</p>
          )}
          <button
            onClick={() => onStoreSelect?.(selectedStore)}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
          >
            Seleccionar Tienda
          </button>
        </div>
      )}
    </div>
  );
} 