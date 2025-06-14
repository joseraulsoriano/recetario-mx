'use client';

import { useEffect, useState } from 'react';
import ShoppingOptimizer from '@/components/ShoppingOptimizer';
import { ShoppingCartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: any[];
  cost?: number;
  calories?: number;
}

export default function ShoppingOptimizerPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      // Obtener recetas guardadas
      const savedResponse = await fetch('/api/recipes');
      const savedRecipes = await savedResponse.json();
      
      // Obtener recetas sugeridas del MCP
      const mcpResponse = await fetch('/api/mcp/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objetivo: 'ahorrar',
          gustos: [],
          disgustos: []
        })
      });
      const mcpRecipes = await mcpResponse.json();
      
      // Combinar y formatear recetas
      const allRecipes = [
        ...savedRecipes.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          ingredients: r.ingredients || [],
          cost: r.cost,
          calories: r.calories
        })),
        ...mcpRecipes.map((r: any) => ({
          id: r.id || `mcp-${Math.random()}`,
          name: r.name,
          description: r.description,
          ingredients: r.ingredients || [],
          cost: r.cost,
          calories: r.calories
        }))
      ];
      
      setRecipes(allRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando recetas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedRecipe) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => setSelectedRecipe(null)}
              className="flex items-center text-orange-600 hover:text-orange-700 mb-4"
            >
              ← Volver a selección de recetas
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Optimizador de Compras
            </h1>
            <p className="text-gray-600">
              Encuentra las mejores tiendas para tus ingredientes
            </p>
          </div>
          
          <ShoppingOptimizer recipe={selectedRecipe} />
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
            🛒 Optimizador de Compras
          </h1>
          <p className="text-gray-600">
            Selecciona una receta para encontrar las mejores tiendas y precios
          </p>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar recetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Lista de recetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{recipe.name}</h3>
                <ShoppingCartIcon className="h-6 w-6 text-orange-600" />
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Ingredientes:</span>
                  <span className="font-medium">{recipe.ingredients.length}</span>
                </div>
                {recipe.cost && (
                  <div className="flex justify-between">
                    <span>Costo estimado:</span>
                    <span className="font-medium">${recipe.cost.toFixed(2)}</span>
                  </div>
                )}
                {recipe.calories && (
                  <div className="flex justify-between">
                    <span>Calorías:</span>
                    <span className="font-medium">{recipe.calories}</span>
                  </div>
                )}
              </div>
              
              <button
                className="w-full mt-4 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRecipe(recipe);
                }}
              >
                Optimizar Compras
              </button>
            </div>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron recetas' : 'No hay recetas disponibles'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Agrega algunas recetas para comenzar a optimizar tus compras'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 