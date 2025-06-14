'use client';
import React, { useState } from 'react';
import { parseNutritionalInfo } from '@/types/ingredient';
import ShoppingOptimizer from './ShoppingOptimizer';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function RecipeModal({ receta, onClose, onFavorite, isFavorite }: {
  receta: any;
  onClose: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
}) {
  const [showShoppingOptimizer, setShowShoppingOptimizer] = useState(false);
  const totalCalorias = receta.ingredients.reduce((sum: number, ing: any) => {
    const nutritionalInfo = parseNutritionalInfo(ing.nutritionalInfo);
    return sum + (nutritionalInfo?.calories || 0);
  }, 0);
  const totalPrecio = receta.ingredients.reduce((sum: number, ing: any) => sum + (ing.price || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-orange-600" onClick={onClose}>✕</button>
        
        {!showShoppingOptimizer ? (
          <>
            <h2 className="text-2xl font-bold mb-2 text-orange-600">{receta.name}</h2>
            <p className="mb-2 text-gray-700">{receta.description}</p>
            <div className="mb-2 text-sm text-gray-500">Calorías totales: <span className="font-semibold">{totalCalorias}</span></div>
            <div className="mb-2 text-sm text-gray-500">Precio estimado: <span className="font-semibold">${totalPrecio.toFixed(2)}</span></div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Ingredientes:</h3>
              <ul className="list-disc pl-5">
                {receta.ingredients.map((ing: any, idx: number) => {
                  const nutritionalInfo = parseNutritionalInfo(ing.nutritionalInfo);
                  return (
                    <li key={idx}>
                      {ing.name} ({ing.unit}) - ${ing.price || 0} - {nutritionalInfo?.calories || 0} cal
                    </li>
                  );
                })}
              </ul>
            </div>

            {receta.instructions && (
              <div className="mb-4">
                <h3 className="font-semibold mb-1">Instrucciones:</h3>
                <p className="text-gray-700">{receta.instructions}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={onFavorite}
                className={`px-4 py-2 rounded-md ${
                  isFavorite 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isFavorite ? '❤️ Favorita' : '🤍 Agregar a favoritos'}
              </button>
              
              <button
                onClick={() => setShowShoppingOptimizer(true)}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Optimizar Compras
              </button>
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-orange-600">
                Optimizar Compras: {receta.name}
              </h2>
              <button
                onClick={() => setShowShoppingOptimizer(false)}
                className="text-gray-400 hover:text-orange-600"
              >
                ← Volver a receta
              </button>
            </div>
            
            <ShoppingOptimizer recipe={receta} />
          </div>
        )}
      </div>
    </div>
  );
} 