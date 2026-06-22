import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import { getEnabledProviders } from "@/lib/oauth-providers";

export default function LoginPage() {
  const providers = getEnabledProviders();

  return (
    <div className="glow-lamp flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <div className="mb-6 text-center">
          <span className="text-3xl" aria-hidden>
            🕯️
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-paper">Нэвтрэх</h1>
          <p className="mt-1 text-sm text-mist-dim">Дэн дахин асаагаад үргэлжлүүлээрэй</p>
        </div>
        <Suspense>
          <LoginForm providers={providers} />
        </Suspense>
        <p className="mt-6 text-center text-sm text-mist">
          Бүртгэлгүй юу?{" "}
          <Link href="/register" className="text-ember hover:underline">
            Бүртгүүлэх
          </Link>
        </p>
      </div>
    </div>
  );
}