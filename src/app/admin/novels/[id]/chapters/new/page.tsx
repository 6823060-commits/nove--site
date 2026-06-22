import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChapterForm from "@/components/admin/ChapterForm";

export default async function NewChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const novel = await prisma.novel.findUnique({
    where: { id },
    select: { id: true, slug: true, title: true, chapters: { select: { chapterNumber: true } } },
  });

  if (!novel) notFound();

  const suggestedChapterNumber =
    novel.chapters.length > 0 ? Math.max(...novel.chapters.map((c) => c.chapterNumber)) + 1 : 1;

  return (
    <div>
      <p className="mb-1 text-sm text-mist-dim">{novel.title}</p>
      <h1 className="mb-6 font-display text-2xl font-bold text-paper">Шинэ бүлэг нэмэх</h1>
      <ChapterForm novelId={novel.id} novelSlug={novel.slug} suggestedChapterNumber={suggestedChapterNumber} />
    </div>
  );
}
