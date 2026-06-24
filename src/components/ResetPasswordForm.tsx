"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkPasswordStrength } from "@/lib/password";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M6.5 6.7C4 8.3 2 12 2 12s3.5 7 10 7c1.8 0 3.3-.4 4.6-1.1M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-2.2 3.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Нууц үг хоёр дахин таарахгүй байна");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Алдаа гарлаа");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 3000);
  };

  if (!token) {
    return (
      <p className="text-center text-sm text-danger">
        Холбоос хүчингүй байна. Дахин нууц үг сэргээх хүсэлт илгээнэ үү.
      </p>
    );
  }

  if (success) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/10 px-6 py-10 text-center">
        <span className="text-4xl">✅</span>
        <p className="mt-3 font-display text-lg font-semibold text-paper">
          Нууц үг амжилттай шинэчлэгдлээ!
        </p>
        <p className="mt-1 text-sm text-mist">3 секундын дараа нэвтрэх хуудас руу шилжинэ...</p>
      </div>
    );
  }

  const { score, checks } = checkPasswordStrength(password);
  const strengthColors = ["bg-danger", "bg-danger", "bg-ember", "bg-ember-soft", "bg-success"];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm text-mist">Шинэ нууц үг</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Шинэ нууц үг"
            className="w-full rounded-lg border border-border bg-ink-deep px-4 py-2.5 pr-11 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-mist-dim hover:text-mist"
          >
            <EyeIcon open={showPw} />
          </button>
        </div>
        {password.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[1,2,3,4].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${score >= i ? strengthColors[score] : "bg-border"}`} />
              ))}
            </div>
            <ul className="mt-1.5 grid grid-cols-2 gap-0.5">
              {checks.map((c) => (
                <li key={c.label} className={`text-xs flex items-center gap-1 ${c.pass ? "text-success" : "text-mist-dim"}`}>
                  {c.pass ? "✓" : "○"} {c.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-mist">Нууц үг давтах</label>
        <input
          type={showPw ? "text" : "password"}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Нууц үг дахин оруулна"
          className={`w-full rounded-lg border px-4 py-2.5 text-sm text-paper placeholder:text-mist-dim focus:outline-none ${
            confirm.length > 0 && confirm !== password
              ? "border-danger bg-danger/5 focus:border-danger"
              : "border-border bg-ink-deep focus:border-ember"
          }`}
        />
        {confirm.length > 0 && confirm !== password && (
          <p className="mt-1 text-xs text-danger">Нууц үг таарахгүй байна</p>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading || score < 4}
        className="rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft disabled:opacity-60"
      >
        {loading ? "Хадгалж байна..." : "Нууц үг шинэчлэх"}
      </button>
    </form>
  );
}
