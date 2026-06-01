"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Filter, Eye } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge, statusOptions } from "@/components/ui/StatusBadge";
import { TicketDetailModal } from "@/components/tickets/TicketDetailModal";
import { useSession } from "next-auth/react";

interface Product { id: string; name: string; description?: string }
interface Client { id: string; name: string; phone: string; address: string }
interface TicketType { id: string; name: string }
interface UserItem { id: string; name: string }

interface Ticket {
  id: string;
  location: string;
  scheduledAt?: string | null;
  status: string;
  need?: string | null;
  notes?: string | null;
  createdAt: string;
  finishedAt?: string | null;
  client: Client;
  type: TicketType;
  user: UserItem;
  responsible?: UserItem | null;
  products: Product[];
}

const emptyForm = {
  location: "",
  scheduledAt: "",
  status: "OPEN",
  typeId: "",
  clientId: "",
  need: "",
  notes: "",
  responsibleId: "",
  productIds: [] as string[],
};

export default function TicketsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "ADMIN";

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [types, setTypes] = useState<TicketType[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);

  // Status change state for employees
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);
    if (filterType) params.set("typeId", filterType);
    const res = await fetch(`/api/tickets?${params}`);
    setTickets(await res.json());
    setLoading(false);
  }, [search, filterStatus, filterType]);

  useEffect(() => {
    const t = setTimeout(fetchTickets, 300);
    return () => clearTimeout(t);
  }, [fetchTickets]);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
    fetch("/api/ticket-types").then((r) => r.json()).then(setTypes);
    if (isAdmin) {
      fetch("/api/users").then((r) => r.json()).then(setUsers);
      fetch("/api/products").then((r) => r.json()).then(setProducts);
    }
  }, [isAdmin]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(ticket: Ticket) {
    setEditingId(ticket.id);
    setForm({
      location: ticket.location,
      scheduledAt: ticket.scheduledAt ? ticket.scheduledAt.slice(0, 16) : "",
      status: ticket.status,
      typeId: ticket.type.id,
      clientId: ticket.client.id,
      need: ticket.need || "",
      notes: ticket.notes || "",
      responsibleId: ticket.responsible?.id || "",
      productIds: ticket.products.map((p) => p.id),
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editingId ? `/api/tickets/${editingId}` : "/api/tickets";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModalOpen(false);
    fetchTickets();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/tickets/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchTickets();
  }

  async function handleStatusChange(ticketId: string, newStatus: string) {
    setChangingStatusId(ticketId);
    await fetch(`/api/tickets/${ticketId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setChangingStatusId(null);
    fetchTickets();
  }

  function toggleProduct(productId: string) {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chamados</h1>
          <p className="text-sm text-gray-500">{tickets.length} chamado(s)</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Novo chamado
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar chamados..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${showFilters ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <Filter size={15} />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-3 items-center">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os status</option>
              {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os tipos</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {(filterStatus || filterType) && (
              <button onClick={() => { setFilterStatus(""); setFilterType(""); }} className="text-sm text-blue-600 hover:underline">Limpar</button>
            )}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Carregando...</div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Nenhum chamado encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Cliente</th>
                  <th className="px-6 py-3 text-left">Local</th>
                  <th className="px-6 py-3 text-left">Tipo</th>
                  <th className="px-6 py-3 text-left">Responsável</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Criado em</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{ticket.client.name}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-[130px] truncate">{ticket.location}</td>
                    <td className="px-6 py-4 text-gray-600">{ticket.type.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{ticket.responsible?.name ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-6 py-4">
                      {isAdmin ? (
                        <StatusBadge status={ticket.status} />
                      ) : (
                        <select
                          value={ticket.status}
                          disabled={changingStatusId === ticket.id}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className="text-xs font-medium border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer disabled:opacity-60 bg-white"
                        >
                          {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setDetailTicket(ticket)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye size={15} />
                        </button>
                        {isAdmin && (
                          <>
                            <button onClick={() => openEdit(ticket)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                              <Edit size={15} />
                            </button>
                            <button onClick={() => setDeleteId(ticket.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <TicketDetailModal ticket={detailTicket} onClose={() => setDetailTicket(null)} />

      {/* Admin create/edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar chamado" : "Novo chamado"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
              <select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className={inputClass}>
                <option value="">Selecione</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select required value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value })} className={inputClass}>
                <option value="">Selecione</option>
                {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local *</label>
            <input type="text" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <select value={form.responsibleId} onChange={(e) => setForm({ ...form, responsibleId: e.target.value })} className={inputClass}>
                <option value="">Nenhum</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horário agendado</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Necessidade</label>
            <textarea value={form.need} onChange={(e) => setForm({ ...form, need: e.target.value })} rows={2} placeholder="Descreva a necessidade deste chamado..." className={`${inputClass} resize-none`} />
          </div>

          {products.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Produtos</label>
              <div className="border border-gray-200 rounded-lg divide-y max-h-36 overflow-y-auto">
                {products.map((p) => (
                  <label key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.productIds.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700">{p.name}</p>
                      {p.description && <p className="text-xs text-gray-400 truncate">{p.description}</p>}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={`${inputClass} resize-none`} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} message="Tem certeza que deseja excluir este chamado?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
