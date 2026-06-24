"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleIcon, AppleIcon, FacebookIcon } from "@/components/SocialIcons";

type EnabledProviders = { google: boolean; facebook: boolean; apple: boolean };

export default function LoginForm({ providers }: { providers: EnabledProviders }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSocialClick = (provider: "google" | "facebook" | "apple") => {
    setSocialLoading(provider);
    signIn(provider, { callbackUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      if (res.error.includes("LOCKED:")) {
        const mins = res.error.split(":")[1];
        setError(`Таны бүртгэл ${mins} минутын турш блоклогдлоо. Дараа дахин оролдоно уу.`);
      } else if (res.error.includes("ATTEMPTS:")) {
        const attempts = Number(res.error.split(":")[1]);
        setError(`Нууц үг буруу байна. ${5 - attempts} оролдлого үлдсэн байна.`);
      } else {
        setError("Имэйл эсвэл нууц үг буруу байна");
      }
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-mist">
          Имэйл
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-paper focus:border-ember focus:outline-none"
          placeholder="та@жишээ.мн"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-mist">
          Нууц үг
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-paper focus:border-ember focus:outline-none"
          placeholder="••••••••"
        />
      </div>
      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
          <p className="text-sm text-danger">{error}</p>
          {error.includes("блоклогдлоо") || error.includes("буруу байна") ? (
            <a
              href="/forgot-password"
              className="mt-1 block text-xs text-ember hover:underline"
            >
              Нууц үгээ мартсан уу?
            </a>
          ) : null}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft disabled:opacity-60"
      >
        {loading ? "Нэвтэрж байна..." : "Нэвтрэх"}
      </button>

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
    </form>
  );
}
