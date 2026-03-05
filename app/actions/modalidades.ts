"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/auth";

const modalidadeSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
});

export async function createModalidade(data: z.infer<typeof modalidadeSchema>) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Não autenticado");
    }

    const validData = modalidadeSchema.parse(data);

    await prisma.modalidade.create({
      data: {
        nome: validData.nome,
        descricao: validData.descricao,
      },
    });

    revalidatePath("/dashboard/modalidades");
  } catch (error) {
    console.error("[createModalidade error]", error);
    throw error;
  }
}

export async function updateModalidade(
  id: string,
  data: z.infer<typeof modalidadeSchema>
) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Não autenticado");
    }

    const validData = modalidadeSchema.parse(data);

    await prisma.modalidade.update({
      where: { id },
      data: {
        nome: validData.nome,
        descricao: validData.descricao,
      },
    });

    revalidatePath("/dashboard/modalidades");
  } catch (error) {
    console.error("[updateModalidade error]", error);
    throw error;
  }
}

export async function deleteModalidade(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Não autenticado");
    }

    await prisma.modalidade.delete({
      where: { id },
    });

    revalidatePath("/dashboard/modalidades");
  } catch (error) {
    console.error("[deleteModalidade error]", error);
    throw error;
  }
}
