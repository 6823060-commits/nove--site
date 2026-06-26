import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MobileNav from "@/components/MobileNav";

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
    { href: "/catalog", label: "Каталог" },
    { href: "/premium", label: "👑 Premium" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ink-deep/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl" aria-hidden>
            🕯️
          </span>
          <span className="font-display text-lg font-bold tracking-wide text-paper sm:text-xl">
           Новел
          </span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition ${
                link.href === "/premium"
                  ? "text-ember hover:text-ember-soft"
                  : "text-mist hover:text-ember"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Search bar */}
          <form action="/catalog" method="get" className="flex items-center">
            <div className="relative">
              <input
                name="q"
                type="text"
                placeholder="Хайх..."
                className="h-8 w-44 rounded-full border border-border bg-surface pl-8 pr-3 text-xs text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none focus:w-56 transition-all"
              />
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mist-dim"
                width="13" height="13" viewBox="0 0 24 24" fill="none"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </form>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {((user.role as string) === "EDITOR") && (
                <Link
                  href="/editor"
                  className="text-sm text-plum-soft transition hover:text-ember"
                >
                  Редактор
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm text-plum-soft transition hover:text-ember"
                >
                  Удирдлага
                </Link>
              )}
              {hasPremium && (
                <span className="rounded-full bg-ember/10 px-2.5 py-0.5 text-xs font-medium text-ember">
                  👑 Premium
                </span>
              )}
              <Link
                href="/tickets"
                className="text-sm text-mist transition hover:text-ember"
              >
                Хүсэлт
              </Link>
              <Link
                href="/profile"
                className="text-sm text-mist transition hover:text-ember"
              >
                {user.name}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-full border border-border px-4 py-1.5 text-sm text-mist transition hover:border-ember hover:text-ember"
                >
                  Гарах
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-mist transition hover:text-ember"
              >
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
