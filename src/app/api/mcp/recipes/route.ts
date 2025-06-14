import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { parseNutritionalInfo } from '@/types/ingredient';

const prisma = new PrismaClient();

// Función para generar recetas usando IA
async function generateRecipesWithAI({
  ingredientes,
  presupuestoDiario,
  gustos,
  disgustos,
  objetivo,
  tipoComida
}: {
  ingredientes: any[];
  presupuestoDiario: number;
  gustos: string[];
  disgustos: string[];
  objetivo: string;
  tipoComida: string;
}) {
  console.log('Generando recetas con:', {
    numIngredientes: ingredientes.length,
    presupuestoDiario,
    gustos,
    disgustos,
    objetivo,
    tipoComida
  });
  
  // Filtrar ingredientes por disponibilidad y preferencias
  const disponibles = ingredientes.filter(i => 
    i.price && i.price <= presupuestoDiario && 
    !disgustos.includes(i.name)
  );

  console.log('Ingredientes disponibles:', disponibles.map(i => i.name));

  // Agrupar por categorías
  const categorias = {
    cereales: disponibles.filter(i => i.category === 'CEREALES' || i.category === 'TUBERCULOS'),
    proteinas: disponibles.filter(i => i.category === 'PROTEINAS' || i.category === 'LEGUMINOSAS'),
    verduras: disponibles.filter(i => i.category === 'VERDURAS'),
    otros: disponibles.filter(i => !['CEREALES', 'TUBERCULOS', 'PROTEINAS', 'LEGUMINOSAS', 'VERDURAS'].includes(i.category))
  };

  console.log('Categorías:', {
    cereales: categorias.cereales.map(i => i.name),
    proteinas: categorias.proteinas.map(i => i.name),
    verduras: categorias.verduras.map(i => i.name),
    otros: categorias.otros.map(i => i.name)
  });

  // Generar combinaciones según el tipo de comida
  const recetas = [];
  const maxRecetas = 5;

  // Desayuno: cereal + proteína + fruta/verdura
  if (tipoComida === 'desayuno') {
    for (const cereal of categorias.cereales) {
      for (const proteina of categorias.proteinas) {
        for (const verdura of [...categorias.verduras, ...categorias.otros]) {
          if (recetas.length >= maxRecetas) break;
          
          const costo = (cereal.price || 0) + (proteina.price || 0) + (verdura.price || 0);
          if (costo > presupuestoDiario) {
            console.log(`Costo excede presupuesto: ${costo} > ${presupuestoDiario}`);
            continue;
          }

          const calorias = [cereal, proteina, verdura].reduce((sum, ing) => {
            const info = parseNutritionalInfo(ing.nutritionalInfo as string | null);
            return sum + (info?.calories || 0);
          }, 0);

          recetas.push({
            name: `${proteina.name} con ${cereal.name} y ${verdura.name}`,
            ingredients: [cereal, proteina, verdura],
            cost: costo,
            calories: calorias,
            description: `Desayuno balanceado con ${cereal.name}, ${proteina.name} y ${verdura.name}. Ideal para empezar el día.`
          });
        }
      }
    }
  }
  // Comida: proteína + cereal + verdura + verdura
  else if (tipoComida === 'comida') {
    for (const proteina of categorias.proteinas) {
      for (const cereal of categorias.cereales) {
        for (const verdura1 of categorias.verduras) {
          for (const verdura2 of categorias.verduras.filter(v => v.id !== verdura1.id)) {
            if (recetas.length >= maxRecetas) break;
            
            const costo = (proteina.price || 0) + (cereal.price || 0) + 
                         (verdura1.price || 0) + (verdura2.price || 0);
            if (costo > presupuestoDiario) {
              console.log(`Costo excede presupuesto: ${costo} > ${presupuestoDiario}`);
              continue;
            }

            const calorias = [proteina, cereal, verdura1, verdura2].reduce((sum, ing) => {
              const info = parseNutritionalInfo(ing.nutritionalInfo as string | null);
              return sum + (info?.calories || 0);
            }, 0);

            recetas.push({
              name: `${proteina.name} con ${cereal.name} y ${verdura1.name} con ${verdura2.name}`,
              ingredients: [proteina, cereal, verdura1, verdura2],
              cost: costo,
              calories: calorias,
              description: `Comida completa con ${proteina.name}, ${cereal.name} y dos tipos de verduras.`
            });
          }
        }
      }
    }
  }
  // Cena: proteína + verdura + verdura
  else {
    for (const proteina of categorias.proteinas) {
      for (const verdura1 of categorias.verduras) {
        for (const verdura2 of categorias.verduras.filter(v => v.id !== verdura1.id)) {
          if (recetas.length >= maxRecetas) break;
          
          const costo = (proteina.price || 0) + (verdura1.price || 0) + (verdura2.price || 0);
          if (costo > presupuestoDiario) {
            console.log(`Costo excede presupuesto: ${costo} > ${presupuestoDiario}`);
            continue;
          }

          const calorias = [proteina, verdura1, verdura2].reduce((sum, ing) => {
            const info = parseNutritionalInfo(ing.nutritionalInfo as string | null);
            return sum + (info?.calories || 0);
          }, 0);

          recetas.push({
            name: `${proteina.name} con ${verdura1.name} y ${verdura2.name}`,
            ingredients: [proteina, verdura1, verdura2],
            cost: costo,
            calories: calorias,
            description: `Cena ligera con ${proteina.name} y dos tipos de verduras.`
          });
        }
      }
    }
  }

  console.log('Recetas generadas:', recetas.length);

  // Ordenar según el objetivo
  if (objetivo === 'ahorrar') {
    recetas.sort((a, b) => a.cost - b.cost);
  } else if (objetivo === 'saludable') {
    recetas.sort((a, b) => b.calories - a.calories);
  }

  return recetas.slice(0, maxRecetas);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      ingredientes,
      presupuestoDiario,
      gustos,
      disgustos,
      objetivo,
      tipoComida
    } = body;

    // Validar datos de entrada
    if (!Array.isArray(ingredientes)) {
      return NextResponse.json(
        { error: 'Se requiere un array de ingredientes' },
        { status: 400 }
      );
    }

    // Generar recetas usando IA
    const recetas = await generateRecipesWithAI({
      ingredientes,
      presupuestoDiario,
      gustos,
      disgustos,
      objetivo,
      tipoComida
    });

    return NextResponse.json({ recetas });
  } catch (error) {
    console.error('Error al generar recetas:', error);
    return NextResponse.json(
      { error: 'Error al generar recetas' },
      { status: 500 }
    );
  }
} 