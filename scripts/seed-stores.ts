import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STORES_DATA = [
  // Walmart en CDMX
  {
    name: 'Walmart Supercenter Perisur',
    chain: 'Walmart',
    address: 'Av. Insurgentes Sur 1602, Tlalpan, 14000 Ciudad de México, CDMX',
    latitude: 19.3034,
    longitude: -99.1897,
    phone: '55 5606 1234',
    hours: 'Lun-Dom: 7:00 AM - 11:00 PM',
    rating: 4.2
  },
  {
    name: 'Walmart Supercenter Santa Fe',
    chain: 'Walmart',
    address: 'Av. Vasco de Quiroga 3800, Santa Fe, 01210 Ciudad de México, CDMX',
    latitude: 19.3594,
    longitude: -99.2594,
    phone: '55 5292 5678',
    hours: 'Lun-Dom: 7:00 AM - 11:00 PM',
    rating: 4.1
  },
  {
    name: 'Walmart Supercenter Centro Histórico',
    chain: 'Walmart',
    address: 'Av. 20 de Noviembre 82, Centro Histórico, 06000 Ciudad de México, CDMX',
    latitude: 19.4326,
    longitude: -99.1332,
    phone: '55 5518 9012',
    hours: 'Lun-Dom: 8:00 AM - 10:00 PM',
    rating: 3.9
  },
  
  // Soriana en CDMX
  {
    name: 'Soriana Hiper Coyoacán',
    chain: 'Soriana',
    address: 'Av. Universidad 1000, Coyoacán, 04000 Ciudad de México, CDMX',
    latitude: 19.3556,
    longitude: -99.1625,
    phone: '55 5554 3456',
    hours: 'Lun-Dom: 7:00 AM - 11:00 PM',
    rating: 4.0
  },
  {
    name: 'Soriana Hiper Polanco',
    chain: 'Soriana',
    address: 'Av. Presidente Masaryk 360, Polanco, 11560 Ciudad de México, CDMX',
    latitude: 19.4326,
    longitude: -99.1897,
    phone: '55 5280 7890',
    hours: 'Lun-Dom: 7:00 AM - 11:00 PM',
    rating: 4.3
  },
  {
    name: 'Soriana Hiper Roma',
    chain: 'Soriana',
    address: 'Av. Álvaro Obregón 286, Roma Norte, 06700 Ciudad de México, CDMX',
    latitude: 19.4194,
    longitude: -99.1597,
    phone: '55 5264 1234',
    hours: 'Lun-Dom: 8:00 AM - 10:00 PM',
    rating: 3.8
  },
  
  // Chedraui en CDMX
  {
    name: 'Chedraui Selecto Condesa',
    chain: 'Chedraui',
    address: 'Av. Tamaulipas 95, Condesa, 06140 Ciudad de México, CDMX',
    latitude: 19.4156,
    longitude: -99.1697,
    phone: '55 5553 5678',
    hours: 'Lun-Dom: 7:00 AM - 11:00 PM',
    rating: 4.1
  },
  {
    name: 'Chedraui Selecto Del Valle',
    chain: 'Chedraui',
    address: 'Av. Coyoacán 2000, Del Valle, 03100 Ciudad de México, CDMX',
    latitude: 19.3894,
    longitude: -99.1597,
    phone: '55 5559 9012',
    hours: 'Lun-Dom: 7:00 AM - 11:00 PM',
    rating: 4.0
  },
  {
    name: 'Chedraui Selecto Narvarte',
    chain: 'Chedraui',
    address: 'Av. Universidad 1738, Narvarte, 03020 Ciudad de México, CDMX',
    latitude: 19.3894,
    longitude: -99.1497,
    phone: '55 5559 3456',
    hours: 'Lun-Dom: 8:00 AM - 10:00 PM',
    rating: 3.9
  },
  
  // Tiendas en Guadalajara
  {
    name: 'Walmart Supercenter Centro Magno',
    chain: 'Walmart',
    address: 'Av. Vallarta 2425, Arcos Vallarta, 44100 Guadalajara, Jal.',
    latitude: 20.6597,
    longitude: -103.3496,
    phone: '33 3615 1234',
    hours: 'Lun-Dom: 7:00 AM - 11:00 PM',
    rating: 4.2
  },
  {
    name: 'Soriana Hiper Providencia',
    chain: 'Soriana',
    address: 'Av. Providencia 1000, Providencia, 44630 Guadalajara, Jal.',
    latitude: 20.6897,
    longitude: -103.3796,
    phone: '33 3647 5678',
    hours: 'Lun-Dom: 7:00 AM - 11:00 PM',
    rating: 4.1
  },
  
  // Tiendas en Monterrey
  {
    name: 'Walmart Supercenter San Pedro',
    chain: 'Walmart',
    address: 'Av. Vasconcelos 150, Valle Oriente, 66220 San Pedro Garza García, N.L.',
    latitude: 25.6597,
    longitude: -100.3496,
    phone: '81 8335 1234',
    hours: 'Lun-Dom: 7:00 AM - 11:00 PM',
    rating: 4.3
  },
  {
    name: 'Soriana Hiper Centro',
    chain: 'Soriana',
    address: 'Av. Constitución 1000, Centro, 64000 Monterrey, N.L.',
    latitude: 25.6797,
    longitude: -100.3096,
    phone: '81 8340 5678',
    hours: 'Lun-Dom: 7:00 AM - 11:00 PM',
    rating: 4.0
  }
];

async function main() {
  console.log('🌱 Poblando base de datos con tiendas...');
  
  for (const storeData of STORES_DATA) {
    try {
      const store = await prisma.store.upsert({
        where: { 
          name_address: {
            name: storeData.name,
            address: storeData.address
          }
        },
        update: storeData,
        create: storeData,
      });
      console.log(`✅ Tienda creada: ${store.name}`);
    } catch (error) {
      console.error(`❌ Error creando tienda ${storeData.name}:`, error);
    }
  }
  
  console.log('🎉 Poblado de tiendas completado!');
}

main()
  .catch((e) => {
    console.error('Error en el script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 