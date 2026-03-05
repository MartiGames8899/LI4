"use client";

import { useState } from "react";
import { Modalidade } from "@prisma/client";
import { deleteModalidade } from "@/app/actions/modalidades";
import { ModalidadeEditDialog } from "./modalidade-edit-dialog";

interface ModalidadeRowProps {
  modalidade: Modalidade;
}

export function ModalidadeRow({ modalidade }: ModalidadeRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem a certeza que deseja eliminar esta modalidade?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteModalidade(modalidade.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
        {modalidade.nome}
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {modalidade.descricao || "-"}
      </td>
      <td className="px-6 py-4 text-sm text-right space-x-2 flex justify-end">
        <ModalidadeEditDialog modalidade={modalidade} />
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
