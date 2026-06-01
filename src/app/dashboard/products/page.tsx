"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

const emptyForm = { name: "", description: "" };

export default function ProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (session && session.user.role !== "ADMIN") router.push("/dashboard");
  }, [session, router]);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => { fetchProducts(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    setForm({ name: product.name, description: product.description || "" });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    setModalOpen(false);
    fetchProducts();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/products/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchProducts();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
          <p className="text-sm text-gray-500">{products.length} produto(s) cadastrado(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Novo produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Carregando...</div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Nenhum produto cadastrado.</div>
        ) : (
          <div className="divide-y">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between px-6 py-4 gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="bg-blue-50 p-2 rounded-lg shrink-0">
                    <Package size={18} className="text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-gray-500 truncate">{product.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(product.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar produto" : "Novo produto"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        message="Tem certeza que deseja excluir este produto?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
