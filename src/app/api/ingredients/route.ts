import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Obtener userId de la URL en desarrollo
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // En desarrollo, permitir acceso con userId
    if (process.env.NODE_ENV === 'development' && userId) {
      const ingredients = await prisma.ingredient.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(ingredients);
    }

    // En producción, usar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const ingredients = await prisma.ingredient.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { error: 'Error al obtener ingredientes' },
      { status: 500 }
    );
  }
} 