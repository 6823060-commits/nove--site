import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  adminNote: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });
  }

  if (ticket.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Эрхгүй" }, { status: 403 });
  }

  return NextResponse.json({ ticket });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Эрхгүй" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Буруу өгөгдөл" }, { status: 400 });
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: { ...parsed.data, updatedAt: new Date() },
  });

  return NextResponse.json({ ticket });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({ where: { id } });

  if (!ticket) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });
  if (ticket.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Эрхгүй" }, { status: 403 });
  }

  await prisma.ticket.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
