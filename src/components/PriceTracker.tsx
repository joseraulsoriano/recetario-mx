import React, { useState } from 'react';
import type { Ingredient } from '@/types/ingredient';

interface PriceTrackerProps {
  ingredient: Ingredient;
  onPriceUpdate: (ingredientId: string, newPrice: number, store: string, storeUrl: string) => Promise<void>;
}

export default function PriceTracker({ ingredient, onPriceUpdate }: PriceTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newPrice, setNewPrice] = useState(ingredient.price?.toString() || '');
  const [newStore, setNewStore] = useState(ingredient.store || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onPriceUpdate(
        ingredient.id,
        parseFloat(newPrice),
        newStore,
        ingredient.storeUrl || ''
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating price:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{ingredient.name}</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            Actualizar precio
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Precio (MXN)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tienda
            </label>
            <select
              value={newStore}
              onChange={(e) => setNewStore(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              required
            >
              <option value="">Selecciona una tienda</option>
              <option value="Walmart">Walmart</option>
              <option value="Soriana">Soriana</option>
              <option value="Chedraui">Chedraui</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            Precio actual: <span className="font-medium">${ingredient.price?.toFixed(2) || 'N/A'}</span>
          </p>
          {ingredient.store && (
            <p className="text-sm text-gray-600">
              Tienda: <span className="font-medium">{ingredient.store}</span>
            </p>
          )}
          {ingredient.storeUrl && (
            <a
              href={ingredient.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              Ver en tienda →
            </a>
          )}
        </div>
      )}
    </div>
  );
} 