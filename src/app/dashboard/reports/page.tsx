"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Download } from "lucide-react";
import { StatusBadge, statusOptions } from "@/components/ui/StatusBadge";

interface Ticket {
  id: string;
  location: string;
  products: { id: string; name: string }[];
  scheduledAt?: string | null;
  status: string;
  need?: string | null;
  notes?: string | null;
  createdAt: string;
  finishedAt?: string | null;
  client: { name: string };
  type: { name: string };
  user: { name: string };
  responsible?: { name: string } | null;
}

interface TicketType { id: string; name: string }
interface Client { id: string; name: string }

export default function ReportsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [types, setTypes] = useState<TicketType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [typeId, setTypeId] = useState("");
  const [clientId, setClientId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetch("/api/ticket-types").then((r) => r.json()).then(setTypes);
    fetch("/api/clients").then((r) => r.json()).then(setClients);
  }, []);

  const search_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (typeId) params.set("typeId", typeId);
    if (clientId) params.set("clientId", clientId);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    const res = await fetch(`/api/tickets?${params}`);
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  }, [search, status, typeId, clientId, dateFrom, dateTo]);

  function handleExportCSV() {
    if (!tickets.length) return;

    const headers = ["Cliente", "Local", "Tipo", "Produtos", "Status", "Responsável", "Necessidade", "Data Criação", "Data Finalização", "Observação"];
    const rows = tickets.map((t) => [
      t.client.name,
      t.location,
      t.type.name,
      t.products.map((p) => p.name).join(", "),
      t.status,
      t.responsible?.name || t.user.name,
      t.need || "",
      new Date(t.createdAt).toLocaleDateString("pt-BR"),
      t.finishedAt ? new Date(t.finishedAt).toLocaleDateString("pt-BR") : "",
      t.notes || "",
    ]);

    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chamados_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const selectClass = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pesquisas</h1>
          <p className="text-sm text-gray-500">Consulte e filtre chamados</p>
        </div>
        {tickets.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">Filtros de pesquisa</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Busca livre</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Local, cliente, observação..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${selectClass} w-full`}>
              <option value="">Todos</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
            <select value={typeId} onChange={(e) => setTypeId(e.target.value)} className={`${selectClass} w-full`}>
              <option value="">Todos</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cliente</label>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={`${selectClass} w-full`}>
              <option value="">Todos</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data inicial</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`${selectClass} w-full`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data final</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`${selectClass} w-full`}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => {
              setSearch(""); setStatus(""); setTypeId(""); setClientId("");
              setDateFrom(""); setDateTo(""); setTickets([]);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Limpar
          </button>
          <button
            onClick={search_}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Pesquisando..." : "Pesquisar"}
          </button>
        </div>
      </div>

      {tickets.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <p className="text-sm text-gray-600">{tickets.length} resultado(s) encontrado(s)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Cliente</th>
                  <th className="px-6 py-3 text-left">Local</th>
                  <th className="px-6 py-3 text-left">Tipo</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Criado em</th>
                  <th className="px-6 py-3 text-left">Finalizado em</th>
                  <th className="px-6 py-3 text-left">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{ticket.client.name}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-[120px] truncate">{ticket.location}</td>
                    <td className="px-6 py-4 text-gray-600">{ticket.type.name}</td>
                    <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {ticket.finishedAt ? new Date(ticket.finishedAt).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{ticket.user.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm py-12 text-center text-sm text-gray-400">
          Use os filtros acima e clique em Pesquisar para ver os resultados.
        </div>
      )}
    </div>
  );
}
