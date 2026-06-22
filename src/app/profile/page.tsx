import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/format";
import NovelCard from "@/components/NovelCard";
import { novelCardSelect, toNovelCard } from "@/lib/format";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) return null;

  const [favorites, progress] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { novel: { select: novelCardSelect } },
    }),
    prisma.readingProgress.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        updatedAt: true,
        novel: { select: { slug: true, title: true } },
        chapter: { select: { chapterNumber: true, title: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-plum/30 font-display text-xl text-plum-soft">
          {session.user.name?.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-paper">{session.user.name}</h1>
          <p className="text-sm text-mist-dim">{session.user.email}</p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold text-paper">
          Унших түүх
        </h2>
        {progress.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {progress.map((item) => (
              <Link
                key={item.novel.slug}
                href={`/novels/${item.novel.slug}/${item.chapter.chapterNumber}`}
                className="rounded-xl border border-border bg-surface p-4 transition hover:border-ember-dim"
              >
                <p className="text-xs text-mist-dim">{formatRelativeTime(item.updatedAt)}</p>
                <p className="mt-1 font-display text-sm font-semibold text-paper line-clamp-1">
                  {item.novel.title}
                </p>
                <p className="mt-1 text-xs text-mist">
                  Бүлэг {item.chapter.chapterNumber}: {item.chapter.title}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-mist-dim">Та одоогоор ямар нэгэн новел уншиж эхлээгүй байна.</p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold text-paper">
          Дуртай новел <span className="text-mist-dim">({favorites.length})</span>
        </h2>
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {favorites.map(({ novel }) => (
              <NovelCard key={novel.slug} novel={toNovelCard(novel)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-mist-dim">
            Дуртай новел хараахан тэмдэглээгүй байна.{" "}
            <Link href="/novels" className="text-ember hover:underline">
              Новел үзэх
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
