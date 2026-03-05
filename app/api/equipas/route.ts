import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const equipas = await prisma.equipa.findMany({
      include: {
        modalidade: true,
      },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(equipas);
  } catch (error) {
    console.error("[GET /api/equipas error]", error);
    return NextResponse.json(
      { error: "Erro ao buscar equipas" },
      { status: 500 }
    );
  }
}
