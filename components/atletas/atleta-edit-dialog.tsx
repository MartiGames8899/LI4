"use client";

import { useState, useEffect } from "react";
import { Atleta, Equipa, Modalidade } from "@prisma/client";
import { updateAtleta } from "@/app/actions/atletas";
import { z } from "zod";

const atletaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  numero: z.coerce.number().int().min(0).max(99).optional(),
  posicao: z.string().optional(),
  equipaId: z.string().min(1, "Selecione uma equipa"),
});

interface AtletaEditDialogProps {
  atleta: Atleta & {
    equipa: Equipa & { modalidade: Modalidade };
  };
}

export function AtletaEditDialog({ atleta }: AtletaEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [equipas, setEquipas] = useState<(Equipa & { modalidade: Modalidade })[]>([]);
  const [formData, setFormData] = useState({
    nome: atleta.nome,
    numero: atleta.numero?.toString() || "",
    posicao: atleta.posicao || "",
    equipaId: atleta.equipaId,
  });

  useEffect(() => {
    if (isOpen) {
      fetchEquipas();
    }
  }, [isOpen]);

  const fetchEquipas = async () => {
    try {
      const res = await fetch("/api/equipas");
      const data = await res.json();
      setEquipas(data);
    } catch (err) {
      console.error("Erro ao buscar equipas:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const parseData = {
        nome: formData.nome,
        numero: formData.numero ? parseInt(formData.numero) : undefined,
        posicao: formData.posicao || undefined,
        equipaId: formData.equipaId,
      };

      const validData = atletaSchema.parse(parseData);
      await updateAtleta(atleta.id, validData);
      setIsOpen(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("Erro ao atualizar atleta");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition"
      >
        Editar
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Editar Atleta
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nome
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Número (opcional)
            </label>
            <input
              type="number"
              value={formData.numero}
              onChange={(e) =>
                setFormData({ ...formData, numero: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              disabled={isLoading}
              min="0"
              max="99"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Posição (opcional)
            </label>
            <input
              type="text"
              value={formData.posicao}
              onChange={(e) =>
                setFormData({ ...formData, posicao: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Equipa
            </label>
            <select
              value={formData.equipaId}
              onChange={(e) =>
                setFormData({ ...formData, equipaId: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              disabled={isLoading}
            >
              {equipas.map((equipa) => (
                <option key={equipa.id} value={equipa.id}>
                  {equipa.nome} ({equipa.modalidade.nome})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
