"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  user: any;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Bem-vindo, {user?.name}!
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Gestão de Clube Desportivo
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
      >
        Sair
      </button>
    </header>
  );
}
