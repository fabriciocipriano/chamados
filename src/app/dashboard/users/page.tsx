"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, UserCog, Shield, User } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const emptyForm = { name: "", email: "", password: "", role: "EMPLOYEE" };

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(user: UserItem) {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = editingId ? `/api/users/${editingId}` : "/api/users";
    const method = editingId ? "PUT" : "POST";
    const body = { ...form };
    if (editingId && !body.password) delete (body as Record<string, unknown>).password;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    setModalOpen(false);
    fetchUsers();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchUsers();
  }

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
          <p className="text-sm text-gray-500">{users.length} usuário(s) cadastrado(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Novo usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Carregando...</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Nenhum usuário encontrado.</div>
        ) : (
          <div className="divide-y">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-6 py-4 gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${user.role === "ADMIN" ? "bg-purple-50" : "bg-gray-100"}`}>
                    {user.role === "ADMIN" ? (
                      <Shield size={18} className="text-purple-500" />
                    ) : (
                      <User size={18} className="text-gray-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    user.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {user.role === "ADMIN" ? "Admin" : "Funcionário"}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(user)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(user.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar usuário" : "Novo usuário"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha {editingId ? "(deixe em branco para manter)" : "*"}
            </label>
            <input
              type="password"
              required={!editingId}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass}
              placeholder={editingId ? "Nova senha (opcional)" : ""}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
              <option value="EMPLOYEE">Funcionário</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        message="Tem certeza que deseja excluir este usuário?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <UserCog size={14} />
        <span>Somente administradores podem gerenciar usuários</span>
      </div>
    </div>
  );
}
