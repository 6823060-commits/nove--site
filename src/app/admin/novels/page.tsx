import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminNovelsPage() {
  const novels = await prisma.novel.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      views: true,
      _count: { select: { chapters: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-paper">Новелууд</h1>
        <Link
          href="/admin/novels/new"
          className="rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft"
        >
          + Шинэ новел
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-mist-dim">
              <th className="px-4 py-3">Гарчиг</th>
              <th className="px-4 py-3">Төлөв</th>
              <th className="px-4 py-3">Бүлэг</th>
              <th className="px-4 py-3">Уншсан</th>
              <th className="px-4 py-3 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {novels.map((novel) => (
              <tr key={novel.id}>
                <td className="px-4 py-3 text-paper">{novel.title}</td>
                <td className="px-4 py-3 text-mist">{novel.status}</td>
                <td className="px-4 py-3 text-mist">{novel._count.chapters}</td>
                <td className="px-4 py-3 text-mist">{novel.views}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/novels/${novel.id}`}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs text-mist hover:border-ember hover:text-ember"
                    >
                      Засах
                    </Link>
                    <DeleteButton
                      url={`/api/novels/${novel.id}`}
                      confirmText={`"${novel.title}"-ийг устгах уу? Бүх бүлэг, сэтгэгдэл устах болно.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {novels.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-mist-dim">
            Новел бүртгэгдээгүй байна.
          </p>
        )}
      </div>
    </div>
  );
}
