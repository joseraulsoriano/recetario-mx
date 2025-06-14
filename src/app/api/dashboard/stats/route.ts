import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // ID de usuario fijo para desarrollo
    const userId = 'dev_user_1';

    // Obtener recetas del usuario
    const totalRecipes = await prisma.recipe.count({
      where: { userId }
    });

    // Obtener ingredientes del usuario
    const ingredients = await prisma.ingredient.findMany({
      where: { userId }
    });

    // Calcular estadísticas
    const totalIngredients = ingredients.length;
    const weeklySpent = ingredients.reduce((sum, ing) => sum + (ing.price || 0), 0);
    
    // Calcular ingredientes por vencer (en los próximos 7 días)
    const sieteDias = new Date();
    sieteDias.setDate(sieteDias.getDate() + 7);
    const upcomingExpirations = ingredients.filter(ing => 
      ing.expiryDate && ing.expiryDate <= sieteDias
    ).length;

    // Obtener presupuesto del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { budget: true }
    });

    const stats = {
      totalRecipes,
      totalIngredients,
      weeklyBudget: user?.budget || 0,
      weeklySpent,
      upcomingExpirations
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener estadísticas',
        totalRecipes: 0,
        totalIngredients: 0,
        weeklyBudget: 0,
        weeklySpent: 0,
        upcomingExpirations: 0
      },
      { status: 500 }
    );
  }
} 