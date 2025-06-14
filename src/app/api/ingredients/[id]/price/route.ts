import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient().$extends(withAccelerate());

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { price, store, storeUrl } = await request.json();
    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'Precio inválido' },
        { status: 400 }
      );
    }

    const ingredient = await prisma.ingredient.update({
      where: {
        id: params.id,
        userId: session.user.id, // Asegura que el ingrediente pertenece al usuario
      },
      data: {
        price,
        store,
        storeUrl,
      },
    });

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error updating ingredient price:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el precio' },
      { status: 500 }
    );
  }
} 