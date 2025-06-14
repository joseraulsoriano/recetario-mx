'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ShoppingItem {
  recipe: any;
  store: any;
  totalPrice: number;
  savings: number;
}

interface ShoppingListContextType {
  shoppingList: ShoppingItem[];
  addToShoppingList: (item: ShoppingItem) => void;
  removeFromShoppingList: (recipeId: string) => void;
  clearShoppingList: () => void;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shoppingList');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const saveList = (list: ShoppingItem[]) => {
    setShoppingList(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shoppingList', JSON.stringify(list));
    }
  };

  const addToShoppingList = (item: ShoppingItem) => {
    const exists = shoppingList.some(i => i.recipe.id === item.recipe.id);
    if (!exists) {
      const newList = [...shoppingList, item];
      saveList(newList);
    }
  };

  const removeFromShoppingList = (recipeId: string) => {
    const newList = shoppingList.filter(i => i.recipe.id !== recipeId);
    saveList(newList);
  };

  const clearShoppingList = () => {
    saveList([]);
  };

  return (
    <ShoppingListContext.Provider value={{ shoppingList, addToShoppingList, removeFromShoppingList, clearShoppingList }}>
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList debe usarse dentro de ShoppingListProvider');
  }
  return context;
} 