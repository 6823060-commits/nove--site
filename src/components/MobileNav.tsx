"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

type NavLink = { href: string; label: string };

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
    <div className="md:hidden">
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
          <nav className="flex flex-col gap-3">
            {/* Mobile search */}
            <form action="/catalog" method="get" className="flex items-center gap-0 mb-1">
              <input
                name="q"
                type="text"
                placeholder="Хайх..."
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
            <div className="h-px bg-border" />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-mist transition hover:text-ember"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-border" />
            {isLoggedIn ? (
              <>
                {isEditor && (
                  <Link
                    href="/editor"
                    onClick={() => setOpen(false)}
                    className="text-sm text-plum-soft transition hover:text-ember"
                  >
                    Редактор
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="text-sm text-plum-soft transition hover:text-ember"
                  >
                    Удирдлага
                  </Link>
                )}
                {hasPremium && (
                  <span className="text-xs font-medium text-ember">👑 Premium гишүүн</span>
                )}
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="text-sm text-mist transition hover:text-ember"
                >
                  {userName}
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ redirectTo: "/" })}
                  className="self-start rounded-full border border-border px-4 py-1.5 text-sm text-mist transition hover:border-ember hover:text-ember"
                >
                  Гарах
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm text-mist transition hover:text-ember"
                >
                  Нэвтрэх
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="self-start rounded-full bg-ember px-4 py-1.5 text-sm font-medium text-ink-deep transition hover:bg-ember-soft"
                >
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
