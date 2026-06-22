import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/format";

const statusLabel: Record<string, string> = {
  PENDING: "Хүлээгдэж буй",
  IN_PROGRESS: "Хянагдаж байна",
  RESOLVED: "Шийдэгдсэн",
  CLOSED: "Хаагдсан",
};
const statusColor: Record<string, string> = {
  PENDING: "text-ember border-ember/40 bg-ember/10",
  IN_PROGRESS: "text-plum-soft border-plum/40 bg-plum/10",
  RESOLVED: "text-success border-success/40 bg-success/10",
  CLOSED: "text-mist border-border bg-surface",
};
const typeLabel: Record<string, string> = {
  BUG: "🐛 Алдаа засах",
  FEATURE: "✨ Нэмэлт өөрчлөлт",
  AUTHOR_REQUEST: "✍️ Зохиолч болох",
  NOVEL_REQUEST: "📖 Тууж нэмэх",
  OTHER: "💬 Бусад",
};
const priorityLabel: Record<string, string> = {
  LOW: "Бага",
  NORMAL: "Энгийн",
  HIGH: "Яаралтай",
  URGENT: "Маш яаралтай",
};
const priorityColor: Record<string, string> = {
  LOW: "text-mist-dim",
  NORMAL: "text-success",
  HIGH: "text-ember",
  URGENT: "text-danger",
};

export default async function TicketsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/tickets");

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      priority: true,
      status: true,
      adminNote: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-paper">Миний хүсэлтүүд</h1>
          <p className="mt-1 text-sm text-mist-dim">Нийт {tickets.length} хүсэлт</p>
        </div>
        <Link
          href="/tickets/new"
          className="rounded-lg bg-ember px-4 py-2.5 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft"
        >
          + Шинэ хүсэлт
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface py-16 text-center">
          <span className="text-4xl">📮</span>
          <p className="mt-3 font-display text-lg text-paper">Хүсэлт байхгүй байна</p>
          <p className="mt-1 text-sm text-mist-dim">
            Асуудал гарсан эсвэл санал хүсэлт байвал доорх товчоор илгээнэ үү
          </p>
          <Link
            href="/tickets/new"
            className="mt-4 inline-block rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft"
          >
            Хүсэлт илгээх
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-xl border border-border bg-surface p-5 transition hover:border-ember-dim"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor[ticket.status]}`}
                    >
                      {statusLabel[ticket.status]}
                    </span>
                    <span className="text-xs text-mist-dim">
                      {typeLabel[ticket.type]}
                    </span>
                    <span className={`text-xs font-medium ${priorityColor[ticket.priority]}`}>
                      {priorityLabel[ticket.priority]}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-base font-semibold text-paper">
                    {ticket.title}
                  </h3>
                  <p className="mt-1 text-xs text-mist-dim">
                    {formatRelativeTime(ticket.createdAt)} илгээсэн
                    {ticket.updatedAt > ticket.createdAt &&
                      ` · ${formatRelativeTime(ticket.updatedAt)} шинэчлэгдсэн`}
                  </p>
                </div>
              </div>

              {ticket.adminNote && (
                <div className="mt-3 rounded-lg border border-plum/30 bg-plum/10 px-4 py-3">
                  <p className="text-xs font-medium text-plum-soft">Admin-ийн хариу:</p>
                  <p className="mt-1 text-sm text-mist">{ticket.adminNote}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
