import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ novelId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Буруу өгөгдөл" }, { status: 400 });
  }

  await prisma.favorite.upsert({
    where: { userId_novelId: { userId: session.user.id, novelId: parsed.data.novelId } },
    update: {},
    create: { userId: session.user.id, novelId: parsed.data.novelId },
  });

  return NextResponse.json({ favorited: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Буруу өгөгдөл" }, { status: 400 });
  }

  await prisma.favorite
    .delete({
      where: { userId_novelId: { userId: session.user.id, novelId: parsed.data.novelId } },
    })
    .catch(() => {});

  return NextResponse.json({ favorited: false });
}
