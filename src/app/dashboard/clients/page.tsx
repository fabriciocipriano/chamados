"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, User } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSession } from "next-auth/react";

interface Client {
  id: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string;
  _count: { tickets: number };
}

interface FormData { name: string; address: string; phone: string }
const emptyForm: FormData = { name: "", address: "", phone: "" };

export default function ClientsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "ADMIN";

  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/clients?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setClients(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchClients, 300);
    return () => clearTimeout(timer);
  }, [fetchClients]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(client: Client) {
    setEditingId(client.id);
    setForm({ name: client.name, address: client.address, phone: client.phone });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editingId ? `/api/clients/${editingId}` : "/api/clients";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setModalOpen(false);
    fetchClients();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/clients/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchClients();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-sm text-gray-500">{clients.length} cliente(s) cadastrado(s)</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Novo cliente
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Carregando...</div>
        ) : clients.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Nenhum cliente encontrado.</div>
        ) : (
          <div className="divide-y">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between px-6 py-4 gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="bg-gray-100 p-2 rounded-lg shrink-0">
                    <User size={18} className="text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{client.name}</p>
                    <p className="text-xs text-gray-500 truncate">{client.address}</p>
                    <p className="text-xs text-gray-400">{client.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-gray-400 hidden sm:block">{client._count.tickets} chamado(s)</span>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(client)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setDeleteId(client.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isAdmin && (
        <p className="mt-3 text-xs text-gray-400 text-center">Somente administradores podem criar ou editar clientes.</p>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar cliente" : "Novo cliente"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
            <input type="text" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
            <input type="text" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} message="Tem certeza que deseja excluir este cliente?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
