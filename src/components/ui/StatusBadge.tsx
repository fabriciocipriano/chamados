const statusMap: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Aberto", className: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "Em andamento", className: "bg-yellow-100 text-yellow-700" },
  RESOLVED: { label: "Resolvido", className: "bg-green-100 text-green-700" },
  CLOSED: { label: "Fechado", className: "bg-gray-100 text-gray-600" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}

export const statusOptions = Object.entries(statusMap).map(([value, { label }]) => ({
  value,
  label,
}));
