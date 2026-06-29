import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  novelId: z.string().min(1),
  status: z.enum(["READING", "PLANNED", "DROPPED", "COMPLETED", "FAVORITE"]),
});

const deleteSchema = z.object({
  novelId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Эхлээд нэвтэрнэ үү." },
        { status: 401 },
      );
    }

    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Буруу өгөгдөл байна." },
        { status: 400 },
      );
    }

    const { novelId, status } = parsed.data;

    const novel = await prisma.novel.findUnique({
      where: {
        id: novelId,
      },
      select: {
        id: true,
      },
    });

    if (!novel) {
      return NextResponse.json(
        { error: "Новел олдсонгүй." },
        { status: 404 },
      );
    }

    const item = await prisma.readingList.upsert({
      where: {
        userId_novelId: {
          userId: session.user.id,
          novelId,
        },
      },
      update: {
        status,
      },
      create: {
        userId: session.user.id,
        novelId,
        status,
      },
      select: {
        id: true,
        novelId: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error) {
    console.error("READING_LIST_POST_ERROR", error);

    return NextResponse.json(
      { error: "Жагсаалтад нэмэх үед серверийн алдаа гарлаа." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Эхлээд нэвтэрнэ үү." },
        { status: 401 },
      );
    }

    const json = await request.json().catch(() => null);
    const parsed = deleteSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Буруу өгөгдөл байна." },
        { status: 400 },
      );
    }

    const { novelId } = parsed.data;

    await prisma.readingList
      .delete({
        where: {
          userId_novelId: {
            userId: session.user.id,
            novelId,
          },
        },
      })
      .catch(() => null);

    return NextResponse.json({
      ok: true,
      deleted: true,
    });
  } catch (error) {
    console.error("READING_LIST_DELETE_ERROR", error);

    return NextResponse.json(
      { error: "Жагсаалтаас хасах үед серверийн алдаа гарлаа." },
      { status: 500 },
    );
  }
}