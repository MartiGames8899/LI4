"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  user: any;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Atletas", href: "/dashboard/atletas", icon: "👤" },
    { name: "Equipas", href: "/dashboard/equipas", icon: "👥" },
    { name: "Modalidades", href: "/dashboard/modalidades", icon: "🏆" },
  ];

  if (user?.role === "ADMIN") {
    navItems.push(
      { name: "Utilizadores", href: "/dashboard/utilizadores", icon: "🔐" }
    );
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo / Branding */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">Clube</h1>
        <p className="text-xs text-slate-400 mt-1">Gestão Desportiva</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition",
              pathname === item.href
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-400">Logged in as</p>
        <p className="text-sm font-medium truncate">{user?.email}</p>
        <p className="text-xs text-slate-400 mt-1">
          Função: {user?.role === "ADMIN" ? "Administrador" : user?.role === "TREINADOR" ? "Treinador" : "Atleta"}
        </p>
      </div>
    </aside>
  );
}
