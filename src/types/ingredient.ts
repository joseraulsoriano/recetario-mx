export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number | null;
  store: string | null;
  storeUrl: string | null;
  category: string;
  nutritionalInfo: NutritionalInfo | null;
  expiryDate: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Función helper para parsear nutritionalInfo
export function parseNutritionalInfo(info: string | null): NutritionalInfo | null {
  if (!info) return null;
  try {
    return JSON.parse(info);
  } catch {
    return null;
  }
}

// Función helper para serializar nutritionalInfo
export function stringifyNutritionalInfo(info: NutritionalInfo | null): string | null {
  if (!info) return null;
  return JSON.stringify(info);
} 