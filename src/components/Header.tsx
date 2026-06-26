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
    { href: "/novels", label: "Бүх новелууд" },
    { href: "/novels?status=ONGOING", label: "Үргэлжилж буй" },
    { href: "/novels?status=COMPLETED", label: "Дууссан" },
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
            Шөнийн Туужr
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
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
