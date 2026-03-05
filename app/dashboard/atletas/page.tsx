import prisma from "@/lib/prisma";
import { AtletasList } from "@/components/atletas/atletas-list";
import { AtletaDialog } from "@/components/atletas/atleta-dialog";

export const metadata = {
  title: "Atletas - Gestão de Clube Desportivo",
};

export default async function AtletasPage() {
  const atletas = await prisma.atleta.findMany({
    include: {
      equipa: {
        include: {
          modalidade: true,
        },
      },
    },
    orderBy: { nome: "asc" },
  });

  const equipas = await prisma.equipa.findMany({
    include: {
      modalidade: true,
    },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Atletas</h1>
        <AtletaDialog equipas={equipas} />
      </div>

      <AtletasList atletas={atletas} />
    </div>
  );
}
