import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const types = await prisma.ticketType.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description } = body;

  if (!name) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

  const type = await prisma.ticketType.create({ data: { name, description } });
  return NextResponse.json(type, { status: 201 });
}
