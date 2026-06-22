import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { novelCardSelect, toNovelCard, formatRelativeTime } from "@/lib/format";
import NovelCard from "@/components/NovelCard";

export default async function HomePage() {
  const session = await auth();

  const [latestNovels, popularNovels, genres, continueReading] = await Promise.all([
    prisma.novel.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: novelCardSelect,
    }),
    prisma.novel.findMany({
      orderBy: { views: "desc" },
      take: 6,
      select: novelCardSelect,
    }),
    prisma.genre.findMany({
      take: 10,
      orderBy: { name: "asc" },
      select: { name: true, slug: true, _count: { select: { novels: true } } },
    }),
    session?.user
      ? prisma.readingProgress.findMany({
          where: { userId: session.user.id },
          orderBy: { updatedAt: "desc" },
          take: 4,
          select: {
            updatedAt: true,
            novel: { select: { slug: true, title: true, coverImage: true } },
            chapter: { select: { chapterNumber: true, title: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div>
      <section className="glow-lamp relative overflow-hidden border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="flicker mb-4 text-4xl" aria-hidden>
            🕯️
          </span>
          <h1 className="max-w-2xl font-display text-3xl font-bold leading-tight text-paper sm:text-5xl">
            
          </h1>
          <p className="mt-4 max-w-xl text-base text-mist sm:text-lg">
            Уран зөгнөл, романс, тулаан, шог өгүүллэг — урт удаан түүхүүдийг
            бүлэг бүлгээр уншиж, дуртай зохиолоо хадгалаарай.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/novels"
              className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft"
            >
              Новел харах
            </Link>
            {!session?.user && (
              <Link
                href="/register"
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-paper transition hover:border-ember hover:text-ember"
              >
                Үнэгүй бүртгүүлэх
              </Link>
            )}
          </div>
        </div>
      </section>

      {continueReading.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="mb-4 font-display text-xl font-semibold text-paper">
            Үргэлжлүүлэн унш
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {continueReading.map((item) => (
              <Link
                key={item.novel.slug}
                href={`/novels/${item.novel.slug}/${item.chapter.chapterNumber}`}
                className="group rounded-xl border border-border bg-surface p-4 transition hover:border-ember-dim"
              >
                <p className="text-xs text-mist-dim">
                  {formatRelativeTime(item.updatedAt)}
                </p>
                <p className="mt-1 font-display text-sm font-semibold text-paper group-hover:text-ember line-clamp-1">
                  {item.novel.title}
                </p>
                <p className="mt-1 text-xs text-mist">
                  Бүлэг {item.chapter.chapterNumber}: {item.chapter.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-paper">
            Сүүлд шинэчлэгдсэн
          </h2>
          <Link href="/novels" className="text-sm text-ember hover:text-ember-soft">
            Бүгдийг үзэх →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {latestNovels.map((novel) => (
            <NovelCard key={novel.slug} novel={toNovelCard(novel)} />
          ))}
        </div>
        {latestNovels.length === 0 && (
          <p className="text-sm text-mist-dim">Одоогоор новел нэмэгдээгүй байна.</p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="mb-4 font-display text-xl font-semibold text-paper">
          Хамгийн их уншсан
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularNovels.map((novel) => (
            <NovelCard key={novel.slug} novel={toNovelCard(novel)} />
          ))}
        </div>
      </section>

      {genres.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="mb-4 font-display text-xl font-semibold text-paper">
            Төрлөөр үзэх
          </h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Link
                key={genre.slug}
                href={`/novels?genre=${genre.slug}`}
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-mist transition hover:border-ember hover:text-ember"
              >
                {genre.name}
                <span className="ml-1.5 text-mist-dim">{genre._count.novels}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
