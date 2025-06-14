import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { z } from 'zod';

const prisma = new PrismaClient().$extends(withAccelerate());

const signUpSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  budget: z.number().min(0, 'El presupuesto no puede ser negativo'),
  income: z.number().min(0, 'El ingreso no puede ser negativo'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = signUpSchema.parse(body);

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await hash(validatedData.password, 12);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        budget: validatedData.budget,
        income: validatedData.income,
      },
    });

    // No enviar la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'Usuario creado exitosamente', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { message: 'Error al crear el usuario' },
      { status: 500 }
    );
  }
} 