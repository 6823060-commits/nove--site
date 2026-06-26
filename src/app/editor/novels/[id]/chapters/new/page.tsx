import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChapterForm from "@/components/admin/ChapterForm";

export default async function EditorNewChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const novel = await prisma.novel.findUnique({
    where: { id },
    select: { id: true, slug: true, title: true, createdById: true, chapters: { select: { chapterNumber: true } } },
  });

  if (!novel) notFound();
  if ((session.user.role as string) === "EDITOR" && novel.createdById !== session.user.id) redirect("/editor");

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
