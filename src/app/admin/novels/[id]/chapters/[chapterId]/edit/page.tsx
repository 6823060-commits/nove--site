import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChapterForm from "@/components/admin/ChapterForm";

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id, chapterId } = await params;

  const [novel, chapter] = await Promise.all([
    prisma.novel.findUnique({ where: { id }, select: { id: true, slug: true, title: true } }),
    prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, chapterNumber: true, title: true, content: true },
    }),
  ]);

  if (!novel || !chapter) notFound();

  return (
    <div>
      <p className="mb-1 text-sm text-mist-dim">{novel.title}</p>
      <h1 className="mb-6 font-display text-2xl font-bold text-paper">
        Бүлэг {chapter.chapterNumber} засах
      </h1>
      <ChapterForm novelId={novel.id} novelSlug={novel.slug} initial={chapter} />
    </div>
  );
}
