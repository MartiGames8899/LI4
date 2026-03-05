"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/auth";

const equipaSchema = z.object({
  nome: z.string().min(2),
  modalidadeId: z.string().min(1),
  treinador: z.string().optional(),
});

export async function createEquipa(data: z.infer<typeof equipaSchema>) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Não autenticado");
    }

    const validData = equipaSchema.parse(data);

    await prisma.equipa.create({
      data: {
        nome: validData.nome,
        modalidadeId: validData.modalidadeId,
        treinador: validData.treinador,
      },
    });

    revalidatePath("/dashboard/equipas");
  } catch (error) {
    console.error("[createEquipa error]", error);
    throw error;
  }
}

export async function updateEquipa(
  id: string,
  data: z.infer<typeof equipaSchema>
) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Não autenticado");
    }

    const validData = equipaSchema.parse(data);

    await prisma.equipa.update({
      where: { id },
      data: {
        nome: validData.nome,
        modalidadeId: validData.modalidadeId,
        treinador: validData.treinador,
      },
    });

    revalidatePath("/dashboard/equipas");
  } catch (error) {
    console.error("[updateEquipa error]", error);
    throw error;
  }
}

export async function deleteEquipa(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Não autenticado");
    }

    await prisma.equipa.delete({
      where: { id },
    });

    revalidatePath("/dashboard/equipas");
  } catch (error) {
    console.error("[deleteEquipa error]", error);
    throw error;
  }
}
