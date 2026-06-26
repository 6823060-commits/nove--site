import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import CommentSection from "@/components/CommentSection";
import PremiumLock from "@/components/PremiumLock";

function ChapterNav({
  slug,
  prevChapter,
  nextChapter,
}: {
  slug: string;
  prevChapter?: { chapterNumber: number };
  nextChapter?: { chapterNumber: number };
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      {prevChapter ? (
        <Link
          href={`/novels/${slug}/${prevChapter.chapterNumber}`}
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-center text-sm text-paper transition hover:border-ember hover:text-ember sm:flex-none"
        >
          ← Өмнөх бүлэг
        </Link>
      ) : (
        <span className="flex-1 sm:flex-none" />
      )}
      <Link
        href={`/novels/${slug}`}
        className="rounded-lg border border-border bg-surface px-4 py-2.5 text-center text-sm text-mist transition hover:border-ember hover:text-ember"
      >
        Жагсаалт
      </Link>
      {nextChapter ? (
        <Link
          href={`/novels/${slug}/${nextChapter.chapterNumber}`}
          className="flex-1 rounded-lg bg-ember px-4 py-2.5 text-center text-sm font-semibold text-ink-deep transition hover:bg-ember-soft sm:flex-none"
        >
          Дараах бүлэг →
        </Link>
      ) : (
        <span className="flex-1 sm:flex-none" />
      )}
    </div>
  );
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapterNumber: string }>;
}) {
  const { slug, chapterNumber } = await params;
  const chapterNum = Number(chapterNumber);
  const session = await auth();

  if (!Number.isInteger(chapterNum)) notFound();

  const novel = await prisma.novel.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      chapters: {
        orderBy: { chapterNumber: "asc" },
        select: { id: true, chapterNumber: true, title: true },
      },
    },
  });

  if (!novel) notFound();

  const chapterIndex = novel.chapters.findIndex((c) => c.chapterNumber === chapterNum);
  if (chapterIndex === -1) notFound();

  const chapterMeta = novel.chapters[chapterIndex];
  const prevChapter = novel.chapters[chapterIndex - 1];
  const nextChapter = novel.chapters[chapterIndex + 1];

  const [chapter, comments] = await Promise.all([
    prisma.chapter.findUnique({
      where: { id: chapterMeta.id },
      select: { id: true, title: true, content: true, chapterNumber: true, isPremium: true },
    }),
    prisma.comment.findMany({
      where: { chapterId: chapterMeta.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: { select: { name: true } },
      },
    }),
  ]);

  if (!chapter) notFound();

  // Premium check
  if (chapter.isPremium) {
    const userPremium = session?.user
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { isPremium: true, premiumExpiresAt: true },
        })
      : null;

    const hasPremium =
      userPremium?.isPremium &&
      (!userPremium.premiumExpiresAt || userPremium.premiumExpiresAt > new Date());

    if (!hasPremium) {
      return <PremiumLock chapterNumber={chapter.chapterNumber} novelTitle={novel.title} />;
    }
  }

  prisma.chapter.update({ where: { id: chapter.id }, data: { views: { increment: 1 } } }).catch(() => {});

  if (session?.user) {
    prisma.readingProgress
      .upsert({
        where: { userId_novelId: { userId: session.user.id, novelId: novel.id } },
        update: { chapterId: chapter.id },
        create: { userId: session.user.id, novelId: novel.id, chapterId: chapter.id },
      })
      .catch(() => {});
  }

  return (
    <div>
      <ReadingProgressBar />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href={`/novels/${slug}`} className="text-sm text-mist hover:text-ember">
          ← {novel.title}
        </Link>

        <p className="mt-4 text-xs uppercase tracking-wider text-mist-dim">
          Бүлэг {chapter.chapterNumber} / {novel.chapters.length}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-paper sm:text-3xl">
          {chapter.title}
        </h1>

        <div className="mt-6">
          <ChapterNav slug={slug} prevChapter={prevChapter} nextChapter={nextChapter} />
        </div>

        <article className="prose-reading mt-8 whitespace-pre-wrap font-reading text-[17px] leading-[1.9] text-paper/90 sm:text-[18px]">
          {chapter.content}
        </article>

        <div className="mt-10">
          <ChapterNav slug={slug} prevChapter={prevChapter} nextChapter={nextChapter} />
        </div>

        <div className="mt-14 border-t border-border pt-10">
          <CommentSection
            novelId={novel.id}
            chapterId={chapter.id}
            comments={comments}
            isLoggedIn={!!session?.user}
            currentUserId={session?.user?.id}
            isAdmin={session?.user?.role === "ADMIN"}
          />
        </div>
      </div>
    </div>
  );
}
