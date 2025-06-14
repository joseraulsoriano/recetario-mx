import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { ingredients, storeChain } = await req.json();

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Se requiere una lista de ingredientes' },
        { status: 400 }
      );
    }

    const results = [];

    for (const ingredient of ingredients) {
      // Buscar el ingrediente en la base de datos
      const dbIngredient = await prisma.ingredient.findFirst({
        where: {
          name: {
            contains: ingredient.name
          }
        }
      });

      if (dbIngredient) {
        // Si el ingrediente tiene precio y tienda, usarlo
        if (dbIngredient.price && dbIngredient.store) {
          results.push({
            name: ingredient.name,
            price: dbIngredient.price,
            store: dbIngredient.store,
            storeUrl: dbIngredient.storeUrl,
            available: true
          });
        } else {
          // Usar precios simulados basados en la cadena
          const simulatedPrice = getSimulatedPrice(ingredient.name, storeChain);
          results.push({
            name: ingredient.name,
            price: simulatedPrice,
            store: storeChain,
            available: simulatedPrice > 0
          });
        }
      } else {
        // Ingrediente no encontrado, usar precio simulado
        const simulatedPrice = getSimulatedPrice(ingredient.name, storeChain);
        results.push({
          name: ingredient.name,
          price: simulatedPrice,
          store: storeChain,
          available: simulatedPrice > 0
        });
      }
    }

    return NextResponse.json({
      ingredients: results,
      totalPrice: results.reduce((sum, item) => sum + (item.price || 0), 0),
      availableCount: results.filter(item => item.available).length
    });

  } catch (error) {
    console.error('Error obteniendo precios:', error);
    return NextResponse.json(
      { error: 'Error al obtener los precios' },
      { status: 500 }
    );
  }
}

function getSimulatedPrice(ingredientName: string, storeChain: string): number {
  // Precios base por ingrediente
  const basePrices: Record<string, number> = {
    'Arroz blanco': 25,
    'Arroz': 25,
    'Huevo': 45,
    'Huevos': 45,
    'Pollo entero': 120,
    'Pollo': 120,
    'Tortillas de maíz': 15,
    'Tortillas': 15,
    'Frijol negro': 30,
    'Frijol': 30,
    'Frijoles': 30,
    'Zanahoria': 20,
    'Zanahorias': 20,
    'Calabaza': 35,
    'Chayote': 25,
    'Papa': 30,
    'Papas': 30,
    'Lenteja': 40,
    'Lentejas': 40,
    'Maíz en grano': 35,
    'Maíz': 35,
    'Cebolla': 15,
    'Cebollas': 15,
    'Ajo': 20,
    'Tomate': 25,
    'Tomates': 25,
    'Lechuga': 15,
    'Jitomate': 25,
    'Aguacate': 40,
    'Limón': 20,
    'Limones': 20,
    'Chile': 15,
    'Chiles': 15,
    'Cilantro': 10,
    'Perejil': 10,
    'Orégano': 15,
    'Comino': 20,
    'Canela': 25,
    'Vainilla': 30,
    'Azúcar': 20,
    'Sal': 10,
    'Pimienta': 15,
    'Aceite': 35,
    'Mantequilla': 45,
    'Queso': 80,
    'Leche': 25,
    'Crema': 35,
    'Yogur': 30,
    'Pan': 25,
    'Harina': 20,
    'Masa': 15,
    'Salsa': 25,
    'Consomé': 15,
    'Caldo': 15
  };

  // Buscar precio base (con coincidencia parcial)
  let basePrice = 50; // Precio por defecto
  for (const [key, price] of Object.entries(basePrices)) {
    if (ingredientName.toLowerCase().includes(key.toLowerCase())) {
      basePrice = price;
      break;
    }
  }

  // Multiplicadores por cadena (simulando diferentes precios)
  const multipliers: Record<string, number> = {
    'Walmart': 1.0,
    'Soriana': 0.95,
    'Chedraui': 0.90,
    'Aurrerá': 0.85,
    'Bodega Aurrerá': 0.85,
    'Superama': 1.1,
    'La Comer': 1.05,
    'City Market': 1.15
  };

  const multiplier = multipliers[storeChain] || 1.0;
  
  // Agregar variación aleatoria (±10%)
  const variation = 0.9 + Math.random() * 0.2;
  
  return Math.round(basePrice * multiplier * variation);
} 