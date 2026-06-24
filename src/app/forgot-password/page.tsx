import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="glow-lamp flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <div className="mb-6 text-center">
          <span className="text-3xl">🔑</span>
          <h1 className="mt-3 font-display text-2xl font-bold text-paper">
            Нууц үг мартсан
          </h1>
          <p className="mt-1 text-sm text-mist-dim">
            Имэйл хаягаа оруулвал нууц үг сэргээх холбоос илгээнэ
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
