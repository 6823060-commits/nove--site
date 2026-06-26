import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import FavoriteButton from "@/components/FavoriteButton";
import ReadingStatusButton from "@/components/ReadingStatusButton";
import CommentSection from "@/components/CommentSection";

const statusLabel: Record<string, string> = {
  ONGOING: "Үргэлжилж буй",
  COMPLETED: "Дууссан",
  HIATUS: "Түр зогссон",
};

export default async function NovelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const novel = await prisma.novel.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      author: true,
      description: true,
      coverImage: true,
      status: true,
      views: true,
      createdAt: true,
      genres: { select: { genre: { select: { name: true, slug: true } } } },
      chapters: {
        orderBy: { chapterNumber: "asc" },
        select: { id: true, chapterNumber: true, title: true, createdAt: true, isPremium: true },
      },
      _count: { select: { favorites: true } },
      comments: {
        where: { chapterId: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          userId: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!novel) notFound();

  prisma.novel.update({ where: { id: novel.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const [isFavorited, progress, readingListItem] = await Promise.all([
    session?.user
      ? prisma.favorite.findUnique({
          where: { userId_novelId: { userId: session.user.id, novelId: novel.id } },
        })
      : null,
    session?.user
      ? prisma.readingProgress.findUnique({
          where: { userId_novelId: { userId: session.user.id, novelId: novel.id } },
          select: { chapter: { select: { chapterNumber: true } } },
        })
      : null,
    session?.user
      ? prisma.readingList.findUnique({
          where: { userId_novelId: { userId: session.user.id, novelId: novel.id } },
          select: { status: true },
        })
      : null,
  ]);

  const firstChapter = novel.chapters[0];
  const continueChapter = progress?.chapter.chapterNumber ?? firstChapter?.chapterNumber;
  const continueLabel = progress ? "Үргэлжлүүлэн унших" : "Эхнээс унших";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
        <div className="relative mx-auto h-72 w-48 overflow-hidden rounded-xl bg-gradient-to-br from-plum/40 to-ink-deep shadow-xl md:mx-0 md:h-80 md:w-full">
          {novel.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={novel.coverImage} alt={novel.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-6xl text-paper/70">{novel.title.charAt(0)}</span>
            </div>
          )}
        </div>

        <div>
          <span className="inline-flex items-center rounded-full border border-success/40 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
            {statusLabel[novel.status]}
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-paper sm:text-4xl">
            {novel.title}
          </h1>
          <p className="mt-1 text-sm text-mist-dim">{novel.author}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {novel.genres.map(({ genre }) => (
              <Link
                key={genre.slug}
                href={`/novels?genre=${genre.slug}`}
                className="rounded-full border border-border px-3 py-1 text-xs text-plum-soft hover:border-plum"
              >
                {genre.name}
              </Link>
            ))}
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist">{novel.description}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-mist-dim">
            <span>{novel.chapters.length} бүлэг</span>
            <span>{novel.views.toLocaleString("mn-MN")} уншсан</span>
            <span>{formatDate(novel.createdAt)}-нд нэмэгдсэн</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {continueChapter !== undefined && (
              <Link
                href={`/novels/${slug}/${continueChapter}`}
                className="rounded-full bg-ember px-6 py-2.5 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft"
              >
                {continueLabel}
              </Link>
            )}
            <ReadingStatusButton
              novelId={novel.id}
              initialStatus={(readingListItem?.status ?? null) as "READING" | "PLANNED" | "DROPPED" | "COMPLETED" | "FAVORITE" | null}
              isLoggedIn={!!session?.user}
            />
            <FavoriteButton
              novelId={novel.id}
              initialFavorited={!!isFavorited}
              isLoggedIn={!!session?.user}
              favoriteCount={novel._count.favorites}
            />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 font-display text-xl font-semibold text-paper">Бүлгүүд</h2>
        {novel.chapters.length > 0 ? (
          <div className="divide-y divide-border rounded-xl border border-border bg-surface">
            {novel.chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/novels/${slug}/${chapter.chapterNumber}`}
                className="flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-surface-raised"
              >
                <span className="flex items-center gap-3">
                  <span className="font-display text-sm text-mist-dim">
                    {String(chapter.chapterNumber).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-paper">{chapter.title}</span>
                  {chapter.isPremium && (
                    <span className="rounded-full bg-ember/10 px-2 py-0.5 text-[10px] font-medium text-ember">
                      👑 Premium
                    </span>
                  )}
                </span>
                <span className="text-xs text-mist-dim">{formatDate(chapter.createdAt)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-mist-dim">Бүлэг хараахан нэмэгдээгүй байна.</p>
        )}
      </div>

      <div className="mt-12">
        <CommentSection
          novelId={novel.id}
          comments={novel.comments}
          isLoggedIn={!!session?.user}
          currentUserId={session?.user?.id}
          isAdmin={session?.user?.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
