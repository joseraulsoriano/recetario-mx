'use client';

import { useEffect, useState } from 'react';
import { MapPinIcon, CurrencyDollarIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import StoreMap from './StoreMap';

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

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  store?: string;
  storeUrl?: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  cost?: number;
  calories?: number;
}

interface StorePrice {
  storeId: string;
  storeName: string;
  storeChain: string;
  totalPrice: number;
  availableIngredients: number;
  missingIngredients: string[];
  savings: number;
  distance?: number;
}

export default function ShoppingOptimizer({ recipe }: { recipe: Recipe }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [storePrices, setStorePrices] = useState<StorePrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StorePrice | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchStores();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (stores.length > 0 && recipe) {
      calculateStorePrices();
    }
  }, [stores, recipe]);

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores');
      const data = await response.json();
      if (response.ok) {
        setStores(data.stores);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
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

  const calculateStorePrices = async () => {
    setLoading(true);
    try {
      const storePricesData: StorePrice[] = [];

      for (const store of stores) {
        try {
          // Llamar a la API para obtener precios
          const response = await fetch('/api/stores/prices', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ingredients: recipe.ingredients,
              storeChain: store.chain
            })
          });

          if (!response.ok) {
            throw new Error('Error obteniendo precios');
          }

          const priceData = await response.json();
          
          // Calcular distancia si tenemos ubicación del usuario
          let distance: number | undefined;
          if (userLocation) {
            distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              store.latitude,
              store.longitude
            );
          }

          const missingIngredients = priceData.ingredients
            .filter((ing: any) => !ing.available)
            .map((ing: any) => ing.name);

          storePricesData.push({
            storeId: store.id,
            storeName: store.name,
            storeChain: store.chain,
            totalPrice: priceData.totalPrice,
            availableIngredients: priceData.availableCount,
            missingIngredients,
            savings: 0, // Se calculará después
            distance
          });
        } catch (error) {
          console.error(`Error obteniendo precios para ${store.name}:`, error);
          // Agregar tienda con datos por defecto
          storePricesData.push({
            storeId: store.id,
            storeName: store.name,
            storeChain: store.chain,
            totalPrice: 0,
            availableIngredients: 0,
            missingIngredients: recipe.ingredients.map(ing => ing.name),
            savings: 0,
            distance: userLocation ? calculateDistance(
              userLocation.lat,
              userLocation.lng,
              store.latitude,
              store.longitude
            ) : undefined
          });
        }
      }

      // Calcular ahorros
      const validPrices = storePricesData.filter(sp => sp.totalPrice > 0);
      if (validPrices.length > 0) {
        const maxPrice = Math.max(...validPrices.map(sp => sp.totalPrice));
        storePricesData.forEach(sp => {
          sp.savings = maxPrice - sp.totalPrice;
        });
      }

      // Ordenar por precio total (tiendas sin precios al final)
      storePricesData.sort((a, b) => {
        if (a.totalPrice === 0 && b.totalPrice === 0) return 0;
        if (a.totalPrice === 0) return 1;
        if (b.totalPrice === 0) return -1;
        return a.totalPrice - b.totalPrice;
      });
      
      setStorePrices(storePricesData);
    } catch (error) {
      console.error('Error calculating store prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      'Walmart': '#0071ce',
      'Soriana': '#ff6b35',
      'Chedraui': '#00a651'
    };
    return colors[chain] || '#666666';
  };

  const handleStoreSelect = (storePrice: StorePrice) => {
    setSelectedStore(storePrice);
    const store = stores.find(s => s.id === storePrice.storeId);
    if (store) {
      localStorage.setItem('selectedStore', JSON.stringify(store));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculando mejores precios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🛒 Optimizador de Compras
        </h2>
        <p className="text-gray-600 mb-4">
          Encuentra las mejores tiendas para comprar los ingredientes de "{recipe.name}"
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{recipe.ingredients.length}</div>
            <div className="text-sm text-gray-600">Ingredientes</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${storePrices[0]?.totalPrice.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-600">Mejor precio</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              ${storePrices[0]?.savings.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-600">Ahorro potencial</div>
          </div>
        </div>
      </div>

      {/* Mapa con tiendas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación de Tiendas</h3>
        <StoreMap
          stores={stores}
          userLocation={userLocation || undefined}
          onStoreSelect={(store) => {
            const storePrice = storePrices.find(sp => sp.storeId === store.id);
            if (storePrice) {
              handleStoreSelect(storePrice);
            }
          }}
        />
      </div>

      {/* Lista de tiendas ordenadas por precio */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparación de Precios</h3>
        
        <div className="space-y-4">
          {storePrices.map((storePrice, index) => (
            <div
              key={storePrice.storeId}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedStore?.storeId === storePrice.storeId 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200'
              }`}
              onClick={() => handleStoreSelect(storePrice)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{storePrice.storeName}</h4>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="inline-block px-2 py-1 text-xs font-medium text-white rounded"
                        style={{ backgroundColor: getChainColor(storePrice.storeChain) }}
                      >
                        {storePrice.storeChain}
                      </div>
                      {storePrice.distance && (
                        <span className="text-sm text-gray-500">
                          📍 {storePrice.distance.toFixed(1)} km
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${storePrice.totalPrice.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {storePrice.availableIngredients}/{recipe.ingredients.length} ingredientes
                  </div>
                  {storePrice.savings > 0 && (
                    <div className="text-sm text-green-600">
                      Ahorras ${storePrice.savings.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {storePrice.missingIngredients.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                  <div className="text-sm text-yellow-800">
                    <strong>Ingredientes faltantes:</strong> {storePrice.missingIngredients.join(', ')}
                  </div>
                </div>
              )}

              <div className="mt-3 flex justify-end">
                <button
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStoreSelect(storePrice);
                  }}
                >
                  Seleccionar Tienda
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detalles de la tienda seleccionada */}
      {selectedStore && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tienda Seleccionada: {selectedStore.storeName}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Resumen de Compra</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total de ingredientes:</span>
                  <span>{selectedStore.availableIngredients}/{recipe.ingredients.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio total:</span>
                  <span className="font-semibold">${selectedStore.totalPrice.toFixed(2)}</span>
                </div>
                {selectedStore.savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Ahorro:</span>
                    <span className="font-semibold">${selectedStore.savings.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Lista de Compras</h4>
              <div className="space-y-1">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>• {ingredient.name} ({ingredient.quantity} {ingredient.unit})</span>
                    <span className="text-gray-500">
                      {selectedStore.missingIngredients.includes(ingredient.name) 
                        ? '❌ No disponible' 
                        : '✅ Disponible'
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 