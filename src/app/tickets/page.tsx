"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Ticket {
  id: string;
  imagePath: string;
  total?: number;
  date?: string;
  createdAt: string;
  ocrText?: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [ocrModal, setOcrModal] = useState<{ ocrText: string; ticketId: string } | null>(null);
  const [ocrEdit, setOcrEdit] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tickets?userId=dev_user_1")
      .then((res) => res.json())
      .then((data) => setTickets(Array.isArray(data) ? data : data.tickets || []));
  }, []);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setFormSuccess(null);
    let imagePath = "";
    try {
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        const res = await fetch("/api/tickets/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok || !data.imagePath) throw new Error(data.error || 'Error al subir imagen');
        imagePath = data.imagePath;
      }
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imagePath,
          userId: "dev_user_1",
        }),
      });
      const newTicket = await res.json();
      if (!res.ok) throw new Error(newTicket.error || 'Error al guardar ticket');
      setTickets((prev) => [...prev, newTicket.ticket || newTicket]);
      setShowForm(false);
      setForm({});
      setImageFile(null);
      setFormSuccess('Ticket guardado correctamente');
      if (newTicket.ticket?.ocrText) {
        setOcrEdit(newTicket.ticket.ocrText);
        setOcrModal({ ocrText: newTicket.ticket.ocrText, ticketId: newTicket.ticket.id });
      }
    } catch (err: any) {
      setFormError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tickets / Gastos</h1>
        <Link href="/dashboard">
          <button className="bg-orange-600 text-white px-4 py-2 rounded">Regresar al Dashboard</button>
        </Link>
      </div>
      <div className="flex justify-end mb-4">
        <button className="bg-orange-600 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>
          Subir Ticket
        </button>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded shadow p-6 space-y-4 w-full max-w-md relative" onSubmit={handleSubmit}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowForm(false)}>&times;</button>
            <div>
              <label className="block font-medium">Imagen del ticket</label>
              <input type="file" accept="image/*" onChange={handleImage} required />
            </div>
            <div>
              <label className="block font-medium">Total (opcional)</label>
              <input name="total" type="number" step="0.01" className="border rounded w-full p-2" onChange={handleInput} value={form.total || ""} />
            </div>
            <div>
              <label className="block font-medium">Fecha de compra (opcional)</label>
              <input name="date" type="date" className="border rounded w-full p-2" onChange={handleInput} value={form.date || ""} />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2" disabled={loading}>
                {loading && <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></span>}
                {loading ? "Guardando..." : "Guardar Ticket"}
              </button>
            </div>
            {formError && <div className="mt-2 text-red-600 text-sm text-center">{formError}</div>}
            {formSuccess && <div className="mt-2 text-green-600 text-sm text-center">{formSuccess}</div>}
          </form>
        </div>
      )}
      {ocrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-6 w-full max-w-lg relative">
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setOcrModal(null)}>&times;</button>
            <h2 className="text-lg font-bold mb-2">Validar Ticket (OCR)</h2>
            <p className="text-xs text-gray-500 mb-2">Revisa y corrige la información extraída del ticket antes de guardar definitivamente.</p>
            <textarea
              className="border rounded w-full p-2 mb-4 min-h-[120px]"
              value={ocrEdit}
              onChange={e => setOcrEdit(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => setOcrModal(null)}>Cancelar</button>
              <button className="bg-orange-600 text-white px-4 py-2 rounded" onClick={() => setOcrModal(null)}>
                Confirmar y cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded shadow p-4 flex flex-col items-center">
            <img src={ticket.imagePath} alt="ticket" className="w-40 h-40 object-contain rounded mb-2 bg-gray-50" />
            {ticket.total && <div className="text-sm text-gray-600 mb-1">Total: ${ticket.total}</div>}
            {ticket.date && <div className="text-xs text-gray-500 mb-1">Fecha: {ticket.date}</div>}
            <div className="text-xs text-gray-400">Subido: {new Date(ticket.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 