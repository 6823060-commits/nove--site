import RegisterForm from "@/components/RegisterForm";
import { getEnabledProviders } from "@/lib/oauth-providers";

export default function RegisterPage() {
  const providers = getEnabledProviders();

  return (
    <div className="glow-lamp flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <div className="mb-6 text-center">
          <span className="text-3xl" aria-hidden>
            🕯️
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide text-paper">
            Бүртгүүлэх
          </h1>
          <p className="mt-1 text-sm text-mist-dim">Шинэ уншигчдын дэн өрөөнд тавтай морил</p>
        </div>
        <RegisterForm providers={providers} />
      </div>
    </div>
  );
}
