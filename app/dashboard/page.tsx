import prisma from "@/lib/prisma";
import { StatsCard } from "@/components/dashboard/stats-card";

export const metadata = {
  title: "Dashboard - Gestão de Clube Desportivo",
};

export default async function DashboardPage() {
  // Fetch stats
  const [atletasCount, equipasCount, modalidadesCount, utilizadoresCount] =
    await Promise.all([
      prisma.atleta.count(),
      prisma.equipa.count(),
      prisma.modalidade.count(),
      prisma.user.count(),
    ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Atletas"
          value={atletasCount}
          icon="👤"
          href="/dashboard/atletas"
          color="blue"
        />
        <StatsCard
          title="Equipas"
          value={equipasCount}
          icon="👥"
          href="/dashboard/equipas"
          color="green"
        />
        <StatsCard
          title="Modalidades"
          value={modalidadesCount}
          icon="🏆"
          href="/dashboard/modalidades"
          color="purple"
        />
        <StatsCard
          title="Utilizadores"
          value={utilizadoresCount}
          icon="🔐"
          href="/dashboard/utilizadores"
          color="orange"
        />
      </div>

      {/* Recent Activity / Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Informações do Sistema
        </h2>
        <p className="text-slate-600">
          Bem-vindo ao sistema de gestão de clube desportivo. Utilize o menu lateral para navegar entre as diferentes secções.
        </p>
      </div>
    </div>
  );
}
