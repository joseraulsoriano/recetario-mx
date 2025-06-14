import { NextResponse } from 'next/server';
import { priceAgent } from '@/services/price-agents';

export async function POST(req: Request) {
  try {
    const { userId, store } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del usuario' },
        { status: 400 }
      );
    }

    // Verificar si ya hay una actualización en curso
    if (priceAgent.isUpdating()) {
      return NextResponse.json(
        { error: 'Ya hay una actualización de precios en curso' },
        { status: 409 }
      );
    }

    // Verificar última actualización
    const lastUpdate = priceAgent.getLastUpdate();
    if (lastUpdate && (new Date().getTime() - lastUpdate.getTime()) < 1000 * 60 * 60) { // 1 hora
      return NextResponse.json(
        { error: 'Los precios se actualizaron hace menos de una hora' },
        { status: 429 }
      );
    }

    // Ejecutar actualización
    const { results, errors } = await priceAgent.updatePrices(userId, store);

    return NextResponse.json({
      success: true,
      updatedIngredients: results.length,
      lastUpdate: priceAgent.getLastUpdate(),
      results,
      errors
    });

  } catch (error) {
    console.error('Error actualizando precios:', error);
    return NextResponse.json(
      { error: 'Error al actualizar los precios' },
      { status: 500 }
    );
  }
}

// Endpoint para verificar estado
export async function GET() {
  return NextResponse.json({
    isUpdating: priceAgent.isUpdating(),
    lastUpdate: priceAgent.getLastUpdate()
  });
} 