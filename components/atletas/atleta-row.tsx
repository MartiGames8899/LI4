"use client";

import { useState } from "react";
import { Atleta, Equipa, Modalidade } from "@prisma/client";
import { deleteAtleta } from "@/app/actions/atletas";
import { AtletaEditDialog } from "./atleta-edit-dialog";

interface AtletaRowProps {
  atleta: Atleta & {
    equipa: Equipa & { modalidade: Modalidade };
  };
}

export function AtletaRow({ atleta }: AtletaRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem a certeza que deseja eliminar este atleta?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAtleta(atleta.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
        {atleta.nome}
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {atleta.numero || "-"}
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {atleta.equipa.nome}
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {atleta.posicao || "-"}
      </td>
      <td className="px-6 py-4 text-sm text-right space-x-2 flex justify-end">
        <AtletaEditDialog atleta={atleta} />
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition disabled:opacity-50"
        >
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </button>
      </td>
    </tr>
  );
}
