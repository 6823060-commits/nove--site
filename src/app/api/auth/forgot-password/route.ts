import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Имэйл хаяг буруу байна" }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration attacks
  if (!user || !user.passwordHash) {
    return NextResponse.json({ ok: true });
  }

  // Invalidate any existing tokens
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expires },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
  } catch (err) {
    console.error("Email send failed:", err);
    return NextResponse.json(
      { error: "Имэйл илгээхэд алдаа гарлаа. Дараа дахин оролдоно уу." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
