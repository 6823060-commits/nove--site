import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ planId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Буруу өгөгдөл" }, { status: 400 });
  }

  const plan = await prisma.premiumPlan.findUnique({ where: { id: parsed.data.planId } });
  if (!plan) {
    return NextResponse.json({ error: "Тарифийн төлөвлөгөө олдсонгүй" }, { status: 404 });
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.duration);

  const subscription = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      planId: plan.id,
      endDate,
      status: "PENDING",
      payment: {
        create: {
          amount: plan.price,
          currency: "MNT",
          status: "PENDING",
        },
      },
    },
    include: { payment: true, plan: true },
  });

  return NextResponse.json({ subscription }, { status: 201 });
}
