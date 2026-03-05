"use client";

import { Modalidade } from "@prisma/client";
import { ModalidadeRow } from "./modalidade-row";

interface ModalidadesListProps {
  modalidades: Modalidade[];
}

export function ModalidadesList({ modalidades }: ModalidadesListProps) {
  if (modalidades.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-slate-600">Nenhuma modalidade registada</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Nome
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Descrição
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {modalidades.map((modalidade) => (
            <ModalidadeRow key={modalidade.id} modalidade={modalidade} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
