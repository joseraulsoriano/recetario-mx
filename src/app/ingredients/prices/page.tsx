'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import PriceTracker from '@/components/PriceTracker';
import type { Ingredient } from '@/types/ingredient';

export default function IngredientPrices() {
  const { data: session } = useSession();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch('/api/ingredients');
        if (!response.ok) throw new Error('Error al cargar ingredientes');
        const data = await response.json();
        setIngredients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchIngredients();
    }
  }, [session]);

  const handlePriceUpdate = async (
    ingredientId: string,
    newPrice: number,
    store: string,
    storeUrl: string
  ) => {
    try {
      const response = await fetch(`/api/ingredients/${ingredientId}/price`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice, store, storeUrl }),
      });

      if (!response.ok) throw new Error('Error al actualizar precio');

      const updatedIngredient = await response.json();
      setIngredients(prev =>
        prev.map(ing =>
          ing.id === ingredientId ? updatedIngredient : ing
        )
      );
    } catch (err) {
      console.error('Error updating price:', err);
      throw err;
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Por favor inicia sesión para ver los precios
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Cargando precios...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">
              Error: {error}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Precios de Ingredientes
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Actualiza los precios de tus ingredientes para obtener sugerencias más precisas
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map(ingredient => (
            <PriceTracker
              key={ingredient.id}
              ingredient={ingredient}
              onPriceUpdate={handlePriceUpdate}
            />
          ))}
        </div>

        {ingredients.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-600">
              No tienes ingredientes registrados aún.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 