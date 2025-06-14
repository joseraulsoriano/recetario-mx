import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { generarRecetasMCP } from '@/utils/mcp';

const prisma = new PrismaClient().$extends(withAccelerate());

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId = 'dev_user_1',
      presupuesto,
      comidas = ['desayuno', 'comida', 'cena'],
      gustos = [],
      disgustos = [],
      objetivo = 'ahorrar',
      // Nuevos parámetros
      maxRecetasPorComida = 5,
      incluirRecetasGuardadas = true,
      actualizarPrecios = false,
      tiendasPreferidas = [],
    } = body;

    // 1. Obtener ingredientes del usuario
    const ingredientes = await prisma.ingredient.findMany({ 
      where: { userId },
      include: { recipeIngredients: true }
    });

    // 2. Si se solicita actualizar precios, ejecutar el scraper
    if (actualizarPrecios) {
      // TODO: Implementar actualización de precios con el scraper
      // Por ahora solo un placeholder
      console.log('Actualizando precios...');
    }

    // 3. Calcular presupuesto por comida
    const presupuestoDiario = Number(presupuesto) / (comidas.length || 3);

    // 4. Generar sugerencias para cada comida
    const menu: Record<string, any[]> = {};
    for (const comida of comidas) {
      // Generar recetas con MCP
      const sugerenciasMCP = generarRecetasMCP({
        ingredientes,
        presupuestoDiario,
        gustos,
        disgustos,
        objetivo
      });

      // Si se incluyen recetas guardadas, obtenerlas también
      let recetasGuardadas: any[] = [];
      if (incluirRecetasGuardadas) {
        recetasGuardadas = await prisma.recipe.findMany({
          where: { 
            userId,
            // Filtrar por ingredientes disponibles
            ingredients: {
              some: {
                ingredient: {
                  id: { in: ingredientes.map(i => i.id) }
                }
              }
            }
          },
          include: {
            ingredients: {
              include: { ingredient: true }
            }
          }
        });
      }

      // Combinar y ordenar resultados
      menu[comida] = [
        ...sugerenciasMCP,
        ...recetasGuardadas.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          ingredients: r.ingredients.map((ri: any) => ({
            name: ri.ingredient.name,
            unit: ri.unit,
            quantity: ri.quantity,
            price: ri.ingredient.price,
            nutritionalInfo: ri.ingredient.nutritionalInfo
          })),
          cost: r.cost,
          isSaved: true
        }))
      ].slice(0, maxRecetasPorComida);
    }

    // 5. Calcular estadísticas
    const stats = {
      totalRecetas: Object.values(menu).flat().length,
      promedioCosto: Object.values(menu).flat().reduce((sum, r) => sum + (r.cost || 0), 0) / Object.values(menu).flat().length,
      ingredientesUsados: [...new Set(Object.values(menu).flat().map(r => r.ingredients.map((i: any) => i.name)).flat())].length
    };

    return NextResponse.json({ 
      menu,
      stats,
      metadata: {
        presupuestoDiario,
        comidas,
        objetivo,
        tiendasPreferidas
      }
    });

  } catch (error) {
    console.error('Error en MCP:', error);
    return NextResponse.json(
      { error: 'Error al generar el menú' },
      { status: 500 }
    );
  }
} 