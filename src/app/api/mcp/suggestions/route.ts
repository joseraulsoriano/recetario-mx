import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Recipe {
  name: string;
  ingredients: any[];
  cost: number;
  calories: number;
  description: string;
}

type Menu = Record<string, Recipe[]>;

export async function POST(req: Request) {
  try {
    const { userId, presupuesto, gustos, disgustos, objetivo, tiposComida } = await req.json();

    // Validar datos de entrada
    if (!userId || !presupuesto || !Array.isArray(gustos) || !Array.isArray(disgustos) || !objetivo || !Array.isArray(tiposComida)) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos' },
        { status: 400 }
      );
    }

    // Actualizar presupuesto del usuario
    await prisma.user.update({
      where: { id: userId },
      data: { budget: presupuesto }
    });

    // Obtener ingredientes del usuario
    const ingredientes = await prisma.ingredient.findMany({
      where: { userId }
    });

    // Calcular presupuesto diario
    const presupuestoDiario = presupuesto / tiposComida.length;

    // Generar menú para cada tipo de comida
    const menu: Menu = {};
    for (const tipoComida of tiposComida) {
      try {
        // Llamar al endpoint MCP de recetas
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/mcp/recipes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ingredientes,
            presupuestoDiario,
            gustos,
            disgustos,
            objetivo,
            tipoComida
          })
        });

        if (!response.ok) {
          console.error(`Error al generar recetas para ${tipoComida}:`, await response.text());
          continue;
        }

        const { recetas } = await response.json();
        menu[tipoComida] = recetas;
      } catch (error) {
        console.error(`Error al procesar ${tipoComida}:`, error);
        menu[tipoComida] = [];
      }
    }

    return NextResponse.json({ menu });
  } catch (error) {
    console.error('Error en MCP Suggestions:', error);
    return NextResponse.json(
      { error: 'Error al generar sugerencias' },
      { status: 500 }
    );
  }
} 