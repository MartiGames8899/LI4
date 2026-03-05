import prisma from "@/lib/prisma";
import { ModalidadesList } from "@/components/modalidades/modalidades-list";
import { ModalidadeDialog } from "@/components/modalidades/modalidade-dialog";

export const metadata = {
  title: "Modalidades - Gestão de Clube Desportivo",
};

export default async function ModalidadesPage() {
  const modalidades = await prisma.modalidade.findMany({
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Modalidades</h1>
        <ModalidadeDialog />
      </div>

      <ModalidadesList modalidades={modalidades} />
    </div>
  );
}
