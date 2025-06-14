import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ShoppingListProvider } from "@/context/ShoppingListContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recetario MX - Tu asistente personal de cocina",
  description: "Gestiona tus recetas, presupuesto y tiempo de cocina de manera eficiente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ShoppingListProvider>
          <Navigation />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </ShoppingListProvider>
      </body>
    </html>
  );
}
