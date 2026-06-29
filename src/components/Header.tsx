import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MobileNav from "@/components/MobileNav";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Header() {
  const session = await auth();
  const user = session?.user;

  const userPremium = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: { isPremium: true, premiumExpiresAt: true },
      })
    : null;

  const hasPremium =
    userPremium?.isPremium &&
    (!userPremium.premiumExpiresAt || userPremium.premiumExpiresAt > new Date());

  const navLinks = [
    { href: "/",         label: "Нүүр",     icon: "🏠" },
    { href: "/catalog",  label: "Каталог",  icon: "📚" },
    { href: "/profile",  label: "Хадгалсан", icon: "🔖" },
    { href: "/premium",  label: "👑 Premium", icon: "" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ink-deep/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl" aria-hidden>🕯️</span>
          <span className="font-display text-lg font-bold tracking-wide text-paper sm:text-xl hidden sm:block">
            Новел
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex ml-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-mist transition hover:bg-surface hover:text-paper"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z"
                stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            Нүүр
          </Link>
          <Link
            href="/catalog"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-mist transition hover:bg-surface hover:text-paper"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M9 8h6M9 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Каталог
          </Link>
          <Link
            href="/profile?tab=novels"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-mist transition hover:bg-surface hover:text-paper"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z"
                stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            Хадгалсан
          </Link>
          <Link
            href="/premium"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ember transition hover:bg-ember/10"
          >
            👑 Premium
          </Link>
        </nav>

        {/* Search */}
        <form action="/catalog" method="get" className="hidden md:flex flex-1 max-w-xs ml-auto">
          <div className="relative w-full">
            <input
              name="q"
              type="text"
              placeholder="Новел хайх..."
              className="h-8 w-full rounded-full border border-border bg-surface pl-8 pr-3 text-xs text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none transition-all"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mist-dim"
              width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </form>

        {/* Right side */}
        <div className="hidden items-center gap-2 md:flex ml-2">
          {/* Theme toggle */}
          <ThemeToggle />

          {user ? (
            <>
              {((user.role as string) === "EDITOR") && (
                <Link href="/editor" className="text-sm text-plum-soft transition hover:text-ember">
                  Редактор
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link href="/admin" className="text-sm text-plum-soft transition hover:text-ember">
                  Удирдлага
                </Link>
              )}
              {hasPremium && (
                <span className="rounded-full bg-ember/10 px-2 py-0.5 text-xs font-medium text-ember">
                  👑
                </span>
              )}
              <Link href="/tickets" className="text-sm text-mist transition hover:text-ember">
                Хүсэлт
              </Link>
              <Link
                href="/profile"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-plum/30 text-sm font-semibold text-plum-soft transition hover:bg-plum/50"
              >
                {user.name?.charAt(0).toUpperCase()}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-mist transition hover:border-ember hover:text-ember"
                >
                  Гарах
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-mist transition hover:text-ember">
                Нэвтрэх
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-ember px-4 py-1.5 text-sm font-medium text-ink-deep transition hover:bg-ember-soft"
              >
                Бүртгүүлэх
              </Link>
            </>
          )}
        </div>

        <MobileNav
          navLinks={navLinks}
          isLoggedIn={!!user}
          isAdmin={user?.role === "ADMIN"}
          isEditor={(user?.role as string) === "EDITOR"}
          hasPremium={!!hasPremium}
          userName={user?.name ?? null}
        />
      </div>
    </header>
  );
}
