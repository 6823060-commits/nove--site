import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  subscriptionId: z.string().min(1),
  method: z.enum(["qpay", "card", "socialpay"]),
  transactionId: z.string().optional(),
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

  const { subscriptionId, method, transactionId } = parsed.data;

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { payment: true, plan: true },
  });

  if (!subscription || subscription.userId !== session.user.id) {
    return NextResponse.json({ error: "Захиалга олдсонгүй" }, { status: 404 });
  }

  if (subscription.status !== "PENDING") {
    return NextResponse.json({ error: "Захиалга аль хэдийн боловсруулагдсан" }, { status: 400 });
  }

  // *** REAL PAYMENT GATEWAY HOOK ***
  // QPay, SocialPay, Stripe гэх мэт үйлчилгээтэй холбохдоо
  // энд verifyPayment(transactionId) дуудна
  // Жишээ нь QPay: const verified = await qpayVerify(transactionId);
  // if (!verified) return error
  const paymentSucceeded = true; // mock

  if (!paymentSucceeded) {
    await prisma.payment.update({
      where: { subscriptionId },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ error: "Төлбөр баталгаажаагүй" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "ACTIVE" },
    }),
    prisma.payment.update({
      where: { subscriptionId },
      data: {
        status: "COMPLETED",
        method,
        transactionId: transactionId ?? `TXN-${Date.now()}`,
        paidAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        isPremium: true,
        premiumExpiresAt: subscription.endDate,
      },
    }),
  ]);

  return NextResponse.json({ success: true, expiresAt: subscription.endDate });
}
