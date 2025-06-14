import { Ingredient as PrismaIngredient } from '@prisma/client';
import { parseNutritionalInfo, NutritionalInfo } from '@/types/ingredient';

export interface MCPRecipe {
  name: string;
  ingredients: PrismaIngredient[];
  cost: number;
  calories: number;
  description: string;
}

interface MCPOptions {
  ingredientes: PrismaIngredient[];
  presupuestoDiario: number;
  gustos: string[];
  disgustos: string[];
  objetivo: string;
}

const CATEGORIAS = {
  CEREALES: 'CEREALES',
  TUBERCULOS: 'TUBERCULOS',
  LEGUMINOSAS: 'LEGUMINOSAS',
  PROTEINAS: 'PROTEINAS',
  VERDURAS: 'VERDURAS',
};

function getCategoria(ing: PrismaIngredient) {
  if (ing.category === CATEGORIAS.CEREALES || ing.category === CATEGORIAS.TUBERCULOS) return 'cereal';
  if (ing.category === CATEGORIAS.PROTEINAS || ing.category === CATEGORIAS.LEGUMINOSAS) return 'proteina';
  if (ing.category === CATEGORIAS.VERDURAS) return 'verdura';
  return 'otro';
}

const RECETAS_CLASICAS = [
  {
    name: 'Arroz con Huevo',
    ingredientes: ['Arroz blanco', 'Huevo'],
    cost: 38,
    calories: 200,
    description: 'Receta clásica, fácil y económica.'
  },
  {
    name: 'Tortilla de Papa',
    ingredientes: ['Papa', 'Huevo', 'Tortillas de maíz'],
    cost: 45,
    calories: 250,
    description: 'Ideal para cualquier comida.'
  },
  {
    name: 'Sopa de Verduras',
    ingredientes: ['Zanahoria', 'Calabaza', 'Chayote'],
    cost: 30,
    calories: 120,
    description: 'Ligera y saludable.'
  },
  {
    name: 'Frijoles de la Olla',
    ingredientes: ['Frijol negro', 'Cebolla', 'Ajo'],
    cost: 35,
    calories: 180,
    description: 'Tradicional y rendidor.'
  },
  {
    name: 'Pollo con Verduras',
    ingredientes: ['Pollo entero', 'Zanahoria', 'Calabaza'],
    cost: 60,
    calories: 300,
    description: 'Completo y balanceado.'
  }
];

export function generarRecetasMCP({ ingredientes, presupuestoDiario, gustos, disgustos, objetivo }: MCPOptions): MCPRecipe[] {
  if (!Array.isArray(ingredientes)) {
    throw new Error("Se esperaba un array de ingredientes, pero se recibió: " + (typeof ingredientes));
  }
  // Agrupar ingredientes por categoría
  const cereales = ingredientes.filter(i => getCategoria(i) === 'cereal' && !disgustos.includes(i.name));
  const proteinas = ingredientes.filter(i => getCategoria(i) === 'proteina' && !disgustos.includes(i.name));
  const verduras = ingredientes.filter(i => getCategoria(i) === 'verdura' && !disgustos.includes(i.name));

  const recetas: MCPRecipe[] = [];
  // Generar combinaciones simples: 1 cereal + 1 proteina + 1 verdura
  for (const cereal of cereales) {
    for (const proteina of proteinas) {
      for (const verdura of verduras) {
        const ingList = [cereal, proteina, verdura];
        // Filtrar por gustos
        if (gustos.length && !ingList.some(i => gustos.includes(i.name))) continue;
        // Calcular costo y calorías
        const cost = ingList.reduce((sum, i) => sum + (i.price || 0), 0);
        const calories = ingList.reduce((sum, i) => {
          const nutritionalInfo = parseNutritionalInfo(i.nutritionalInfo as string | null);
          return sum + (nutritionalInfo?.calories || 0);
        }, 0);
        if (cost > presupuestoDiario) continue;
        // Nombre automático
        const name = `${proteina.name} con ${cereal.name} y ${verdura.name}`;
        recetas.push({
          name,
          ingredients: ingList,
          cost,
          calories,
          description: 'Receta fácil y balanceada siguiendo el Plato del Buen Comer.'
        });
      }
    }
  }
  let resultado = recetas;
  // Priorizar por objetivo
  if (objetivo === 'ahorrar') resultado = resultado.sort((a, b) => a.cost - b.cost);
  if (objetivo === 'saludable') resultado = resultado.sort((a, b) => b.calories - a.calories);
  if (objetivo === 'rapido') resultado = resultado.sort((a, b) => a.ingredients.length - b.ingredients.length);
  // Limitar a 5 sugerencias
  resultado = resultado.slice(0, 5);
  // Si no hay recetas, usar clásicas (filtradas por disgustos y margen de presupuesto)
  if (resultado.length === 0) {
    resultado = RECETAS_CLASICAS.filter(r =>
      r.ingredientes.every(i => !disgustos.includes(i)) &&
      r.cost <= presupuestoDiario + 50 // margen de 50 pesos
    ).map(r => ({
      name: r.name,
      ingredients: ingredientes.filter(i => r.ingredientes.includes(i.name)),
      cost: r.cost,
      calories: r.calories,
      description: r.description
    })).slice(0, 5);
  }
  return resultado;
} 