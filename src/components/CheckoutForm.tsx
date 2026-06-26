"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Plan = { id: string; name: string; price: number; duration: number; description: string | null };

const PAYMENT_METHODS = [
  { value: "qpay",      label: "QPay",       icon: "📱", desc: "QPay QR кодоор төлөх" },
  { value: "socialpay", label: "SocialPay",  icon: "💙", desc: "SocialPay-аар төлөх" },
  { value: "card",      label: "Банкны карт", icon: "💳", desc: "Visa, MasterCard" },
];

export default function CheckoutForm({ plan }: { plan: Plan }) {
  const router = useRouter();
  const [method, setMethod] = useState("qpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"select" | "pay" | "success">("select");
  const [subscriptionId, setSubscriptionId] = useState("");

  const handleCreateSubscription = async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/premium/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan.id }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Алдаа гарлаа"); return; }

    setSubscriptionId(data.subscription.id);
    setStep("pay");
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/premium/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, method }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Алдаа гарлаа"); return; }

    setStep("success");
    setTimeout(() => router.push("/premium"), 3000);
  };

  if (step === "success") {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/10 py-16 text-center">
        <span className="text-5xl">👑</span>
        <p className="mt-4 font-display text-2xl font-bold text-paper">Баяр хүргэе!</p>
        <p className="mt-2 text-mist">Premium эрх амжилттай идэвхжлээ</p>
        <p className="mt-1 text-sm text-mist-dim">3 секундын дараа шилжинэ...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Plan summary */}
      <div className="rounded-xl border border-ember/30 bg-ember/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold text-paper">👑 {plan.name}</p>
            <p className="mt-0.5 text-sm text-mist-dim">{plan.duration} хоногийн хугацаатай</p>
          </div>
          <p className="font-display text-2xl font-bold text-ember">
            {plan.price.toLocaleString("mn-MN")}₮
          </p>
        </div>
      </div>

      {step === "select" && (
        <>
          <div>
            <p className="mb-3 text-sm font-medium text-mist">Төлбөрийн арга сонгох</p>
            <div className="flex flex-col gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setMethod(pm.value)}
                  className={`flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition ${
                    method === pm.value
                      ? "border-ember bg-ember/10"
                      : "border-border bg-surface hover:border-ember/50"
                  }`}
                >
                  <span className="text-2xl">{pm.icon}</span>
                  <div>
                    <p className={`text-sm font-medium ${method === pm.value ? "text-ember" : "text-paper"}`}>
                      {pm.label}
                    </p>
                    <p className="text-xs text-mist-dim">{pm.desc}</p>
                  </div>
                  <span className={`ml-auto h-4 w-4 rounded-full border-2 ${
                    method === pm.value ? "border-ember bg-ember" : "border-mist-dim"
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="button"
            onClick={handleCreateSubscription}
            disabled={loading}
            className="rounded-xl bg-ember py-3.5 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft disabled:opacity-60"
          >
            {loading ? "Боловсруулж байна..." : `${plan.price.toLocaleString("mn-MN")}₮ төлөх`}
          </button>
        </>
      )}

      {step === "pay" && (
        <>
          {method === "qpay" && (
            <div className="rounded-xl border border-border bg-surface p-6 text-center">
              <p className="mb-3 text-sm font-medium text-paper">QPay QR код</p>
              <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-xl bg-white p-3">
                <div className="grid grid-cols-3 gap-1 opacity-30">
                  {Array.from({length: 9}).map((_, i) => (
                    <div key={i} className={`h-12 w-12 rounded bg-black ${i===4?"opacity-20":""}`} />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-mist-dim">
                QPay апп-аар QR кодыг уншуулна уу
              </p>
              <div className="mt-2 rounded-lg border border-ember/20 bg-ember/5 px-4 py-2 text-xs text-ember">
                ⚠️ Жинхэнэ QPay холболт хийхдээ QPay API key тохируулна
              </div>
            </div>
          )}

          {method === "card" && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="mb-4 text-sm font-medium text-paper">Картын мэдээлэл</p>
              <div className="flex flex-col gap-3">
                <input
                  placeholder="Картын дугаар"
                  className="rounded-lg border border-border bg-ink-deep px-4 py-2.5 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="MM/YY"
                    className="rounded-lg border border-border bg-ink-deep px-4 py-2.5 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
                  />
                  <input
                    placeholder="CVV"
                    className="rounded-lg border border-border bg-ink-deep px-4 py-2.5 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {method === "socialpay" && (
            <div className="rounded-xl border border-border bg-surface p-5 text-center">
              <span className="text-4xl">💙</span>
              <p className="mt-2 text-sm text-mist">
                SocialPay апп-ыг нээж төлбөрийг баталгаажуулна уу
              </p>
            </div>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={loading}
            className="rounded-xl bg-ember py-3.5 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft disabled:opacity-60"
          >
            {loading ? "Баталгаажуулж байна..." : "Төлбөр баталгаажуулах"}
          </button>
          <button
            type="button"
            onClick={() => setStep("select")}
            className="text-center text-sm text-mist hover:text-ember"
          >
            ← Буцах
          </button>
        </>
      )}
    </div>
  );
}
