import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  novelId: z.string().min(1),
  status: z.enum(["READING", "PLANNED", "DROPPED", "COMPLETED", "FAVORITE"]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Буруу өгөгдөл" }, { status: 400 });
  }

  const { novelId, status } = parsed.data;

  const item = await prisma.readingList.upsert({
    where: { userId_novelId: { userId: session.user.id, novelId } },
    update: { status, updatedAt: new Date() },
    create: { userId: session.user.id, novelId, status },
  });

  return NextResponse.json({ item });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const { novelId } = await request.json().catch(() => ({}));
  if (!novelId) {
    return NextResponse.json({ error: "Буруу өгөгдөл" }, { status: 400 });
  }

  await prisma.readingList
    .delete({
      where: { userId_novelId: { userId: session.user.id, novelId } },
    })
    .catch(() => {});

  return NextResponse.json({ deleted: true });
}
