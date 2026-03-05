import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const modalidades = await prisma.modalidade.findMany({
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(modalidades);
  } catch (error) {
    console.error("[GET /api/modalidades error]", error);
    return NextResponse.json(
      { error: "Erro ao buscar modalidades" },
      { status: 500 }
    );
  }
}
