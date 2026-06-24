"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Алдаа гарлаа");
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/10 px-6 py-10 text-center">
        <span className="text-4xl">📧</span>
        <p className="mt-3 font-display text-lg font-semibold text-paper">
          Имэйл илгээгдлээ!
        </p>
        <p className="mt-2 text-sm text-mist">
          <strong className="text-paper">{email}</strong> хаяг руу нууц үг сэргээх
          холбоос илгээгдлээ. 30 минутын дотор ашиглана уу.
        </p>
        <p className="mt-3 text-xs text-mist-dim">
          Имэйл ирэхгүй байвал spam/junk хавтсаа шалгаарай.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm text-ember hover:underline"
        >
          ← Нэвтрэх хуудас руу буцах
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-mist">
          Имэйл хаяг
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="та@жишээ.мн"
          className="w-full rounded-lg border border-border bg-ink-deep px-4 py-2.5 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
        />
        <p className="mt-1.5 text-xs text-mist-dim">
          Бүртгүүлсэн имэйл хаягаа оруулна уу — нууц үг сэргээх холбоос илгээнэ.
        </p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft disabled:opacity-60"
      >
        {loading ? "Илгээж байна..." : "Холбоос илгээх"}
      </button>

      <Link
        href="/login"
        className="text-center text-sm text-mist hover:text-ember"
      >
        ← Нэвтрэх хуудас руу буцах
      </Link>
    </form>
  );
}
