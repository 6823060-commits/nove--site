import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <p className="mb-3 font-display text-lg font-semibold text-paper">Удирдлага</p>
          <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            <Link
              href="/admin"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-mist transition hover:bg-surface hover:text-ember"
            >
              Дашбоард
            </Link>
            <Link
              href="/admin/tickets"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-mist transition hover:bg-surface hover:text-ember"
            >
              Хүсэлтүүд
            </Link>
            <Link
              href="/admin/novels"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-mist transition hover:bg-surface hover:text-ember"
            >
              Новелууд
            </Link>
            <Link
              href="/"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-mist-dim transition hover:bg-surface hover:text-ember"
            >
              ← Сайт руу буцах
            </Link>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
