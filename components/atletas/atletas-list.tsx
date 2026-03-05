"use client";

import { Atleta, Equipa, Modalidade } from "@prisma/client";
import { AtletaRow } from "./atleta-row";

interface AtletasListProps {
  atletas: (Atleta & {
    equipa: Equipa & { modalidade: Modalidade };
  })[];
}

export function AtletasList({ atletas }: AtletasListProps) {
  if (atletas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-slate-600">Nenhum atleta registado</p>
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
              Número
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Equipa
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Posição
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {atletas.map((atleta) => (
            <AtletaRow key={atleta.id} atleta={atleta} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
