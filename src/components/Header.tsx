import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import MobileNav from "@/components/MobileNav";

export default async function Header() {
  const session = await auth();
  const user = session?.user;

  const navLinks = [
    { href: "/catalog", label: "Каталог" },
     { href: "/novels", label: "Хайлт" },
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

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-mist transition hover:text-ember"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm text-plum-soft transition hover:text-ember"
                >
                  Удирдлага
                </Link>
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
          userName={user?.name ?? null}
        />
      </div>
    </header>
  );
}
