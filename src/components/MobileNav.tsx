"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

type NavLink = { href: string; label: string; icon: string };

export default function MobileNav({
  navLinks,
  isLoggedIn,
  isAdmin,
  isEditor,
  hasPremium,
  userName,
}: {
  navLinks: NavLink[];
  isLoggedIn: boolean;
  isAdmin: boolean;
  isEditor?: boolean;
  hasPremium?: boolean;
  userName: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 md:hidden ml-auto">
      <ThemeToggle />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Цэс нээх"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-paper"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-border bg-ink-deep px-4 py-4 shadow-xl">
          <nav className="flex flex-col gap-1">
            {/* Mobile search */}
            <form action="/catalog" method="get" className="flex gap-0 mb-3">
              <input
                name="q"
                type="text"
                placeholder="Новел хайх..."
                className="flex-1 h-9 rounded-l-lg border border-border bg-surface px-3 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
              />
              <button
                type="submit"
                className="flex h-9 items-center rounded-r-lg bg-ember px-3 text-sm text-ink-deep hover:bg-ember-soft"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </form>

            {/* Nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-mist transition hover:bg-surface hover:text-paper"
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-border" />

            {isLoggedIn ? (
              <>
                {isEditor && (
                  <Link href="/editor" onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-plum-soft hover:bg-surface">
                    ✏️ Редактор
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin" onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-plum-soft hover:bg-surface">
                    ⚙️ Удирдлага
                  </Link>
                )}
                {hasPremium && (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ember">
                    👑 Premium гишүүн
                  </div>
                )}
                <Link href="/tickets" onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-mist hover:bg-surface">
                  📮 Хүсэлт
                </Link>
                <Link href="/profile" onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-mist hover:bg-surface">
                  👤 {userName}
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ redirectTo: "/" })}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-mist hover:bg-surface"
                >
                  🚪 Гарах
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-mist hover:bg-surface">
                  🔑 Нэвтрэх
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}
                  className="mt-1 flex items-center justify-center rounded-full bg-ember px-4 py-2.5 text-sm font-medium text-ink-deep transition hover:bg-ember-soft">
                  Бүртгүүлэх
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
