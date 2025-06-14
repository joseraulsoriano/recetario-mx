import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Tesseract from 'tesseract.js';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, imagePath, total, date, isManual, description } = await req.json();
    let ocrText = '';
    if (imagePath && !isManual) {
      // Ruta absoluta al archivo
      const filePath = path.join(process.cwd(), 'public', imagePath);
      if (fs.existsSync(filePath)) {
        const { data: { text } } = await Tesseract.recognize(filePath, 'spa');
        ocrText = text;
      }
    }
    const ticket = await prisma.ticket.create({
      data: {
        userId,
        imagePath: imagePath || '',
        total: total ? Number(total) : undefined,
        date: date ? new Date(date) : undefined,
        ocrText,
        isManual: !!isManual,
        description: description || null,
      },
    });
    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Error creando ticket:', error);
    return NextResponse.json({ error: 'Error al crear ticket' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const tickets = await prisma.ticket.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener tickets' }, { status: 500 });
  }
} 