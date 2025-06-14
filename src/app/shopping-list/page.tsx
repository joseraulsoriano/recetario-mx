'use client';

import { useShoppingList } from '@/context/ShoppingListContext';
import { TrashIcon, ShoppingCartIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function ShoppingListPage() {
  const { shoppingList, removeFromShoppingList, clearShoppingList } = useShoppingList();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ShoppingCartIcon className="h-8 w-8 text-orange-600 mr-2" /> Lista de Compras Optimizada
          </h1>
          {shoppingList.length > 0 && (
            <button
              onClick={clearShoppingList}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <TrashIcon className="h-5 w-5 mr-2" /> Limpiar lista
            </button>
          )}
        </div>

        {shoppingList.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay compras optimizadas
            </h3>
            <p className="text-gray-600">
              Usa el optimizador MCP o el optimizador de compras para agregar recetas optimizadas aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {shoppingList.map((item, idx) => (
              <div key={item.recipe.id} className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-orange-600 mb-1">{item.recipe.name}</h2>
                  <div className="text-gray-700 mb-2">{item.recipe.description}</div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>{item.store.name} ({item.store.chain})</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    Precio total: <span className="font-semibold text-green-600">${item.totalPrice.toFixed(2)}</span>
                    {item.savings > 0 && (
                      <span className="ml-4 text-green-700">Ahorro: ${item.savings.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    Ingredientes:
                    <ul className="list-disc pl-5">
                      {item.recipe.ingredients.map((ing: any, i: number) => (
                        <li key={i}>{ing.name} ({ing.quantity} {ing.unit})</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                  <button
                    onClick={() => removeFromShoppingList(item.recipe.id)}
                    className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" /> Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 