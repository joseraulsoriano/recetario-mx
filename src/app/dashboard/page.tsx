'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import RecipeModal from '@/components/RecipeModal';
import { generarRecetasMCP } from '@/utils/mcp';
import type { Ingredient } from '@/types/ingredient';
import MCPRunner from '@/components/MCPRunner';
import PriceUpdater from '@/components/PriceUpdater';
import MCPShoppingOptimizer from '@/components/MCPShoppingOptimizer';

interface DashboardStats {
  totalRecipes: number;
  totalIngredients: number;
  weeklyBudget: number;
  weeklySpent: number;
  upcomingExpirations: number;
}

// ID de usuario fijo para desarrollo
const DEV_USER_ID = 'dev_user_1';

const COMIDAS_DEFAULT = ['desayuno', 'comida', 'cena'];
const OPCIONES_COMIDA = [
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'comida', label: 'Comida' },
  { key: 'cena', label: 'Cena' },
  { key: 'colacion', label: 'Colación' }
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [recetas, setRecetas] = useState<any[]>([]);
  const [modalReceta, setModalReceta] = useState<any>(null);
  const [favoritas, setFavoritas] = useState<string[]>([]);
  const [mcpRecetas, setMcpRecetas] = useState<any[]>([]);
  const [comidas, setComidas] = useState<string[]>(COMIDAS_DEFAULT);
  const [menu, setMenu] = useState<Record<string, any[]>>({});
  const [menuError, setMenuError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
          throw new Error(`Error al cargar las estadísticas: ${response.status}`);
        }
        const text = await response.text(); // Primero obtenemos el texto
        if (!text) {
          throw new Error('La respuesta está vacía');
        }
        try {
          const data = JSON.parse(text);
          setStats(data);
        } catch (e) {
          console.error('Error al parsear JSON:', e, 'Respuesta recibida:', text);
          throw new Error('Error al procesar la respuesta del servidor');
        }
      } catch (error) {
        console.error('Error en fetchStats:', error);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('onboarding');
      if (data) setUserData(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    if (!userData) return;
    fetch('/api/recipes/recommended', {
      method: 'POST',
      body: JSON.stringify({
        objetivo: userData.objetivo,
        gustos: userData.gustos,
        disgustos: userData.disgustos,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then(setRecetas);
  }, [userData]);

  // Si no hay recetas recomendadas, usar MCP
  useEffect(() => {
    if (recetas.length === 0 && userData) {
      const fetchIngredientes = async () => {
        try {
          const res = await fetch('/api/ingredients?userId=dev_user_1');
          if (!res.ok) {
            throw new Error(`Error al cargar ingredientes: ${res.status}`);
          }
          const text = await res.text();
          if (!text) {
            throw new Error('La respuesta de ingredientes está vacía');
          }
          let ingredientes;
          try {
            ingredientes = JSON.parse(text);
          } catch (e) {
            console.error('Error al parsear JSON de ingredientes:', e, 'Respuesta recibida:', text);
            throw new Error('Error al procesar la respuesta de ingredientes');
          }

          if (!Array.isArray(ingredientes)) {
            throw new Error('Se esperaba un array de ingredientes');
          }

          const presupuestoDiario = Number(userData.presupuesto) / 7;
          const sugeridas = generarRecetasMCP({
            ingredientes,
            presupuestoDiario,
            gustos: userData.gustos || [],
            disgustos: userData.disgustos || [],
            objetivo: userData.objetivo || 'ahorrar'
          });
          setMcpRecetas(sugeridas);
        } catch (error) {
          console.error('Error al cargar ingredientes:', error);
          setMcpRecetas([]);
        }
      };

      fetchIngredientes();
    }
  }, [recetas, userData]);

  useEffect(() => {
    if (!userData) return;
    fetch('/api/mcp/suggestions', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'dev_user_1',
        presupuesto: userData.presupuesto,
        tiposComida: comidas,
        gustos: userData.gustos,
        disgustos: userData.disgustos,
        objetivo: userData.objetivo
      }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo generar el menú.');
        return res.json();
      })
      .then(data => {
        setMenu(data.menu);
        setMenuError(null);
      })
      .catch(err => {
        setMenuError(err.message || 'Ocurrió un error al generar el menú.');
        setMenu({});
      });
  }, [userData, comidas]);

  const handleFavorite = async (recetaId: string) => {
    await fetch('/api/recipes/favorite', {
      method: 'POST',
      body: JSON.stringify({ recipeId: recetaId, favorite: true }),
      headers: { 'Content-Type': 'application/json' },
    });
    setFavoritas((favs) => [...favs, recetaId]);
  };

  // Calcular totales
  const totalGuardadas = stats?.totalRecipes || 0;
  const totalSugeridas = menu && Object.values(menu).flat().length || 0;
  const totalRecetas = totalGuardadas + totalSugeridas;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, Chef!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Aquí está el resumen de tu recetario personal
          </p>
        </div>

        {userData && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2 text-orange-600">Tu Resumen Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Presupuesto semanal:</span> ${userData.presupuesto} MXN
              </div>
              <div>
                <span className="font-medium">Objetivo:</span> {userData.objetivo}
              </div>
              <div>
                <span className="font-medium">Te gusta:</span> {userData.gustos?.length ? userData.gustos.join(', ') : 'No especificado'}
              </div>
              <div>
                <span className="font-medium">No te gusta/alergias:</span> {userData.disgustos?.length ? userData.disgustos.join(', ') : 'No especificado'}
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Presupuesto Semanal */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Presupuesto Semanal
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          ${userData?.presupuesto || stats.weeklyBudget}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          Gastado: ${stats.weeklySpent.toFixed(2)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/budget" className="font-medium text-orange-600 hover:text-orange-500">
                    Ver detalles
                  </Link>
                </div>
              </div>
            </div>

            {/* Recetas */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de Recetas
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {totalRecetas}
                      </dd>
                      <dd className="mt-1 text-xs text-gray-500">
                        {totalGuardadas} guardadas + {totalSugeridas} sugeridas
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/recipes" className="font-medium text-orange-600 hover:text-orange-500">
                    Ver todas las recetas
                  </Link>
                </div>
              </div>
            </div>

            {/* Ingredientes */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ingredientes en Inventario
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {stats.totalIngredients}
                      </dd>
                      {stats.upcomingExpirations > 0 && (
                        <dd className="mt-1 text-sm text-red-600">
                          {stats.upcomingExpirations} por vencer
                        </dd>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm space-y-2">
                  <Link href="/ingredients" className="font-medium text-orange-600 hover:text-orange-500 block">
                    Gestionar inventario
                  </Link>
                  <Link href="/ingredients/prices" className="font-medium text-orange-600 hover:text-orange-500 block">
                    Ver y actualizar precios
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price Updater */}
        <div className="mb-8">
          <PriceUpdater userId={DEV_USER_ID} />
        </div>

        {/* MCP Runner */}
        <div className="mb-8">
          <MCPRunner
            userId={DEV_USER_ID}
            presupuesto={userData?.presupuesto || 0}
            gustos={userData?.gustos || []}
            disgustos={userData?.disgustos || []}
            objetivo={userData?.objetivo || 'ahorrar'}
            onMenuGenerated={(menu) => setMenu(menu)}
          />
        </div>

        {/* MCP Shopping Optimizer */}
        <div className="mb-8">
          <MCPShoppingOptimizer
            userId={DEV_USER_ID}
            presupuesto={userData?.presupuesto || 0}
            gustos={userData?.gustos || []}
            disgustos={userData?.disgustos || []}
            objetivo={userData?.objetivo || 'ahorrar'}
          />
        </div>

        {menuError && (
          <div className="mb-4 p-3 bg-orange-100 text-orange-800 rounded text-center font-medium">
            {menuError}
          </div>
        )}

        {/* Selector de comidas */}
        <div className="mb-6 flex flex-wrap gap-4">
          {OPCIONES_COMIDA.map(op => (
            <label key={op.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={comidas.includes(op.key)}
                onChange={e => {
                  setComidas(prev =>
                    e.target.checked
                      ? [...prev, op.key]
                      : prev.filter(c => c !== op.key)
                  );
                }}
              />
              <span className="text-sm font-medium text-gray-700">{op.label}</span>
            </label>
          ))}
        </div>

        {/* Menú sugerido por sección */}
        {comidas.map(comida => (
          <div key={comida} className="mb-8">
            <h2 className="text-lg font-bold text-orange-600 mb-2 capitalize">{comida}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {menu[comida]?.length === 0 && (
                <div className="col-span-full text-orange-500 font-semibold">No hay sugerencias para esta comida. Puede que no tengas suficientes ingredientes.</div>
              )}
              {menu[comida]?.map((receta, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-5 flex flex-col">
                  <h3 className="text-xl font-semibold text-orange-600 mb-2">{receta.name}</h3>
                  <div className="text-sm text-gray-700 mb-2">{receta.description}</div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {receta.ingredients.map((ing: any, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">{ing.name}</span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">Costo: <span className="font-medium">${receta.cost?.toFixed(2)}</span> | Calorías: <span className="font-medium">{receta.calories}</span></div>
                  <button
                    className="mt-auto bg-orange-600 text-white rounded-md px-3 py-1 text-sm font-medium hover:bg-orange-700"
                    onClick={() => setModalReceta(receta)}
                  >
                    Ver receta
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {modalReceta && (
          <RecipeModal
            receta={modalReceta}
            onClose={() => setModalReceta(null)}
            onFavorite={() => handleFavorite(modalReceta.id)}
            isFavorite={favoritas.includes(modalReceta.id)}
          />
        )}
      </div>
    </div>
  );
} 