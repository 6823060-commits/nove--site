"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GoogleIcon, AppleIcon, FacebookIcon } from "@/components/SocialIcons";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M6.5 6.7C4 8.3 2 12 2 12s3.5 7 10 7c1.8 0 3.3-.4 4.6-1.1M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-2.2 3.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

type EnabledProviders = { google: boolean; facebook: boolean; apple: boolean };

export default function RegisterForm({ providers }: { providers: EnabledProviders }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSocialClick = (provider: "google" | "facebook" | "apple") => {
    setSocialLoading(provider);
    signIn(provider, { callbackUrl: "/" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Нууц үг хоёр дахин таарахгүй байна");
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("Үргэлжлүүлэхийн тулд нөхцөлүүдийг зөвшөөрнө үү");
      return;
    }

    setLoading(true);
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Алдаа гарлаа");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-mist">
            И-мэйл
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="И-мэйл"
            className="w-full rounded-lg border border-border bg-ink-deep px-4 py-2.5 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-sm text-mist">
              Нэр
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Нэр"
              className="w-full rounded-lg border border-border bg-ink-deep px-4 py-2.5 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-sm text-mist">
              Овог
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Овог"
              className="w-full rounded-lg border border-border bg-ink-deep px-4 py-2.5 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-mist">
            Нууц үг
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Нууц үг"
              className="w-full rounded-lg border border-border bg-ink-deep px-4 py-2.5 pr-11 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-mist-dim hover:text-mist"
              aria-label={showPassword ? "Нууц үг нуух" : "Нууц үг харах"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm text-mist">
            Нууц үг баталгаажуулах
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Нууц үг баталгаажуулах"
              className="w-full rounded-lg border border-border bg-ink-deep px-4 py-2.5 pr-11 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-mist-dim hover:text-mist"
              aria-label={showConfirmPassword ? "Нууц үг нуух" : "Нууц үг харах"}
            >
              <EyeIcon open={showConfirmPassword} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <label className="flex cursor-pointer items-start gap-2 text-xs text-mist">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-border bg-ink-deep accent-ember"
            />
            Би Үйлчилгээний нөхцөлийг зөвшөөрч байна
          </label>
          <label className="flex cursor-pointer items-start gap-2 text-xs text-mist">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-border bg-ink-deep accent-ember"
            />
            Би Нууцлалын бодлогыг зөвшөөрч байна
          </label>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft disabled:opacity-60"
        >
          {loading ? "Бүртгэж байна..." : "Бүртгэл"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-mist-dim">
        <span className="h-px flex-1 bg-border" />
        эсвэл
        <span className="h-px flex-1 bg-border" />
      </div>

      <Link
        href="/login"
        className="rounded-lg border border-border px-5 py-2.5 text-center text-sm font-medium text-paper transition hover:border-ember hover:text-ember"
      >
        Бүртгэлтэй хэрэглэгч бол нэвтрэх
      </Link>

      {(providers.google || providers.facebook || providers.apple) && (
        <>
          <div className="flex items-center gap-3 text-xs text-mist-dim">
            <span className="h-px flex-1 bg-border" />
            эсвэл
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-2.5">
            {providers.google && (
              <button
                type="button"
                onClick={() => handleSocialClick("google")}
                disabled={socialLoading !== null}
                className="flex items-center justify-center gap-2.5 rounded-lg border border-border bg-paper px-5 py-2.5 text-sm font-medium text-ink-deep transition hover:bg-paper/90 disabled:opacity-60"
              >
                <GoogleIcon />
                {socialLoading === "google" ? "Шилжиж байна..." : "Google-р нэвтрэх"}
              </button>
            )}
            {providers.apple && (
              <button
                type="button"
                onClick={() => handleSocialClick("apple")}
                disabled={socialLoading !== null}
                className="flex items-center justify-center gap-2.5 rounded-lg border border-border bg-ink-deep px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-surface-raised disabled:opacity-60"
              >
                <AppleIcon />
                {socialLoading === "apple" ? "Шилжиж байна..." : "Apple-р нэвтрэх"}
              </button>
            )}
            {providers.facebook && (
              <button
                type="button"
                onClick={() => handleSocialClick("facebook")}
                disabled={socialLoading !== null}
                className="flex items-center justify-center gap-2.5 rounded-lg bg-[#1877F2] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1666d8] disabled:opacity-60"
              >
                <FacebookIcon />
                {socialLoading === "facebook" ? "Шилжиж байна..." : "Facebook-р үргэлжлүүлэх"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
