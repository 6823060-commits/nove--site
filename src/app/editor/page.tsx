import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditorDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [novelCount, chapterCount] = await Promise.all([
    prisma.novel.count({ where: { createdById: session.user.id } }),
    prisma.chapter.count({
      where: { novel: { createdById: session.user.id } },
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-paper">Редакторын самбар</h1>
        <Link
          href="/editor/novels/new"
          className="rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft"
        >
          + Шинэ новел
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="font-display text-2xl font-bold text-ember">{novelCount}</p>
          <p className="mt-1 text-xs text-mist-dim">Нийт новел</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="font-display text-2xl font-bold text-ember">{chapterCount}</p>
          <p className="mt-1 text-xs text-mist-dim">Нийт бүлэг</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <p className="text-sm font-medium text-paper mb-3">Редакторын эрх</p>
        <ul className="space-y-2 text-sm text-mist">
          <li>✅ Өөрийн новел, бүлэг нэмэх, засах, устгах</li>
          <li>✅ Бүлгийг Premium гэж тэмдэглэх</li>
          <li>✅ Жанр нэмэх</li>
          <li>❌ Бусдын новел засах боломжгүй</li>
          <li>❌ Хэрэглэгчийн эрх удирдах боломжгүй</li>
        </ul>
      </div>
    </div>
  );
}
