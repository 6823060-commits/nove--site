import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  novelId: z.string().min(1),
  chapterNumber: z.coerce.number().int().positive(),
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Эрхгүй" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Буруу өгөгдөл" }, { status: 400 });
  }

  const chapter = await prisma.chapter
    .create({ data: parsed.data })
    .catch((err: { code?: string }) => {
      if (err?.code === "P2002") return null;
      throw err;
    });

  if (!chapter) {
    return NextResponse.json({ error: "Энэ дугаартай бүлэг бүртгэлтэй байна" }, { status: 409 });
  }

  await prisma.novel.update({ where: { id: parsed.data.novelId }, data: { updatedAt: new Date() } });

  return NextResponse.json({ chapter }, { status: 201 });
}
