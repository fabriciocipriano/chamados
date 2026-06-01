"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSession } from "next-auth/react";

interface TicketType {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

const emptyForm = { name: "", description: "" };

export default function TicketTypesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "ADMIN";

  const [types, setTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchTypes() {
    setLoading(true);
    const res = await fetch("/api/ticket-types");
    const data = await res.json();
    setTypes(data);
    setLoading(false);
  }

  useEffect(() => { fetchTypes(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(type: TicketType) {
    setEditingId(type.id);
    setForm({ name: type.name, description: type.description || "" });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = editingId ? `/api/ticket-types/${editingId}` : "/api/ticket-types";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });

    setSaving(false);
    setModalOpen(false);
    fetchTypes();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/ticket-types/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchTypes();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tipos de Chamado</h1>
          <p className="text-sm text-gray-500">{types.length} tipo(s) cadastrado(s)</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Novo tipo
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Carregando...</div>
        ) : types.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Nenhum tipo cadastrado.</div>
        ) : (
          <div className="divide-y">
            {types.map((type) => (
              <div key={type.id} className="flex items-center justify-between px-6 py-4 gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="bg-pink-50 p-2 rounded-lg shrink-0">
                    <Tag size={18} className="text-pink-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800">{type.name}</p>
                    {type.description && (
                      <p className="text-xs text-gray-500 truncate">{type.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(type)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar tipo"
                  >
                    <Edit size={16} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setDeleteId(type.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isAdmin && (
        <p className="mt-3 text-xs text-gray-400 text-center">Funcionários podem editar tipos, mas não criar ou excluir.</p>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar tipo" : "Novo tipo de chamado"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} message="Tem certeza que deseja excluir este tipo?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
