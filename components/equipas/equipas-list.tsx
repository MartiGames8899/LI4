"use client";

import { Equipa, Modalidade } from "@prisma/client";
import { EquipaRow } from "./equipa-row";

interface EquipasListProps {
  equipas: (Equipa & { modalidade: Modalidade })[];
}

export function EquipasList({ equipas }: EquipasListProps) {
  if (equipas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-slate-600">Nenhuma equipa registada</p>
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
              Modalidade
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Treinador
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {equipas.map((equipa) => (
            <EquipaRow key={equipa.id} equipa={equipa} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
