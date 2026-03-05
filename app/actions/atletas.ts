"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/auth";

const atletaSchema = z.object({
  nome: z.string().min(2),
  numero: z.number().int().min(0).max(99).optional(),
  posicao: z.string().optional(),
  equipaId: z.string().min(1),
});

export async function createAtleta(data: z.infer<typeof atletaSchema>) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Não autenticado");
    }

    const validData = atletaSchema.parse(data);

    await prisma.atleta.create({
      data: {
        nome: validData.nome,
        numero: validData.numero,
        posicao: validData.posicao,
        equipaId: validData.equipaId,
      },
    });

    revalidatePath("/dashboard/atletas");
  } catch (error) {
    console.error("[createAtleta error]", error);
    throw error;
  }
}

export async function updateAtleta(
  id: string,
  data: z.infer<typeof atletaSchema>
) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Não autenticado");
    }

    const validData = atletaSchema.parse(data);

    await prisma.atleta.update({
      where: { id },
      data: {
        nome: validData.nome,
        numero: validData.numero,
        posicao: validData.posicao,
        equipaId: validData.equipaId,
      },
    });

    revalidatePath("/dashboard/atletas");
  } catch (error) {
    console.error("[updateAtleta error]", error);
    throw error;
  }
}

export async function deleteAtleta(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Não autenticado");
    }

    await prisma.atleta.delete({
      where: { id },
    });

    revalidatePath("/dashboard/atletas");
  } catch (error) {
    console.error("[deleteAtleta error]", error);
    throw error;
  }
}
