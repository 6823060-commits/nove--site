import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NovelForm from "@/components/admin/NovelForm";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function EditNovelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [novel, genres] = await Promise.all([
    prisma.novel.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        author: true,
        description: true,
        coverImage: true,
        status: true,
        genres: { select: { genreId: true } },
        chapters: {
          orderBy: { chapterNumber: "asc" },
          select: { id: true, chapterNumber: true, title: true },
        },
      },
    }),
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!novel) notFound();

  const nextChapterNumber =
    novel.chapters.length > 0
      ? Math.max(...novel.chapters.map((c) => c.chapterNumber)) + 1
      : 1;

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-paper">{novel.title}</h1>

      <NovelForm
        genres={genres}
        initial={{
          id: novel.id,
          title: novel.title,
          slug: novel.slug,
          author: novel.author,
          description: novel.description,
          coverImage: novel.coverImage,
          status: novel.status,
          genreIds: novel.genres.map((g) => g.genreId),
        }}
      />

      <div className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-paper">Бүлгүүд</h2>
          <Link
            href={`/admin/novels/${novel.id}/chapters/new`}
            className="rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft"
          >
            + Шинэ бүлэг
          </Link>
        </div>

        <div className="divide-y divide-border rounded-xl border border-border bg-surface">
          {novel.chapters.map((chapter) => (
            <div key={chapter.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <span className="flex items-center gap-3">
                <span className="font-display text-sm text-mist-dim">
                  {String(chapter.chapterNumber).padStart(2, "0")}
                </span>
                <span className="text-sm text-paper">{chapter.title}</span>
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/admin/novels/${novel.id}/chapters/${chapter.id}/edit`}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-mist hover:border-ember hover:text-ember"
                >
                  Засах
                </Link>
                <DeleteButton
                  url={`/api/chapters/${chapter.id}`}
                  confirmText={`Бүлэг ${chapter.chapterNumber}-ийг устгах уу?`}
                />
              </div>
            </div>
          ))}
          {novel.chapters.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-mist-dim">
              Бүлэг хараахан нэмэгдээгүй байна.
            </p>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-mist-dim">
        Дараагийн санал болгох дугаар: {nextChapterNumber}
      </p>
    </div>
  );
}
