import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET() {
  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ genres });
}

const bodySchema = z.object({ name: z.string().min(2).max(40) });

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Эрхгүй" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Буруу өгөгдөл" }, { status: 400 });
  }

  const genre = await prisma.genre
    .create({
      data: { name: parsed.data.name, slug: slugify(parsed.data.name) || `genre-${Date.now()}` },
    })
    .catch(() => null);

  if (!genre) {
    return NextResponse.json({ error: "Энэ төрөл бүртгэлтэй байна" }, { status: 409 });
  }

  return NextResponse.json({ genre }, { status: 201 });
}
