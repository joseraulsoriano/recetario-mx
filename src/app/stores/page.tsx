'use client';

import { useEffect, useState } from 'react';
import StoreMap from '@/components/StoreMap';
import { MapPinIcon, FunnelIcon, StarIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';

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

interface StoreStats {
  total: number;
  byChain: Record<string, number>;
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [stats, setStats] = useState<StoreStats>({ total: 0, byChain: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Cadenas disponibles
  const chains = ['Walmart', 'Soriana', 'Chedraui'];
  
  // Ciudades disponibles
  const cities = ['Ciudad de México', 'Guadalajara', 'Monterrey'];

  useEffect(() => {
    fetchStores();
    getUserLocation();
  }, [selectedChain, selectedCity]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedChain) params.append('chain', selectedChain);
      if (selectedCity) params.append('city', selectedCity);
      
      const response = await fetch(`/api/stores?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setStores(data.stores);
        setStats(data.stats);
      } else {
        setError(data.error || 'Error al cargar las tiendas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error obteniendo ubicación:', error);
        }
      );
    }
  };

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
    // Aquí podrías guardar la tienda seleccionada en el estado global o localStorage
    localStorage.setItem('selectedStore', JSON.stringify(store));
  };

  const clearFilters = () => {
    setSelectedChain('');
    setSelectedCity('');
  };

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      'Walmart': '#0071ce',
      'Soriana': '#ff6b35',
      'Chedraui': '#00a651'
    };
    return colors[chain] || '#666666';
  };

  if (loading && stores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando tiendas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🗺️ Mapa de Tiendas
          </h1>
          <p className="text-gray-600">
            Encuentra las tiendas más cercanas para hacer tu super
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total de tiendas</div>
          </div>
          {chains.map(chain => (
            <div key={chain} className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold" style={{ color: getChainColor(chain) }}>
                {stats.byChain[chain] || 0}
              </div>
              <div className="text-sm text-gray-600">{chain}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                {showFilters ? 'Ocultar' : 'Mostrar'} filtros
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cadena de supermercados
                  </label>
                  <select
                    value={selectedChain}
                    onChange={(e) => setSelectedChain(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Todas las cadenas</option>
                    {chains.map(chain => (
                      <option key={chain} value={chain}>{chain}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Todas las ciudades</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mapa */}
        <div className="mb-6">
          <StoreMap
            stores={stores}
            userLocation={userLocation || undefined}
            onStoreSelect={handleStoreSelect}
            selectedChain={selectedChain || undefined}
          />
        </div>

        {/* Lista de tiendas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map(store => (
            <div
              key={store.id}
              className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedStore?.id === store.id ? 'ring-2 ring-orange-500' : ''
              }`}
              onClick={() => handleStoreSelect(store)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{store.name}</h3>
                  <div 
                    className="inline-block px-2 py-1 text-xs font-medium text-white rounded"
                    style={{ backgroundColor: getChainColor(store.chain) }}
                  >
                    {store.chain}
                  </div>
                </div>
                {store.rating && (
                  <div className="flex items-center text-sm text-gray-600">
                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                    {store.rating}
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{store.address}</span>
                </div>
                
                {store.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                )}
                
                {store.hours && (
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{store.hours}</span>
                  </div>
                )}
              </div>
              
              <button
                className="w-full mt-4 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStoreSelect(store);
                }}
              >
                Seleccionar Tienda
              </button>
            </div>
          ))}
        </div>

        {stores.length === 0 && !loading && (
          <div className="text-center py-12">
            <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron tiendas
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros o busca en otra ciudad
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 