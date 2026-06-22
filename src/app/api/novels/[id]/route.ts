import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  author: z.string().min(1),
  description: z.string().min(1),
  coverImage: z.string().url().optional().or(z.literal("")),
  status: z.enum(["ONGOING", "COMPLETED", "HIATUS"]),
  genreIds: z.array(z.string()).default([]),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Эрхгүй" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Буруу өгөгдөл" }, { status: 400 });
  }

  const { genreIds, coverImage, ...data } = parsed.data;

  const updated = await prisma
    .$transaction(async (tx) => {
      await tx.novelGenre.deleteMany({ where: { novelId: id } });
      return tx.novel.update({
        where: { id },
        data: {
          ...data,
          coverImage: coverImage || null,
          genres: { create: genreIds.map((genreId) => ({ genreId })) },
        },
      });
    })
    .catch((err: { code?: string }) => {
      if (err?.code === "P2002") return null;
      throw err;
    });

  if (!updated) {
    return NextResponse.json({ error: "Энэ slug-тай новел бүртгэлтэй байна" }, { status: 409 });
  }

  return NextResponse.json({ novel: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Эрхгүй" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.novel.delete({ where: { id } }).catch(() => {});

  return NextResponse.json({ deleted: true });
}
