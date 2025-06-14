"use client";
import { useEffect, useState, Fragment } from "react";
import Link from "next/link";

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  store?: string;
  productUrl?: string;
  description?: string;
  imagePath?: string;
}

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [editIngredient, setEditIngredient] = useState<Ingredient | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ingredients?userId=dev_user_1")
      .then((res) => res.json())
      .then((data) => setIngredients(Array.isArray(data) ? data : data.ingredientes || []));
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditIngredient(ingredient);
    setShowForm(true);
    setForm(ingredient);
    setImageFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar este ingrediente?")) return;
    const res = await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
    if (res.ok) {
      setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setFormSuccess(null);
    let imagePath = form.imagePath || "";
    try {
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        const res = await fetch("/api/ingredients/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok || !data.imagePath) throw new Error(data.error || 'Error al subir imagen');
        imagePath = data.imagePath;
      }
      let res, newIng: any;
      if (editIngredient) {
        res = await fetch(`/api/ingredients/${editIngredient.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, imagePath }),
        });
        newIng = await res.json();
        if (!res.ok) throw new Error(newIng.error || 'Error al actualizar ingrediente');
        setIngredients((prev) => prev.map((ing) => (ing.id === editIngredient.id ? newIng : ing)));
        setFormSuccess('Ingrediente actualizado correctamente');
      } else {
        res = await fetch("/api/ingredients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            imagePath,
            userId: "dev_user_1",
            nutritionalInfo: "{}",
          }),
        });
        newIng = await res.json();
        if (!res.ok) throw new Error(newIng.error || 'Error al guardar ingrediente');
        setIngredients((prev) => [...prev, newIng.ingrediente || newIng]);
        setFormSuccess('Ingrediente guardado correctamente');
      }
      setTimeout(() => {
        setShowForm(false);
        setEditIngredient(null);
        setForm({});
        setImageFile(null);
        setFormSuccess(null);
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventario de Ingredientes</h1>
        <Link href="/dashboard">
          <button className="bg-orange-600 text-white px-4 py-2 rounded">Regresar al Dashboard</button>
        </Link>
      </div>
      {(ingredients.length === 0 || showForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded shadow p-6 space-y-4 w-full max-w-md relative" onSubmit={handleSubmit}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => { setShowForm(false); setEditIngredient(null); }}>&times;</button>
            <div>
              <label className="block font-medium">Nombre</label>
              <input name="name" required className="border rounded w-full p-2" onChange={handleInput} value={form.name || ""} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-medium">Cantidad</label>
                <input name="quantity" type="number" required className="border rounded w-full p-2" onChange={handleInput} value={form.quantity || ""} />
              </div>
              <div className="flex-1">
                <label className="block font-medium">Unidad</label>
                <input name="unit" required className="border rounded w-full p-2" onChange={handleInput} value={form.unit || ""} />
              </div>
            </div>
            <div>
              <label className="block font-medium">Precio</label>
              <input name="price" type="number" step="0.01" className="border rounded w-full p-2" onChange={handleInput} value={form.price || ""} />
            </div>
            <div>
              <label className="block font-medium">Tienda</label>
              <input name="store" className="border rounded w-full p-2" onChange={handleInput} value={form.store || ""} />
            </div>
            <div>
              <label className="block font-medium">Link del producto</label>
              <input name="productUrl" className="border rounded w-full p-2" onChange={handleInput} value={form.productUrl || ""} />
            </div>
            <div>
              <label className="block font-medium">Descripción</label>
              <textarea name="description" className="border rounded w-full p-2" onChange={handleInput} value={form.description || ""} />
            </div>
            <div>
              <label className="block font-medium">Imagen</label>
              <input type="file" accept="image/*" onChange={handleImage} />
              {form.imagePath && !imageFile && (
                <img src={form.imagePath} alt="preview" className="w-16 h-16 object-cover rounded mt-2" />
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => { setShowForm(false); setEditIngredient(null); }}>Cancelar</button>
              <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2" disabled={loading}>
                {loading && <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></span>}
                {loading ? (editIngredient ? "Actualizando..." : "Guardando...") : editIngredient ? "Actualizar" : "Guardar Ingrediente"}
              </button>
            </div>
            {formError && <div className="mt-2 text-red-600 text-sm text-center">{formError}</div>}
            {formSuccess && <div className="mt-2 text-green-600 text-sm text-center">{formSuccess}</div>}
          </form>
        </div>
      )}
      {ingredients.length > 0 && !showForm && (
        <>
          <div className="flex justify-end mb-4">
            <button className="bg-orange-600 text-white px-4 py-2 rounded" onClick={() => { setShowForm(true); setEditIngredient(null); setForm({}); }}>
              Agregar Ingrediente
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {ingredients.map((ing) => (
              <div key={ing.id} className="bg-white rounded shadow p-4 flex flex-col items-center relative">
                {ing.imagePath && (
                  <img src={ing.imagePath} alt={ing.name} className="w-24 h-24 object-cover rounded mb-2" />
                )}
                <h2 className="font-bold text-lg mb-1">{ing.name}</h2>
                <div className="text-sm text-gray-600 mb-1">
                  {ing.quantity} {ing.unit}
                </div>
                {ing.price && <div className="text-sm text-gray-600 mb-1">Precio: ${ing.price}</div>}
                {ing.store && <div className="text-xs text-gray-500 mb-1">Tienda: {ing.store}</div>}
                {ing.productUrl && (
                  <a href={ing.productUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline mb-1">Ver producto</a>
                )}
                {ing.description && <div className="text-xs text-gray-700 mb-1">{ing.description}</div>}
                <div className="flex gap-2 mt-2">
                  <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(ing)}>Editar</button>
                  <button className="text-xs bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDelete(ing.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 