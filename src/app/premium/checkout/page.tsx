import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/premium");

  const { planId } = await searchParams;
  if (!planId) redirect("/premium");

  const plan = await prisma.premiumPlan.findUnique({ where: { id: planId, isActive: true } });
  if (!plan) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-paper">Захиалга баталгаажуулах</h1>
        <p className="mt-1 text-sm text-mist-dim">
          Төлбөр хийснээр Premium эрх шууд идэвхжинэ
        </p>
      </div>
      <Suspense>
        <CheckoutForm plan={plan} />
      </Suspense>
    </div>
  );
}
