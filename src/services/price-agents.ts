import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuración de tiendas
const SUPERMARKETS = [
  {
    name: 'Walmart',
    searchUrl: (q: string) => `https://www.walmart.com.mx/productos?Ntt=${encodeURIComponent(q)}`,
    priceSelector: '.product-price',
    getPriceAndUrl: ($: cheerio.CheerioAPI) => {
      const priceText = $('.product-price').first().text().replace(/[^\d.,]/g, '').replace(',', '.');
      const url = $('.product-price').first().closest('a').attr('href');
      return { 
        price: parseFloat(priceText), 
        url: url ? `https://www.walmart.com.mx${url}` : undefined 
      };
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
      return { 
        price: parseFloat(priceText), 
        url: url ? `https://www.chedraui.com.mx${url}` : undefined 
      };
    }
  }
];

// Mapeo de nombres de ingredientes a términos de búsqueda
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

interface PriceResult {
  store: string;
  price: number;
  url?: string;
  timestamp: Date;
}

interface IngredientPrice {
  ingredientId: string;
  name: string;
  prices: PriceResult[];
  bestPrice: PriceResult;
}

export class PriceAgent {
  private static instance: PriceAgent;
  private isRunning: boolean = false;
  private lastUpdate: Date | null = null;

  private constructor() {}

  static getInstance(): PriceAgent {
    if (!PriceAgent.instance) {
      PriceAgent.instance = new PriceAgent();
    }
    return PriceAgent.instance;
  }

  async searchPrice(ingredientName: string, store?: string): Promise<PriceResult[]> {
    const searchTerm = SEARCH_NAME_MAP[ingredientName] || ingredientName;
    const stores = store ? SUPERMARKETS.filter(s => s.name === store) : SUPERMARKETS;
    const results: PriceResult[] = [];

    for (const store of stores) {
      try {
        const response = await axios.get(store.searchUrl(searchTerm));
        const $ = cheerio.load(response.data);
        const { price, url } = store.getPriceAndUrl($);
        
        if (price) {
          results.push({
            store: store.name,
            price,
            url,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error(`Error buscando en ${store.name}:`, error);
      }
    }

    return results;
  }

  async updatePrices(userId: string, store?: string): Promise<{results: IngredientPrice[], errors: string[]}> {
    if (this.isRunning) {
      throw new Error('Ya hay una actualización de precios en curso');
    }

    this.isRunning = true;
    const errors: string[] = [];
    try {
      // Obtener ingredientes del usuario
      const ingredients = await prisma.ingredient.findMany({
        where: { userId }
      });

      const results: IngredientPrice[] = [];
      for (const ingredient of ingredients) {
        const searchTerm = SEARCH_NAME_MAP[ingredient.name] || ingredient.name;
        const stores = store ? SUPERMARKETS.filter(s => s.name === store) : SUPERMARKETS;
        let prices: PriceResult[] = [];
        for (const s of stores) {
          try {
            const response = await axios.get(s.searchUrl(searchTerm));
            const $ = cheerio.load(response.data);
            const { price, url } = s.getPriceAndUrl($);
            if (price) {
              prices.push({
                store: s.name,
                price,
                url,
                timestamp: new Date()
              });
            }
          } catch (error) {
            console.error(`Error buscando en ${s.name}:`, error);
            errors.push(`No se pudo actualizar precios en ${s.name} para ${ingredient.name}`);
          }
        }
        if (prices.length > 0) {
          const bestPrice = prices.reduce((best, current) =>
            current.price < best.price ? current : best
          );
          await prisma.ingredient.update({
            where: { id: ingredient.id },
            data: {
              price: bestPrice.price,
              store: bestPrice.store,
              storeUrl: bestPrice.url
            }
          });
          results.push({
            ingredientId: ingredient.id,
            name: ingredient.name,
            prices,
            bestPrice
          });
        }
      }
      this.lastUpdate = new Date();
      return { results, errors };
    } finally {
      this.isRunning = false;
    }
  }

  getLastUpdate(): Date | null {
    return this.lastUpdate;
  }

  isUpdating(): boolean {
    return this.isRunning;
  }
}

// Exportar una instancia singleton
export const priceAgent = PriceAgent.getInstance(); 