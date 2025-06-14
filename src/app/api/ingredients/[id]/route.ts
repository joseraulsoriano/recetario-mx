import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const ingredient = await prisma.ingredient.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(ingredient);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar ingrediente' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.ingredient.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar ingrediente' }, { status: 500 });
  }
} 