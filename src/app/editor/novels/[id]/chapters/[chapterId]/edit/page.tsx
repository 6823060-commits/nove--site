import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChapterForm from "@/components/admin/ChapterForm";

export default async function EditorEditChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id, chapterId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [novel, chapter] = await Promise.all([
    prisma.novel.findUnique({ where: { id }, select: { id: true, slug: true, title: true, createdById: true } }),
    prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, chapterNumber: true, title: true, content: true, isPremium: true },
    }),
  ]);

  if (!novel || !chapter) notFound();
  if ((session.user.role as string) === "EDITOR" && novel.createdById !== session.user.id) redirect("/editor");

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
