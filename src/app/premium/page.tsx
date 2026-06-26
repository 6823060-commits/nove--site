import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function formatPrice(price: number) {
  return price.toLocaleString("mn-MN") + "₮";
}

export default async function PremiumPage() {
  const session = await auth();
  const [plans, activeSubscription] = await Promise.all([
    prisma.premiumPlan.findMany({ where: { isActive: true }, orderBy: { price: "asc" } }),
    session?.user
      ? prisma.subscription.findFirst({
          where: { userId: session.user.id, status: "ACTIVE" },
          include: { plan: true },
          orderBy: { endDate: "desc" },
        })
      : null,
  ]);

  const isPremium = session?.user
    ? await prisma.user
        .findUnique({ where: { id: session.user.id }, select: { isPremium: true, premiumExpiresAt: true } })
        .then((u) => u)
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <span className="text-5xl">👑</span>
        <h1 className="mt-4 font-display text-3xl font-bold text-paper sm:text-4xl">
          Premium эрх
        </h1>
        <p className="mt-3 text-base text-mist">
          Premium бүлгүүдийг уншиж, шинэ бүлгүүдийг хамгийн түрүүнд авна
        </p>
      </div>

      {isPremium?.isPremium && (
        <div className="mb-8 rounded-xl border border-ember/40 bg-ember/10 px-6 py-5 text-center">
          <p className="font-display text-lg font-semibold text-ember">
            👑 Та Premium гишүүн байна
          </p>
          <p className="mt-1 text-sm text-mist">
            Хугацаа:{" "}
            {isPremium.premiumExpiresAt
              ? new Date(isPremium.premiumExpiresAt).toLocaleDateString("mn-MN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Тодорхойгүй"}
          </p>
        </div>
      )}

      {/* Features */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: "🔓", title: "Бүх бүлэг", desc: "Premium гэж тэмдэглэгдсэн бүлгүүдийг саадгүй уншина" },
          { icon: "⚡", title: "Шинэ бүлэг эрт", desc: "Шинэ бүлгийг бусдаас өмнө уншина" },
          { icon: "🚫", title: "Зар байхгүй", desc: "Таатай унших орчин" },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-surface p-5 text-center">
            <span className="text-3xl">{f.icon}</span>
            <p className="mt-2 font-display font-semibold text-paper">{f.title}</p>
            <p className="mt-1 text-xs text-mist-dim">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {plans.map((plan) => {
          const isYearly = plan.duration >= 365;
          const monthlyCost = isYearly
            ? Math.round(plan.price / 12).toLocaleString("mn-MN")
            : null;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 ${
                isYearly
                  ? "border-ember bg-ember/5 shadow-lg shadow-ember/10"
                  : "border-border bg-surface"
              }`}
            >
              {isYearly && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ember px-4 py-1 text-xs font-bold text-ink-deep">
                  🔥 Хамгийн ашигтай
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-paper">{plan.name}</h3>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-display text-3xl font-bold text-ember">
                  {formatPrice(plan.price)}
                </span>
                <span className="mb-1 text-sm text-mist-dim">
                  / {plan.duration} хоног
                </span>
              </div>
              {monthlyCost && (
                <p className="mt-1 text-xs text-success">
                  Сард {monthlyCost}₮ болно — 33% хямд!
                </p>
              )}
              <p className="mt-3 text-sm text-mist">{plan.description}</p>

              {session?.user ? (
                <Link
                  href={`/premium/checkout?planId=${plan.id}`}
                  className={`mt-5 block rounded-lg px-5 py-3 text-center text-sm font-semibold transition ${
                    isYearly
                      ? "bg-ember text-ink-deep hover:bg-ember-soft"
                      : "border border-ember text-ember hover:bg-ember hover:text-ink-deep"
                  }`}
                >
                  {isPremium?.isPremium ? "Сунгах" : "Захиалах"}
                </Link>
              ) : (
                <Link
                  href={`/login?callbackUrl=/premium`}
                  className="mt-5 block rounded-lg border border-border px-5 py-3 text-center text-sm font-semibold text-mist transition hover:border-ember hover:text-ember"
                >
                  Нэвтэрч захиалах
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {activeSubscription && (
        <div className="mt-8 rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-medium text-paper">Захиалгын түүх</p>
          <div className="mt-3 text-sm text-mist">
            <span className="text-ember">{activeSubscription.plan.name}</span>
            {" — "}
            {new Date(activeSubscription.endDate).toLocaleDateString("mn-MN")} хүртэл хүчинтэй
          </div>
        </div>
      )}
    </div>
  );
}
