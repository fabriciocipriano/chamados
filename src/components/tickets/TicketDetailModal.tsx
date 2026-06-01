"use client";

import { X, MapPin, Phone, Home, User, Tag, Calendar, Clock, Package, FileText, Wrench, CheckCircle2, AlertCircle, Circle, MinusCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Product { id: string; name: string }

interface TicketDetail {
  id: string;
  location: string;
  scheduledAt?: string | null;
  status: string;
  need?: string | null;
  notes?: string | null;
  createdAt: string;
  finishedAt?: string | null;
  client: { name: string; phone: string; address: string };
  type: { name: string };
  user: { name: string };
  responsible?: { name: string } | null;
  products: Product[];
}

interface Props {
  ticket: TicketDetail | null;
  onClose: () => void;
}

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

const statusIcon: Record<string, React.ReactNode> = {
  OPEN: <AlertCircle size={16} className="text-blue-500" />,
  IN_PROGRESS: <Clock size={16} className="text-yellow-500" />,
  RESOLVED: <CheckCircle2 size={16} className="text-green-500" />,
  CLOSED: <MinusCircle size={16} className="text-gray-400" />,
};

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-400">{icon}</span>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-sm font-medium ${highlight ? "text-blue-700 text-base" : "text-gray-800"}`}>{value || "—"}</p>
      </div>
    </div>
  );
}

export function TicketDetailModal({ ticket, onClose }: Props) {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {statusIcon[ticket.status]}
              <StatusBadge status={ticket.status} />
            </div>
            <h2 className="text-xl font-bold truncate">{ticket.client.name}</h2>
            <p className="text-blue-200 text-sm mt-0.5">{ticket.type.name} · {ticket.location}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">
          {/* Client info */}
          <Section title="Cliente" icon={<User size={16} />}>
            <InfoRow icon={<User size={14} />} label="Nome" value={ticket.client.name} />
            <InfoRow icon={<Phone size={14} />} label="Telefone" value={ticket.client.phone} highlight />
            <InfoRow icon={<Home size={14} />} label="Endereço" value={ticket.client.address} />
          </Section>

          {/* Ticket info */}
          <Section title="Chamado" icon={<Wrench size={16} />}>
            <div className="grid grid-cols-2 gap-x-4">
              <InfoRow icon={<Tag size={14} />} label="Tipo" value={ticket.type.name} />
              <InfoRow icon={<MapPin size={14} />} label="Local" value={ticket.location} />
              <InfoRow icon={<User size={14} />} label="Criado por" value={ticket.user.name} />
              <InfoRow icon={<User size={14} />} label="Responsável" value={ticket.responsible?.name ?? "—"} />
            </div>
          </Section>

          {/* Products */}
          {ticket.products.length > 0 && (
            <Section title="Produtos" icon={<Package size={16} />}>
              <div className="flex flex-wrap gap-2 pt-1">
                {ticket.products.map((p) => (
                  <span key={p.id} className="bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    {p.name}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Need */}
          {ticket.need && (
            <Section title="Necessidade" icon={<FileText size={16} />}>
              <p className="text-sm text-gray-700 leading-relaxed">{ticket.need}</p>
            </Section>
          )}

          {/* Notes */}
          {ticket.notes && (
            <Section title="Observação" icon={<FileText size={16} />}>
              <p className="text-sm text-gray-700 leading-relaxed">{ticket.notes}</p>
            </Section>
          )}

          {/* Dates */}
          <Section title="Datas" icon={<Calendar size={16} />}>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-400 mb-1">Criado em</p>
                <p className="text-xs font-semibold text-gray-700">{fmt(ticket.createdAt)}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-400 mb-1">Agendado</p>
                <p className="text-xs font-semibold text-gray-700">{fmt(ticket.scheduledAt)}</p>
              </div>
              <div className={`text-center p-3 rounded-lg border ${ticket.finishedAt ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
                <p className="text-xs text-gray-400 mb-1">Finalizado</p>
                <p className={`text-xs font-semibold ${ticket.finishedAt ? "text-green-700" : "text-gray-400"}`}>
                  {fmt(ticket.finishedAt)}
                </p>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
