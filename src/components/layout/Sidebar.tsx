"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Users, TicketCheck, Tag, BarChart2, UserCog, LogOut, Menu, X, Package } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart2, exact: true },
  { href: "/dashboard/tickets", label: "Chamados", icon: TicketCheck },
  { href: "/dashboard/clients", label: "Clientes", icon: Users },
  { href: "/dashboard/ticket-types", label: "Tipos", icon: Tag },
  { href: "/dashboard/reports", label: "Pesquisas", icon: BarChart2 },
];

const adminItems = [
  { href: "/dashboard/products", label: "Produtos", icon: Package },
  { href: "/dashboard/users", label: "Usuários", icon: UserCog },
];

interface SidebarProps {
  userRole: string;
  userName: string;
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const NavLink = ({ href, label, icon: Icon, exact }: typeof navItems[0]) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive(href, exact)
          ? "bg-blue-600 text-white"
          : "text-gray-300 hover:bg-gray-700 hover:text-white"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white">Sistema de Chamados</h1>
        <p className="text-xs text-gray-400 mt-1 truncate">{userName}</p>
        <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${userRole === "ADMIN" ? "bg-purple-800 text-purple-200" : "bg-gray-700 text-gray-300"}`}>
          {userRole === "ADMIN" ? "Administrador" : "Funcionário"}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {userRole === "ADMIN" && (
          <>
            <div className="pt-4 pb-1 px-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</p>
            </div>
            {adminItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sidebarContent}
      </aside>

      <aside className="hidden lg:flex lg:flex-col w-64 bg-gray-800 min-h-screen">
        {sidebarContent}
      </aside>
    </>
  );
}
