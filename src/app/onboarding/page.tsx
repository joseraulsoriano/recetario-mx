'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const objetivos = [
  { id: 'ahorrar', label: 'Ahorrar en la comida' },
  { id: 'saludable', label: 'Comer más saludable' },
  { id: 'rapido', label: 'Comidas rápidas y fáciles' },
  { id: 'variado', label: 'Más variedad en mis comidas' }
];

const ingredientesPopulares = [
  'Pollo', 'Huevo', 'Nopales', 'Pozole', 'Cacahuate', 'Pescado', 'Tortilla'
];

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`px-3 py-1 rounded-full border mr-2 mb-2 text-sm font-medium transition
        ${selected ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-orange-50'}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    presupuesto: '',
    objetivo: '',
    gustos: [] as string[],
    disgustos: [] as string[],
    gustoExtra: '',
    disgustoExtra: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const presupuesto = parseFloat(formData.presupuesto);
    if (isNaN(presupuesto) || presupuesto <= 0) {
      setError('Por favor ingresa un presupuesto válido.');
      return;
    }
    if (!formData.objetivo) {
      setError('Por favor selecciona un objetivo.');
      return;
    }
    // Guardar todo en localStorage
    localStorage.setItem('onboarding', JSON.stringify({
      presupuesto,
      objetivo: formData.objetivo,
      gustos: formData.gustos,
      disgustos: formData.disgustos
    }));
    router.push('/dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const toggleChip = (type: 'gustos' | 'disgustos', value: string) => {
    setFormData(prev => {
      const arr = prev[type];
      return {
        ...prev,
        [type]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
      };
    });
  };

  const addExtra = (type: 'gustos' | 'disgustos', field: 'gustoExtra' | 'disgustoExtra') => {
    const value = formData[field].trim();
    if (value && !formData[type].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value],
        [field]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Personaliza tu experiencia
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Cuéntanos un poco sobre ti para recomendarte las mejores recetas
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            {/* Presupuesto */}
            <div>
              <label htmlFor="presupuesto" className="block text-sm font-medium text-gray-700">
                Presupuesto semanal para comida (MXN)
              </label>
              <input
                id="presupuesto"
                name="presupuesto"
                type="number"
                min="1"
                step="0.01"
                required
                value={formData.presupuesto}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ejemplo: 500"
              />
            </div>
            {/* Objetivo */}
            <div>
              <label htmlFor="objetivo" className="block text-sm font-medium text-gray-700">
                ¿Qué buscas lograr?
              </label>
              <select
                id="objetivo"
                name="objetivo"
                required
                value={formData.objetivo}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-md"
              >
                <option value="">Selecciona un objetivo</option>
                {objetivos.map(obj => (
                  <option key={obj.id} value={obj.id}>{obj.label}</option>
                ))}
              </select>
            </div>
            {/* Gustos con chips */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Qué te gusta comer? (elige varios)
              </label>
              <div className="flex flex-wrap mb-2">
                {ingredientesPopulares.map(ing => (
                  <Chip
                    key={ing}
                    label={ing}
                    selected={formData.gustos.includes(ing)}
                    onClick={() => toggleChip('gustos', ing)}
                  />
                ))}
              </div>
              <div className="flex mt-2">
                <input
                  type="text"
                  name="gustoExtra"
                  value={formData.gustoExtra}
                  onChange={handleChange}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-l-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                  placeholder="Agregar otro..."
                />
                <button
                  type="button"
                  onClick={() => addExtra('gustos', 'gustoExtra')}
                  className="px-3 py-1 bg-orange-600 text-white rounded-r-md text-sm font-medium hover:bg-orange-700"
                >
                  Agregar
                </button>
              </div>
              {formData.gustos.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Seleccionado: {formData.gustos.join(', ')}
                </div>
              )}
            </div>
            {/* Disgustos/alergias con chips */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Qué no te gusta o tienes alergias? (elige varios)
              </label>
              <div className="flex flex-wrap mb-2">
                {ingredientesPopulares.map(ing => (
                  <Chip
                    key={ing}
                    label={ing}
                    selected={formData.disgustos.includes(ing)}
                    onClick={() => toggleChip('disgustos', ing)}
                  />
                ))}
              </div>
              <div className="flex mt-2">
                <input
                  type="text"
                  name="disgustoExtra"
                  value={formData.disgustoExtra}
                  onChange={handleChange}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-l-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                  placeholder="Agregar otro..."
                />
                <button
                  type="button"
                  onClick={() => addExtra('disgustos', 'disgustoExtra')}
                  className="px-3 py-1 bg-orange-600 text-white rounded-r-md text-sm font-medium hover:bg-orange-700"
                >
                  Agregar
                </button>
              </div>
              {formData.disgustos.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Seleccionado: {formData.disgustos.join(', ')}
                </div>
              )}
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Comenzar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 