'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PriceUpdaterProps {
  userId: string;
}

interface PriceUpdate {
  ingredientId: string;
  name: string;
  prices: {
    store: string;
    price: number;
    url?: string;
    timestamp: Date;
  }[];
  bestPrice: {
    store: string;
    price: number;
    url?: string;
    timestamp: Date;
  };
}

export default function PriceUpdater({ userId }: PriceUpdaterProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updates, setUpdates] = useState<PriceUpdate[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [storeErrors, setStoreErrors] = useState<string[]>([]);

  const STORES = [
    { id: '', name: 'Todas las tiendas' },
    { id: 'Walmart', name: 'Walmart' },
    { id: 'Soriana', name: 'Soriana' },
    { id: 'Chedraui', name: 'Chedraui' }
  ];

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/prices/update');
      const data = await response.json();
      setLastUpdate(data.lastUpdate ? new Date(data.lastUpdate) : null);
    } catch (error) {
      console.error('Error verificando estado:', error);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    setError(null);
    setStoreErrors([]);
    try {
      const response = await fetch('/api/prices/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, store: selectedStore || undefined })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar precios');
      }

      const data = await response.json();
      setUpdates(data.results);
      setLastUpdate(new Date(data.lastUpdate));
      setStoreErrors(data.errors || []);
      // Actualizar la página para reflejar los cambios
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-orange-600 mb-4">Actualización de Precios</h2>
      
      {/* Estado y controles */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tienda
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              disabled={isLoading}
            >
              {STORES.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-500">
            {lastUpdate ? (
              <>Última actualización: {lastUpdate.toLocaleString()}</>
            ) : (
              'No se han actualizado los precios'
            )}
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium text-white ${
            isLoading
              ? 'bg-orange-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          {isLoading ? 'Actualizando precios...' : 'Actualizar Precios'}
        </button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      {storeErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          <div className="font-semibold mb-1">Errores por tienda:</div>
          <ul className="list-disc pl-5">
            {storeErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Resultados de la actualización */}
      {updates.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Resultados de la actualización</h3>
          <div className="space-y-3">
            {updates.map(update => (
              <div key={update.ingredientId} className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium text-gray-900">{update.name}</div>
                <div className="text-sm text-gray-600">
                  Mejor precio: {update.bestPrice.store} - ${update.bestPrice.price.toFixed(2)}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Otros precios:
                  {update.prices
                    .filter(p => p.store !== update.bestPrice.store)
                    .map((price, idx) => (
                      <span key={idx} className="ml-2">
                        {price.store}: ${price.price.toFixed(2)}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 