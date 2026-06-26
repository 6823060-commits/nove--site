import Link from "next/link";
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
  BUG: "🐛 Алдаа",
  FEATURE: "✨ Өөрчлөлт",
  AUTHOR_REQUEST: "✍️ Зохиолч",
  NOVEL_REQUEST: "📖 Новел",
  OTHER: "💬 Бусад",
};
const priorityColor: Record<string, string> = {
  LOW: "text-mist-dim",
  NORMAL: "text-success",
  HIGH: "text-ember",
  URGENT: "text-danger font-bold",
};
const priorityLabel: Record<string, string> = {
  LOW: "Бага",
  NORMAL: "Энгийн",
  HIGH: "Яаралтай",
  URGENT: "⚡ Маш яаралтай",
};

export default async function AdminTicketsPage() {
  const [tickets, counts] = await Promise.all([
    prisma.ticket.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        type: true,
        priority: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.ticket.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countMap = counts.reduce(
    (acc, c) => ({ ...acc, [c.status]: c._count._all }),
    {} as Record<string, number>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-paper">Хүсэлтүүд</h1>
        <span className="text-sm text-mist-dim">Нийт {tickets.length}</span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(statusLabel).map(([key, label]) => (
          <div key={key} className="rounded-xl border border-border bg-surface p-4">
            <p className={`text-2xl font-bold font-display ${statusColor[key].split(" ")[0]}`}>
              {countMap[key] ?? 0}
            </p>
            <p className="mt-1 text-xs text-mist-dim">{label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-mist-dim">
              <th className="px-4 py-3">Гарчиг</th>
              <th className="px-4 py-3">Хэрэглэгч</th>
              <th className="px-4 py-3">Төрөл</th>
              <th className="px-4 py-3">Яаралтай</th>
              <th className="px-4 py-3">Төлөв</th>
              <th className="px-4 py-3">Огноо</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-surface-raised">
                <td className="max-w-[200px] truncate px-4 py-3 font-medium text-paper">
                  {ticket.title}
                </td>
                <td className="px-4 py-3">
                  <p className="text-paper">{ticket.user.name}</p>
                  <p className="text-xs text-mist-dim">{ticket.user.email}</p>
                </td>
                <td className="px-4 py-3 text-xs text-mist">
                  {typeLabel[ticket.type]}
                </td>
                <td className={`px-4 py-3 text-xs ${priorityColor[ticket.priority]}`}>
                  {priorityLabel[ticket.priority]}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor[ticket.status]}`}
                  >
                    {statusLabel[ticket.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-mist-dim">
                  {formatRelativeTime(ticket.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/tickets/${ticket.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-mist hover:border-ember hover:text-ember"
                  >
                    Харах
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-mist-dim">
            Хүсэлт байхгүй байна.
          </p>
        )}
      </div>
    </div>
  );
}
