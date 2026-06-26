import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatRelativeTime } from "@/lib/format";
import TicketStatusUpdate from "@/components/admin/TicketStatusUpdate";
import DeleteButton from "@/components/admin/DeleteButton";

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
  AUTHOR_REQUEST: "✍️ Зохиолч болох хүсэлт",
  NOVEL_REQUEST: "📖 Новел нэмэх хүсэлт",
  OTHER: "💬 Бусад",
};
const priorityLabel: Record<string, string> = {
  LOW: "Бага",
  NORMAL: "Энгийн",
  HIGH: "Яаралтай",
  URGENT: "⚡ Маш яаралтай",
};
const priorityColor: Record<string, string> = {
  LOW: "text-mist-dim",
  NORMAL: "text-success",
  HIGH: "text-ember",
  URGENT: "text-danger",
};

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true, createdAt: true } } },
  });

  if (!ticket) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/tickets"
          className="text-sm text-mist hover:text-ember"
        >
          ← Хүсэлтүүд
        </Link>
        <span className="text-mist-dim">/</span>
        <span className="text-sm text-mist-dim truncate max-w-50">
          {ticket.title}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor[ticket.status]}`}
              >
                {statusLabel[ticket.status]}
              </span>
              <span className="text-sm text-mist">{typeLabel[ticket.type]}</span>
              <span className={`text-sm font-medium ${priorityColor[ticket.priority]}`}>
                {priorityLabel[ticket.priority]}
              </span>
            </div>

            <h1 className="font-display text-xl font-bold text-paper">
              {ticket.title}
            </h1>

            <p className="mt-1 text-xs text-mist-dim">
              {formatDate(ticket.createdAt)} ({formatRelativeTime(ticket.createdAt)})
            </p>

            <div className="mt-5 border-t border-border pt-5">
              <p className="mb-2 text-xs uppercase tracking-wider text-mist-dim">
                Хүсэлтийн агуулга
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-mist">
                {ticket.content}
              </p>
            </div>
          </div>

          {ticket.adminNote && (
            <div className="rounded-xl border border-plum/30 bg-plum/10 p-5">
              <p className="mb-2 text-xs uppercase tracking-wider text-plum-soft">
                Admin-ийн хариу
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-mist">
                {ticket.adminNote}
              </p>
            </div>
          )}

          <TicketStatusUpdate
            ticketId={ticket.id}
            currentStatus={ticket.status}
            currentNote={ticket.adminNote}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-3 text-xs uppercase tracking-wider text-mist-dim">
              Хэрэглэгчийн мэдээлэл
            </p>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-plum/30 font-display text-sm font-semibold text-plum-soft">
                {ticket.user.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-medium text-paper">{ticket.user.name}</p>
                <p className="text-xs text-mist-dim">{ticket.user.email}</p>
              </div>
            </div>
            <p className="text-xs text-mist-dim">
              Бүртгүүлсэн: {formatDate(ticket.user.createdAt)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-3 text-xs uppercase tracking-wider text-mist-dim">
              Дэлгэрэнгүй
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-mist-dim">Дугаар</span>
                <span className="font-mono text-xs text-mist">{ticket.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mist-dim">Төрөл</span>
                <span className="text-mist">{typeLabel[ticket.type]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mist-dim">Яаралтай</span>
                <span className={priorityColor[ticket.priority]}>
                  {priorityLabel[ticket.priority]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mist-dim">Үүсгэсэн</span>
                <span className="text-mist">{formatRelativeTime(ticket.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mist-dim">Шинэчлэгдсэн</span>
                <span className="text-mist">{formatRelativeTime(ticket.updatedAt)}</span>
              </div>
            </div>
          </div>

          <DeleteButton
            url={`/api/tickets/${ticket.id}`}
            confirmText="Энэ хүсэлтийг устгах уу?"
          />
        </div>
      </div>
    </div>
  );
}
