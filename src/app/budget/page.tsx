"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PencilSquareIcon, ReceiptRefundIcon } from '@heroicons/react/24/outline';

interface Ticket {
  id: string;
  imagePath: string;
  total?: number;
  date?: string;
  createdAt: string;
  included?: boolean;
  isManual?: boolean;
  description?: string;
}

export default function BudgetPage() {
  const [presupuesto, setPresupuesto] = useState<number>(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({ total: '', date: '', description: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [editManual, setEditManual] = useState<Ticket | null>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({ total: '', date: '', image: null as File | null });
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Obtener presupuesto y tickets
    const onboarding = localStorage.getItem("onboarding");
    if (onboarding) {
      const data = JSON.parse(onboarding);
      setPresupuesto(Number(data.presupuesto) || 0);
    }
    fetch("/api/tickets?userId=dev_user_1")
      .then((res) => res.json())
      .then((data) => {
        // Solo tickets de la semana actual
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        const weekTickets = (data.tickets || []).map((t: Ticket) => ({
          ...t,
          included: true,
        })).filter((t: Ticket) => {
          const ticketDate = t.date ? new Date(t.date) : new Date(t.createdAt);
          return ticketDate >= weekAgo && ticketDate <= now;
        });
        setTickets(weekTickets);
        setLoading(false);
      });
  }, []);

  const handleToggle = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, included: !t.included } : t))
    );
  };

  const gasto = tickets.filter((t) => t.included && t.total).reduce((sum, t) => sum + (t.total || 0), 0);
  const diferencia = presupuesto - gasto;

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setManualForm({ ...manualForm, [e.target.name]: e.target.value });
  };

  const openEditManual = (ticket: Ticket) => {
    setEditManual(ticket);
    setManualForm({
      total: ticket.total?.toString() || '',
      date: ticket.date ? ticket.date.slice(0, 10) : '',
      description: ticket.description || '',
    });
    setShowManual(true);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    try {
      let res, data;
      if (editManual) {
        res = await fetch(`/api/tickets/${editManual.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            total: manualForm.total,
            date: manualForm.date,
            description: manualForm.description,
            isManual: true,
          }),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al actualizar gasto manual');
        setTickets((prev) => prev.map((t) => (t.id === editManual.id ? { ...data, included: t.included } : t)));
        setFormSuccess('Gasto manual actualizado correctamente');
      } else {
        res = await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'dev_user_1',
            total: manualForm.total,
            date: manualForm.date,
            isManual: true,
            description: manualForm.description,
          }),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al guardar gasto manual');
        setTickets((prev) => [...prev, { ...data.ticket, included: true }]);
        setFormSuccess('Gasto manual guardado correctamente');
      }
      setTimeout(() => {
        setShowManual(false);
        setManualForm({ total: '', date: '', description: '' });
        setEditManual(null);
        setFormSuccess(null);
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Error desconocido');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este gasto/ticket?')) return;
    const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTickets((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleTicketInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.type === 'file') {
      setTicketForm({ ...ticketForm, image: e.target.files ? e.target.files[0] : null });
    } else {
      setTicketForm({ ...ticketForm, [e.target.name]: e.target.value });
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError(null);
    setTicketSuccess(null);
    try {
      let imagePath = '';
      if (ticketForm.image) {
        const fd = new FormData();
        fd.append('image', ticketForm.image);
        const res = await fetch('/api/tickets/upload', {
          method: 'POST',
          body: fd,
        });
        const data = await res.json();
        if (!res.ok || !data.imagePath) throw new Error(data.error || 'Error al subir imagen');
        imagePath = data.imagePath;
      }
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'dev_user_1',
          total: ticketForm.total,
          date: ticketForm.date,
          imagePath,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar ticket');
      setTickets((prev) => [...prev, { ...data.ticket, included: true }]);
      setTicketSuccess('Ticket guardado correctamente');
      setTimeout(() => {
        setShowTicket(false);
        setTicketForm({ total: '', date: '', image: null });
        setTicketSuccess(null);
      }, 1200);
    } catch (err: any) {
      setTicketError(err.message || 'Error desconocido');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Detalle de Presupuesto Semanal</h1>
        <Link href="/dashboard">
          <button className="bg-orange-600 text-white px-4 py-2 rounded">Regresar al Dashboard</button>
        </Link>
      </div>
      <div className="flex justify-end mb-4 gap-2">
        <button className="bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2" onClick={() => setShowManual(true)}>
          <PencilSquareIcon className="h-5 w-5" /> Agregar gasto manual
        </button>
        <button className="bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2" onClick={() => setShowTicket(true)}>
          <ReceiptRefundIcon className="h-5 w-5" /> Agregar ticket
        </button>
      </div>
      {showManual && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded shadow p-6 space-y-4 w-full max-w-md relative" onSubmit={handleManualSubmit}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowManual(false)}>&times;</button>
            <h2 className="text-lg font-bold mb-2">Agregar gasto manual</h2>
            <div>
              <label className="block font-medium">Monto</label>
              <input name="total" type="number" step="0.01" required className="border rounded w-full p-2" onChange={handleManualInput} value={manualForm.total} />
            </div>
            <div>
              <label className="block font-medium">Fecha</label>
              <input name="date" type="date" required className="border rounded w-full p-2" onChange={handleManualInput} value={manualForm.date} />
            </div>
            <div>
              <label className="block font-medium">Descripción</label>
              <textarea name="description" className="border rounded w-full p-2" onChange={handleManualInput} value={manualForm.description} />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => setShowManual(false)}>Cancelar</button>
              <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded">Guardar</button>
            </div>
            {formError && <div className="mt-2 text-red-600 text-sm text-center">{formError}</div>}
            {formSuccess && <div className="mt-2 text-green-600 text-sm text-center">{formSuccess}</div>}
          </form>
        </div>
      )}
      {showTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded shadow p-6 space-y-4 w-full max-w-md relative" onSubmit={handleTicketSubmit}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowTicket(false)}>&times;</button>
            <h2 className="text-lg font-bold mb-2">Agregar ticket</h2>
            <div>
              <label className="block font-medium">Imagen del ticket</label>
              <input type="file" accept="image/*" onChange={handleTicketInput} required />
            </div>
            <div>
              <label className="block font-medium">Total</label>
              <input name="total" type="number" step="0.01" required className="border rounded w-full p-2" onChange={handleTicketInput} value={ticketForm.total} />
            </div>
            <div>
              <label className="block font-medium">Fecha</label>
              <input name="date" type="date" required className="border rounded w-full p-2" onChange={handleTicketInput} value={ticketForm.date} />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => setShowTicket(false)}>Cancelar</button>
              <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded">Guardar</button>
            </div>
            {ticketError && <div className="mt-2 text-red-600 text-sm text-center">{ticketError}</div>}
            {ticketSuccess && <div className="mt-2 text-green-600 text-sm text-center">{ticketSuccess}</div>}
          </form>
        </div>
      )}
      <div className="bg-white rounded shadow p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-gray-500 text-sm">Presupuesto semanal</div>
            <div className="text-2xl font-bold">${presupuesto}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Gastado</div>
            <div className="text-2xl font-bold text-green-600">${gasto.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Diferencia</div>
            <div className={`text-2xl font-bold ${diferencia < 0 ? "text-red-600" : "text-gray-900"}`}>${diferencia.toFixed(2)}</div>
          </div>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-4">Tickets de la semana</h2>
      {loading ? (
        <div className="text-center text-gray-500">Cargando tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center text-gray-500">No hay tickets registrados esta semana.</div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className={`flex items-center rounded p-4 gap-4 ${ticket.isManual ? 'bg-yellow-50 border border-yellow-300' : 'bg-gray-50'}`}>
              <input
                type="checkbox"
                checked={ticket.included}
                onChange={() => handleToggle(ticket.id)}
                className="accent-orange-600 h-5 w-5"
              />
              {ticket.isManual ? (
                <div className="w-16 h-16 flex items-center justify-center bg-yellow-100 rounded border border-yellow-300">
                  <PencilSquareIcon className="h-8 w-8 text-yellow-600" />
                </div>
              ) : (
                <img src={ticket.imagePath} alt="ticket" className="w-16 h-16 object-contain rounded bg-white border" />
              )}
              <div className="flex-1">
                <div className="font-medium">Total: <span className="text-orange-700">${ticket.total?.toFixed(2) || "-"}</span></div>
                {ticket.isManual && ticket.description && <div className="text-xs text-yellow-700">{ticket.description}</div>}
                <div className="text-xs text-gray-500">Fecha: {ticket.date || ticket.createdAt}</div>
              </div>
              {ticket.isManual && (
                <button className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded" onClick={() => openEditManual(ticket)}>Editar</button>
              )}
              <button className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDelete(ticket.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 