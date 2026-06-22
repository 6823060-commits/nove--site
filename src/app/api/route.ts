import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  title: z.string().min(2, "Гарчиг дор хаяж 2 тэмдэгт байх ёстой").max(200),
  content: z.string().min(10, "Агуулга дор хаяж 10 тэмдэгт байх ёстой"),
  type: z.enum(["BUG", "FEATURE", "AUTHOR_REQUEST", "NOVEL_REQUEST", "OTHER"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Буруу өгөгдөл" },
      { status: 400 }
    );
  }

  const ticket = await prisma.ticket.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  return NextResponse.json({ ticket }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const where =
    session.user.role === "ADMIN" ? {} : { userId: session.user.id };

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      priority: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ tickets });
}
