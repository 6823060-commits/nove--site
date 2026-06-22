import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  novelId: z.string().min(1),
  chapterId: z.string().min(1).optional(),
  content: z.string().min(1).max(2000),
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

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      novelId: parsed.data.novelId,
      chapterId: parsed.data.chapterId,
      userId: session.user.id,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      userId: true,
      user: { select: { name: true } },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
