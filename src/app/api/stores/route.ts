import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chain = searchParams.get('chain');
    const city = searchParams.get('city');
    const limit = searchParams.get('limit');

    // Construir filtros
    const where: any = {
      isActive: true
    };

    if (chain) {
      where.chain = chain;
    }

    if (city) {
      where.address = {
        contains: city,
        mode: 'insensitive'
      };
    }

    // Obtener tiendas
    const stores = await prisma.store.findMany({
      where,
      orderBy: {
        name: 'asc'
      },
      take: limit ? parseInt(limit) : undefined
    });

    // Obtener estadísticas
    const stats = await prisma.store.groupBy({
      by: ['chain'],
      where: { isActive: true },
      _count: {
        id: true
      }
    });

    const chainStats = stats.reduce((acc, stat) => {
      acc[stat.chain] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      stores,
      stats: {
        total: stores.length,
        byChain: chainStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo tiendas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las tiendas' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, chain, address, latitude, longitude, phone, hours, rating } = body;

    // Validar campos requeridos
    if (!name || !chain || !address || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Crear nueva tienda
    const store = await prisma.store.create({
      data: {
        name,
        chain,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        phone,
        hours,
        rating: rating ? parseFloat(rating) : null
      }
    });

    return NextResponse.json({ store }, { status: 201 });

  } catch (error) {
    console.error('Error creando tienda:', error);
    return NextResponse.json(
      { error: 'Error al crear la tienda' },
      { status: 500 }
    );
  }
} 