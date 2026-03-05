import prisma from "@/lib/prisma";
import { EquipasList } from "@/components/equipas/equipas-list";
import { EquipaDialog } from "@/components/equipas/equipa-dialog";

export const metadata = {
  title: "Equipas - Gestão de Clube Desportivo",
};

export default async function EquipasPage() {
  const equipas = await prisma.equipa.findMany({
    include: {
      modalidade: true,
    },
    orderBy: { nome: "asc" },
  });

  const modalidades = await prisma.modalidade.findMany({
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Equipas</h1>
        <EquipaDialog modalidades={modalidades} />
      </div>

      <EquipasList equipas={equipas} />
    </div>
  );
}
