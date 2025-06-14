import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());
const DEV_USER_ID = 'dev_user_1';

export async function POST(req: Request) {
  const { recipeId, favorite } = await req.json();
  // Simulación: podrías tener un modelo FavoriteRecipe, aquí solo lo marcamos con un campo extra si lo tuvieras
  // Por ahora, solo responde ok
  return NextResponse.json({ ok: true });
} 