import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [novelCount, chapterCount, userCount, commentCount, pendingTickets] =
    await Promise.all([
      prisma.novel.count(),
      prisma.chapter.count(),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.ticket.count({ where: { status: "PENDING" } }),
    ]);

  const stats = [
    { label: "Нийт новел", value: novelCount },
    { label: "Нийт бүлэг", value: chapterCount },
    { label: "Бүртгэлтэй хэрэглэгч", value: userCount },
    { label: "Нийт сэтгэгдэл", value: commentCount },
    { label: "Хүлээгдэж буй хүсэлт", value: pendingTickets, highlight: pendingTickets > 0 },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-paper">Дашбоард</h1>
        <Link
          href="/admin/novels/new"
          className="rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft"
        >
          + Шинэ новел
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border p-5 ${"highlight" in stat && stat.highlight
              ? "border-danger/40 bg-danger/10"
              : "border-border bg-surface"
            }`}
          >
            <p
              className={`font-display text-2xl font-bold ${"highlight" in stat && stat.highlight
                ? "text-danger"
                : "text-ember"
              }`}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-mist-dim">{stat.label}</p>
          </div>
        ))}
      </div>

      {pendingTickets > 0 && (
        <Link
          href="/admin/tickets"
          className="mt-4 flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-5 py-4 transition hover:border-danger/60"
        >
          <span className="text-2xl">📮</span>
          <div>
            <p className="text-sm font-semibold text-danger">
              {pendingTickets} хүлээгдэж буй хүсэлт байна
            </p>
            <p className="text-xs text-mist-dim">Хянаж, хариу өгнө үү →</p>
          </div>
        </Link>
      )}
    </div>
  );
}
