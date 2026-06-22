import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const { id } = await params;
  const comment = await prisma.comment.findUnique({ where: { id } });

  if (!comment) {
    return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });
  }

  if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Эрхгүй" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
