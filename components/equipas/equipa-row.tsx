"use client";

import { useState } from "react";
import { Equipa, Modalidade } from "@prisma/client";
import { deleteEquipa } from "@/app/actions/equipas";
import { EquipaEditDialog } from "./equipa-edit-dialog";

interface EquipaRowProps {
  equipa: Equipa & { modalidade: Modalidade };
}

export function EquipaRow({ equipa }: EquipaRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem a certeza que deseja eliminar esta equipa?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteEquipa(equipa.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
        {equipa.nome}
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {equipa.modalidade.nome}
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {equipa.treinador || "-"}
      </td>
      <td className="px-6 py-4 text-sm text-right space-x-2 flex justify-end">
        <EquipaEditDialog equipa={equipa} />
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
