import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-ink-deep">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-base text-paper"></p>
          <p className="mt-1 text-sm text-mist-dim">
           
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-mist">
          <Link href="/novels" className="hover:text-ember">
            Бүх новелууд
          </Link>
          <Link href="/login" className="hover:text-ember">
            Нэвтрэх
          </Link>
          <Link href="/register" className="hover:text-ember">
            Бүртгүүлэх
          </Link>
        </nav>
        <p className="text-xs text-mist-dim">
          © {new Date().getFullYear()} Новел. Бүх эрх хуулиар хамгаалагдсан.
        </p>
      </div>
    </footer>
  );
}
