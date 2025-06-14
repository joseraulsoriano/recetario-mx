"use client";

import { useEffect, useState } from "react";
import RecipeModal from "@/components/RecipeModal";
import { generarRecetasMCP } from "@/utils/mcp";
import type { Ingredient } from "@/types/ingredient";
import Link from "next/link";

export default function RecipesPage() {
  const [guardadas, setGuardadas] = useState<any[]>([]);
  const [sugeridas, setSugeridas] = useState<any[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingredient[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [modalReceta, setModalReceta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("onboarding");
      if (data) setUserData(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Recetas guardadas
      const res = await fetch("/api/recipes/recommended", {
        method: "POST",
        body: JSON.stringify({
          objetivo: userData?.objetivo,
          gustos: userData?.gustos,
          disgustos: userData?.disgustos,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const recetasGuardadas = await res.json();
      setGuardadas(recetasGuardadas);
      // Ingredientes para sugeridas
      const resIng = await fetch("/api/ingredients");
      const ings = await resIng.json();
      setIngredientes(ings);
      setLoading(false);
    };
    if (userData) fetchData();
  }, [userData]);

  useEffect(() => {
    if (!userData || ingredientes.length === 0) return;
    // Generar sugeridas
    const presupuestoDiario = Number(userData.presupuesto) / 7;
    const sugeridas = generarRecetasMCP({
      ingredientes,
      presupuestoDiario,
      gustos: userData.gustos,
      disgustos: userData.disgustos,
      objetivo: userData.objetivo,
    });
    setSugeridas(sugeridas);
  }, [userData, ingredientes]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando recetas...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-orange-700">Todas las Recetas</h1>
        <Link href="/dashboard">
          <button className="bg-orange-600 text-white px-4 py-2 rounded">Regresar al Dashboard</button>
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Tus recetas guardadas</h2>
        {guardadas.length === 0 ? (
          <div className="text-gray-500">No tienes recetas guardadas aún.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guardadas.map((receta, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-5 flex flex-col">
                <h3 className="text-lg font-semibold text-orange-600 mb-2">{receta.name}</h3>
                <div className="text-sm text-gray-700 mb-2">{receta.description}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {receta.ingredients.map((ing: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">{ing.name}</span>
                  ))}
                </div>
                <button
                  className="mt-auto bg-orange-600 text-white rounded-md px-3 py-1 text-sm font-medium hover:bg-orange-700"
                  onClick={() => setModalReceta(receta)}
                >
                  Ver receta
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Recetas sugeridas</h2>
        {sugeridas.length === 0 ? (
          <div className="text-gray-500">No hay sugerencias en este momento.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sugeridas.map((receta, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-5 flex flex-col">
                <h3 className="text-lg font-semibold text-orange-600 mb-2">{receta.name}</h3>
                <div className="text-sm text-gray-700 mb-2">{receta.description}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {receta.ingredients.map((ing: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">{ing.name}</span>
                  ))}
                </div>
                <button
                  className="mt-auto bg-orange-600 text-white rounded-md px-3 py-1 text-sm font-medium hover:bg-orange-700"
                  onClick={() => setModalReceta(receta)}
                >
                  Ver receta
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {modalReceta && (
        <RecipeModal
          receta={modalReceta}
          onClose={() => setModalReceta(null)}
          onFavorite={() => {}}
          isFavorite={false}
        />
      )}
    </div>
  );
} 