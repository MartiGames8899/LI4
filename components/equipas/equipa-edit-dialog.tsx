"use client";

import { useState } from "react";
import { Equipa, Modalidade } from "@prisma/client";
import { updateEquipa } from "@/app/actions/equipas";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { useEffect } from "react";

const equipaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  modalidadeId: z.string().min(1, "Selecione uma modalidade"),
  treinador: z.string().optional(),
});

interface EquipaEditDialogProps {
  equipa: Equipa & { modalidade: Modalidade };
}

export function EquipaEditDialog({ equipa }: EquipaEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [formData, setFormData] = useState({
    nome: equipa.nome,
    modalidadeId: equipa.modalidadeId,
    treinador: equipa.treinador || "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchModalidades();
    }
  }, [isOpen]);

  const fetchModalidades = async () => {
    try {
      const res = await fetch("/api/modalidades");
      const data = await res.json();
      setModalidades(data);
    } catch (err) {
      console.error("Erro ao buscar modalidades:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const validData = equipaSchema.parse(formData);
      await updateEquipa(equipa.id, validData);
      setIsOpen(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("Erro ao atualizar equipa");
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
          Editar Equipa
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
              Modalidade
            </label>
            <select
              value={formData.modalidadeId}
              onChange={(e) =>
                setFormData({ ...formData, modalidadeId: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              disabled={isLoading}
            >
              {modalidades.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Treinador (opcional)
            </label>
            <input
              type="text"
              value={formData.treinador}
              onChange={(e) =>
                setFormData({ ...formData, treinador: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              disabled={isLoading}
            />
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
