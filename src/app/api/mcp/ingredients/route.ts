import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { parseNutritionalInfo, stringifyNutritionalInfo } from '@/types/ingredient';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Se requiere userId' },
        { status: 400 }
      );
    }

    const ingredientes = await prisma.ingredient.findMany({
      where: { userId }
    });

    // Convertir nutritionalInfo de string a objeto
    const ingredientesFormateados = ingredientes.map(ing => ({
      ...ing,
      nutritionalInfo: parseNutritionalInfo(ing.nutritionalInfo)
    }));

    return NextResponse.json({ ingredientes: ingredientesFormateados });
  } catch (error) {
    console.error('Error en MCP Ingredient Manager:', error);
    return NextResponse.json(
      { error: 'Error al obtener ingredientes' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId, ingredient } = await req.json();

    if (!userId || !ingredient) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos' },
        { status: 400 }
      );
    }

    // Convertir nutritionalInfo de objeto a string
    const nutritionalInfoStr = stringifyNutritionalInfo(ingredient.nutritionalInfo);

    const nuevoIngrediente = await prisma.ingredient.create({
      data: {
        ...ingredient,
        userId,
        nutritionalInfo: nutritionalInfoStr
      }
    });

    return NextResponse.json({ ingrediente: nuevoIngrediente });
  } catch (error) {
    console.error('Error en MCP Ingredient Manager:', error);
    return NextResponse.json(
      { error: 'Error al crear ingrediente' },
      { status: 500 }
    );
  }
} 