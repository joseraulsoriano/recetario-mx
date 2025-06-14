import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());
const DEV_USER_ID = 'dev_user_1';

export async function POST(req: Request) {
  const { objetivo, gustos, disgustos } = await req.json();
  let recipes = await prisma.recipe.findMany({
    where: { userId: DEV_USER_ID },
    include: {
      ingredients: { include: { ingredient: true } }
    }
  });
  recipes = recipes.filter(recipe => {
    const ingredientNames = recipe.ingredients.map(ri => ri.ingredient.name);
    const gustoMatch = gustos.length === 0 || gustos.some((g: string) => ingredientNames.includes(g));
    const disgustoMatch = !disgustos.some((d: string) => ingredientNames.includes(d));
    return gustoMatch && disgustoMatch;
  });
  return NextResponse.json(
    recipes.map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients.map(ri => ({
        name: ri.ingredient.name,
        unit: ri.ingredient.unit,
        price: ri.ingredient.price,
        nutritionalInfo: ri.ingredient.nutritionalInfo
      }))
    }))
  );
} 