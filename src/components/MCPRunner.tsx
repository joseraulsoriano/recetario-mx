'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MCPRunnerProps {
  userId: string;
  presupuesto: number;
  gustos: string[];
  disgustos: string[];
  objetivo: string;
  onMenuGenerated?: (menu: any) => void;
}

export default function MCPRunner({
  userId,
  presupuesto,
  gustos,
  disgustos,
  objetivo,
  onMenuGenerated
}: MCPRunnerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Opciones avanzadas
  const [maxRecetasPorComida, setMaxRecetasPorComida] = useState(5);
  const [incluirRecetasGuardadas, setIncluirRecetasGuardadas] = useState(true);
  const [actualizarPrecios, setActualizarPrecios] = useState(false);
  const [comidasSeleccionadas, setComidasSeleccionadas] = useState(['desayuno', 'comida', 'cena']);

  const COMIDAS = [
    { id: 'desayuno', label: 'Desayuno' },
    { id: 'comida', label: 'Comida' },
    { id: 'cena', label: 'Cena' },
    { id: 'colacion', label: 'Colación' }
  ];

  const handleRunMCP = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mcp/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          presupuesto,
          comidas: comidasSeleccionadas,
          gustos,
          disgustos,
          objetivo,
          maxRecetasPorComida,
          incluirRecetasGuardadas,
          actualizarPrecios
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar el menú');
      }

      const data = await response.json();
      setStats(data.stats);
      if (onMenuGenerated) {
        onMenuGenerated(data.menu);
      }
      
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
      <h2 className="text-xl font-semibold text-orange-600 mb-4">Generador de Menú</h2>
      
      {/* Opciones avanzadas */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comidas a incluir
          </label>
          <div className="flex flex-wrap gap-2">
            {COMIDAS.map(comida => (
              <label key={comida.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={comidasSeleccionadas.includes(comida.id)}
                  onChange={(e) => {
                    setComidasSeleccionadas(prev =>
                      e.target.checked
                        ? [...prev, comida.id]
                        : prev.filter(c => c !== comida.id)
                    );
                  }}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">{comida.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Máximo de recetas por comida
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={maxRecetasPorComida}
            onChange={(e) => setMaxRecetasPorComida(Number(e.target.value))}
            className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="incluirGuardadas"
            checked={incluirRecetasGuardadas}
            onChange={(e) => setIncluirRecetasGuardadas(e.target.checked)}
            className="rounded text-orange-600 focus:ring-orange-500"
          />
          <label htmlFor="incluirGuardadas" className="text-sm text-gray-700">
            Incluir recetas guardadas
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="actualizarPrecios"
            checked={actualizarPrecios}
            onChange={(e) => setActualizarPrecios(e.target.checked)}
            className="rounded text-orange-600 focus:ring-orange-500"
          />
          <label htmlFor="actualizarPrecios" className="text-sm text-gray-700">
            Actualizar precios de ingredientes
          </label>
        </div>
      </div>

      {/* Botón de ejecución */}
      <button
        onClick={handleRunMCP}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-md font-medium text-white ${
          isLoading
            ? 'bg-orange-400 cursor-not-allowed'
            : 'bg-orange-600 hover:bg-orange-700'
        }`}
      >
        {isLoading ? 'Generando menú...' : 'Generar Menú'}
      </button>

      {/* Mensaje de error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Estadísticas</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Total recetas</div>
              <div className="font-medium">{stats.totalRecetas}</div>
            </div>
            <div>
              <div className="text-gray-500">Costo promedio</div>
              <div className="font-medium">${stats.promedioCosto.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-500">Ingredientes usados</div>
              <div className="font-medium">{stats.ingredientesUsados}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 