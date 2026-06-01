import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TicketCheck, Users, Tag, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  const [totalTickets, openTickets, inProgressTickets, resolvedTickets, totalClients, totalTypes] =
    await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "OPEN" } }),
      prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { status: "RESOLVED" } }),
      prisma.client.count(),
      prisma.ticketType.count(),
    ]);

  const recentTickets = await prisma.ticket.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      type: true,
      user: { select: { name: true } },
    },
  });

  const statusMap: Record<string, { label: string; className: string }> = {
    OPEN: { label: "Aberto", className: "bg-blue-100 text-blue-700" },
    IN_PROGRESS: { label: "Em andamento", className: "bg-yellow-100 text-yellow-700" },
    RESOLVED: { label: "Resolvido", className: "bg-green-100 text-green-700" },
    CLOSED: { label: "Fechado", className: "bg-gray-100 text-gray-600" },
  };

  const cards = [
    { label: "Total de Chamados", value: totalTickets, icon: TicketCheck, color: "bg-blue-500" },
    { label: "Abertos", value: openTickets, icon: AlertCircle, color: "bg-orange-500" },
    { label: "Em Andamento", value: inProgressTickets, icon: Clock, color: "bg-yellow-500" },
    { label: "Resolvidos", value: resolvedTickets, icon: CheckCircle, color: "bg-green-500" },
    { label: "Clientes", value: totalClients, icon: Users, color: "bg-purple-500" },
    { label: "Tipos de Chamado", value: totalTypes, icon: Tag, color: "bg-pink-500" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Olá, {session?.user.name}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Resumo do sistema</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-700">Chamados Recentes</h2>
        </div>
        <div className="divide-y">
          {recentTickets.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-gray-400">Nenhum chamado ainda.</p>
          ) : (
            recentTickets.map((ticket: typeof recentTickets[0]) => {
              const s = statusMap[ticket.status];
              return (
                <div key={ticket.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{ticket.client.name}</p>
                    <p className="text-xs text-gray-500 truncate">{ticket.location} · {ticket.type.name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
                      {s.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {resolvedTickets > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <XCircle size={14} />
          <span>{resolvedTickets} chamado(s) resolvido(s) no total</span>
        </div>
      )}
    </div>
  );
}
