import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { priceAgent } from '@/services/price-agents';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const store = searchParams.get('store');

    if (!userId) {
      return NextResponse.json(
        { error: 'Se requiere userId' },
        { status: 400 }
      );
    }

    // Obtener ingredientes del usuario
    const ingredientes = await prisma.ingredient.findMany({
      where: { userId }
    });

    // Calcular estadísticas de precios
    const totalGastado = ingredientes.reduce((sum, ing) => sum + (ing.price || 0), 0);
    const preciosActualizados = ingredientes.filter(ing => ing.store && ing.storeUrl).length;
    const ultimaActualizacion = ingredientes.reduce((latest, ing) => 
      ing.updatedAt > latest ? ing.updatedAt : latest, 
      new Date(0)
    );

    return NextResponse.json({
      totalGastado,
      preciosActualizados,
      ultimaActualizacion,
      ingredientes
    });
  } catch (error) {
    console.error('Error en MCP Price Optimizer:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de precios' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId, store } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Se requiere userId' },
        { status: 400 }
      );
    }

    // Verificar si ya hay una actualización en progreso
    if (priceAgent.isUpdating) {
      return NextResponse.json(
        { error: 'Ya hay una actualización de precios en progreso' },
        { status: 409 }
      );
    }

    // Verificar última actualización
    const ultimaActualizacion = await priceAgent.getLastUpdateTime();
    const unaHora = 60 * 60 * 1000; // 1 hora en milisegundos
    if (ultimaActualizacion && Date.now() - ultimaActualizacion.getTime() < unaHora) {
      return NextResponse.json(
        { error: 'Debes esperar al menos una hora entre actualizaciones' },
        { status: 429 }
      );
    }

    // Iniciar actualización de precios
    const resultados = await priceAgent.updatePrices(userId, store);

    return NextResponse.json({
      message: 'Actualización de precios completada',
      ingredientesActualizados: resultados.length,
      ultimaActualizacion: new Date()
    });
  } catch (error) {
    console.error('Error en MCP Price Optimizer:', error);
    return NextResponse.json(
      { error: 'Error al actualizar precios' },
      { status: 500 }
    );
  }
} 