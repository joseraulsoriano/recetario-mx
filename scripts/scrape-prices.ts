import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUPERMARKETS = [
  {
    name: 'Walmart',
    searchUrl: (q: string) => `https://www.walmart.com.mx/productos?Ntt=${encodeURIComponent(q)}`,
    priceSelector: '.product-price',
    getPriceAndUrl: ($: cheerio.CheerioAPI) => {
      const priceText = $('.product-price').first().text().replace(/[^\d.,]/g, '').replace(',', '.');
      const url = $('.product-price').first().closest('a').attr('href');
      return { price: parseFloat(priceText), url: url ? `https://www.walmart.com.mx${url}` : undefined };
    }
  },
  {
    name: 'Soriana',
    searchUrl: (q: string) => `https://www.soriana.com/buscar?q=${encodeURIComponent(q)}`,
    priceSelector: '.sor-price',
    getPriceAndUrl: ($: cheerio.CheerioAPI) => {
      const priceText = $('.sor-price').first().text().replace(/[^\d.,]/g, '').replace(',', '.');
      const url = $('.sor-price').first().closest('a').attr('href');
      return { price: parseFloat(priceText), url };
    }
  },
  {
    name: 'Chedraui',
    searchUrl: (q: string) => `https://www.chedraui.com.mx/search/?text=${encodeURIComponent(q)}`,
    priceSelector: '.product-price',
    getPriceAndUrl: ($: cheerio.CheerioAPI) => {
      const priceText = $('.product-price').first().text().replace(/[^\d.,]/g, '').replace(',', '.');
      const url = $('.product-price').first().closest('a').attr('href');
      return { price: parseFloat(priceText), url: url ? `https://www.chedraui.com.mx${url}` : undefined };
    }
  }
];

const SEARCH_NAME_MAP: Record<string, string> = {
  'Arroz blanco': 'arroz',
  'Maíz en grano': 'maiz',
  'Tortillas de maíz': 'tortilla',
  'Papa': 'papa',
  'Frijol negro': 'frijol',
  'Lenteja': 'lenteja',
  'Pollo entero': 'pollo',
  'Huevo': 'huevo',
  'Zanahoria': 'zanahoria',
  'Calabaza': 'calabaza',
  'Chayote': 'chayote',
};

async function scrapePrice(ingredient: string) {
  const searchName = SEARCH_NAME_MAP[ingredient] || ingredient;
  let bestPrice = Infinity;
  let bestStore = '';
  let bestUrl = '';
  for (const market of SUPERMARKETS) {
    try {
      const { data } = await axios.get(market.searchUrl(searchName), { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);
      const priceHtml = $(market.priceSelector).first().parent().html();
      console.log(`[${market.name}] Buscando: ${searchName} | HTML:`, priceHtml);
      const { price, url } = market.getPriceAndUrl($);
      if (price && price < bestPrice) {
        bestPrice = price;
        bestStore = market.name;
        bestUrl = url || '';
      }
    } catch (e) {
      const errMsg = (e instanceof Error) ? e.message : String(e);
      console.log(`[${market.name}] Error buscando ${searchName}:`, errMsg);
    }
  }
  return bestPrice !== Infinity ? { price: bestPrice, store: bestStore, storeUrl: bestUrl } : null;
}

async function main() {
  const ingredientes = await prisma.ingredient.findMany();
  for (const ing of ingredientes) {
    const result = await scrapePrice(ing.name);
    if (result) {
      await prisma.ingredient.update({
        where: { id: ing.id },
        data: { price: result.price, store: result.store, storeUrl: result.storeUrl }
      });
      console.log(`Actualizado: ${ing.name} - $${result.price} en ${result.store} (${result.storeUrl})`);
    } else {
      console.log(`No se encontró precio para: ${ing.name}`);
    }
  }
  await prisma.$disconnect();
}

main(); 