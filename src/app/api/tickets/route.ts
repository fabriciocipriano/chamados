import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TicketStatus } from "@prisma/client";

const ticketInclude = {
  client: true,
  type: true,
  user: { select: { id: true, name: true } },
  responsible: { select: { id: true, name: true } },
  products: true,
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const typeId = searchParams.get("typeId") || "";
  const clientId = searchParams.get("clientId") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { location: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
      { need: { contains: search, mode: "insensitive" } },
      { client: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (status) where.status = status as TicketStatus;
  if (typeId) where.typeId = typeId;
  if (clientId) where.clientId = clientId;

  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
    };
  }

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: ticketInclude,
  });

  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const { location, scheduledAt, status, typeId, clientId, need, notes, responsibleId, productIds } = body;

  if (!location || !typeId || !clientId) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: {
      location,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: status || "OPEN",
      typeId,
      clientId,
      userId: session.user.id,
      need,
      notes,
      responsibleId: responsibleId || null,
      products: productIds?.length ? { connect: productIds.map((id: string) => ({ id })) } : undefined,
    },
    include: ticketInclude,
  });

  return NextResponse.json(ticket, { status: 201 });
}
