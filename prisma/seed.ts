import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { stringifyNutritionalInfo } from '../src/types/ingredient.ts';

const prisma = new PrismaClient().$extends(withAccelerate());

const basicIngredients = [
  // Cereales y tubérculos
  {
    name: 'Arroz blanco',
    unit: 'kg',
    category: 'CEREALES',
    price: 35.00,
    nutritionalInfo: {
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fat: 0.3
    }
  },
  {
    name: 'Maíz en grano',
    unit: 'kg',
    category: 'CEREALES',
    price: 25.00,
    nutritionalInfo: {
      calories: 86,
      protein: 3.2,
      carbs: 19,
      fat: 1.2
    }
  },
  {
    name: 'Tortillas de maíz',
    unit: 'kg',
    category: 'CEREALES',
    price: 30.00,
    nutritionalInfo: {
      calories: 218,
      protein: 5.7,
      carbs: 45,
      fat: 2.8
    }
  },
  {
    name: 'Papa',
    unit: 'kg',
    category: 'TUBERCULOS',
    price: 20.00,
    nutritionalInfo: {
      calories: 77,
      protein: 2,
      carbs: 17,
      fat: 0.1
    }
  },

  // Leguminosas
  {
    name: 'Frijol negro',
    unit: 'kg',
    category: 'LEGUMINOSAS',
    price: 45.00,
    nutritionalInfo: {
      calories: 341,
      protein: 21.6,
      carbs: 62,
      fat: 1.4
    }
  },
  {
    name: 'Lenteja',
    unit: 'kg',
    category: 'LEGUMINOSAS',
    price: 40.00,
    nutritionalInfo: {
      calories: 116,
      protein: 9,
      carbs: 20,
      fat: 0.4
    }
  },

  // Alimentos de origen animal
  {
    name: 'Pollo entero',
    unit: 'kg',
    category: 'PROTEINAS',
    price: 65.00,
    nutritionalInfo: {
      calories: 167,
      protein: 31,
      carbs: 0,
      fat: 3.6
    }
  },
  {
    name: 'Huevo',
    unit: 'pieza',
    category: 'PROTEINAS',
    price: 3.50,
    nutritionalInfo: {
      calories: 70,
      protein: 6,
      carbs: 0.6,
      fat: 5
    }
  },

  // Verduras básicas
  {
    name: 'Zanahoria',
    unit: 'kg',
    category: 'VERDURAS',
    price: 25.00,
    nutritionalInfo: {
      calories: 41,
      protein: 0.9,
      carbs: 10,
      fat: 0.2
    }
  },
  {
    name: 'Calabaza',
    unit: 'kg',
    category: 'VERDURAS',
    price: 20.00,
    nutritionalInfo: {
      calories: 26,
      protein: 1,
      carbs: 6.5,
      fat: 0.1
    }
  },
  {
    name: 'Chayote',
    unit: 'kg',
    category: 'VERDURAS',
    price: 25.00,
    nutritionalInfo: {
      calories: 19,
      protein: 0.8,
      carbs: 4.5,
      fat: 0.1
    }
  }
];

async function main() {
  // Crear usuario de desarrollo si no existe
  const devUser = await prisma.user.upsert({
    where: { id: 'dev_user_1' },
    update: {},
    create: {
      id: 'dev_user_1',
      email: 'dev@example.com',
      name: 'Usuario Desarrollo',
      password: 'hashed_password', // En desarrollo no importa
      budget: 1000,
      income: 2000
    }
  });

  console.log('Usuario de desarrollo creado:', devUser.id);

  // Crear ingredientes básicos
  for (const ingredient of basicIngredients) {
    const nutritionalInfoStr = stringifyNutritionalInfo(ingredient.nutritionalInfo) || '';
    await prisma.ingredient.upsert({
      where: {
        userId_name: {
          userId: devUser.id,
          name: ingredient.name
        }
      },
      update: {
        price: ingredient.price,
        unit: ingredient.unit,
        category: ingredient.category,
        nutritionalInfo: nutritionalInfoStr
      },
      create: {
        userId: devUser.id,
        name: ingredient.name,
        unit: ingredient.unit,
        price: ingredient.price,
        category: ingredient.category,
        nutritionalInfo: nutritionalInfoStr,
        quantity: 0 // Inicialmente sin stock
      }
    });
  }

  console.log('Ingredientes básicos creados');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 