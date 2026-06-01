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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({ where: { id }, include: ticketInclude });

  if (!ticket) return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 });
  return NextResponse.json(ticket);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Employee can only update status
  if (session.user.role === "EMPLOYEE") {
    const { status } = body;
    if (!status) return NextResponse.json({ error: "Status é obrigatório" }, { status: 400 });

    const finishedAt = status === "RESOLVED" || status === "CLOSED" ? new Date() : null;
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status: status as TicketStatus, finishedAt },
      include: ticketInclude,
    });
    return NextResponse.json(ticket);
  }

  // Admin: full update
  const { location, scheduledAt, status, typeId, clientId, need, notes, responsibleId, productIds } = body;

  const finishedAt = status === "RESOLVED" || status === "CLOSED" ? new Date() : null;

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      location,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: status as TicketStatus,
      typeId,
      clientId,
      need,
      notes,
      finishedAt,
      responsibleId: responsibleId || null,
      products: { set: productIds?.length ? productIds.map((pid: string) => ({ id: pid })) : [] },
    },
    include: ticketInclude,
  });

  return NextResponse.json(ticket);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.ticket.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
