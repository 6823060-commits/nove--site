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
