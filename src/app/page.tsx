import Link from "next/link";

import { auth } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type HomeSearchParams = {
  period?: string;
  updates?: string;
};

const PERIOD_OPTIONS = [
  { key: "day", label: "Өнөөдөр", days: 1 },
  { key: "week", label: "7 хоног", days: 7 },
  { key: "month", label: "Сар", days: 30 },
] as const;

function getPeriodDate(period: string) {
  const selected =
    PERIOD_OPTIONS.find((option) => option.key === period) ?? PERIOD_OPTIONS[0];

  const date = new Date();
  date.setDate(date.getDate() - selected.days);

  return {
    selected,
    date,
  };
}

function CoverNovelCard({
  novel,
}: {
  novel: {
    slug: string;
    title: string;
    author: string | null;
    coverImage: string | null;
    chapters: { chapterNumber: number }[];
  };
}) {
  const latestChapter = novel.chapters[0];

  return (
    <Link
      href={`/novels/${novel.slug}`}
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-xl transition hover:-translate-y-1 hover:border-ember"
    >
      {novel.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={novel.coverImage}
          alt={novel.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-plum/40 to-ink-deep">
          <span className="font-display text-5xl text-paper/60">
            {novel.title.charAt(0)}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

      {latestChapter && (
        <div className="absolute left-3 top-3 rounded-full bg-ember px-3 py-1 text-xs font-semibold text-white shadow-lg">
          Бүлэг {latestChapter.chapterNumber}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="line-clamp-2 font-display text-lg font-semibold text-white">
          {novel.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-sm text-white/70">
          {novel.author || "Зохиогч тодорхойгүй"}
        </p>
      </div>
    </Link>
  );
}

function NovelMiniItem({
  novel,
}: {
  novel: {
    slug: string;
    title: string;
    author: string | null;
    coverImage: string | null;
  };
}) {
  return (
    <Link
      href={`/novels/${novel.slug}`}
      className="group flex gap-3 rounded-xl border border-border bg-surface-raised p-3 transition hover:-translate-y-1 hover:border-ember"
    >
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-plum/40 to-ink-deep">
        {novel.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={novel.coverImage}
            alt={novel.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-lg text-paper/60">
              {novel.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-paper transition group-hover:text-ember">
          {novel.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-xs text-mist">
          {novel.author || "Зохиогч тодорхойгүй"}
        </p>
      </div>
    </Link>
  );
}

function SectionColumn({
  title,
  novels,
}: {
  title: string;
  novels: {
    slug: string;
    title: string;
    author: string | null;
    coverImage: string | null;
  }[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-xl">
      <h2 className="mb-4 font-display text-lg font-semibold text-paper">
        {title}
      </h2>

      <div className="space-y-3">
        {novels.length > 0 ? (
          novels.map((novel) => <NovelMiniItem key={novel.slug} novel={novel} />)
        ) : (
          <p className="rounded-xl border border-border bg-surface-raised p-4 text-sm text-mist">
            Новел байхгүй байна.
          </p>
        )}
      </div>
    </section>
  );
}

function PeriodDropdown({ activePeriod }: { activePeriod: string }) {
  const current =
    PERIOD_OPTIONS.find((option) => option.key === activePeriod) ??
    PERIOD_OPTIONS[0];

  return (
    <div className="group relative">
      <button
        type="button"
        className="rounded-full border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-paper transition hover:border-ember"
      >
        {current.label} ▼
      </button>

      <div className="invisible absolute right-0 top-full z-20 mt-2 w-36 overflow-hidden rounded-xl border border-border bg-surface opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
        {PERIOD_OPTIONS.map((option) => (
          <Link
            key={option.key}
            href={`/?period=${option.key}`}
            className={`block px-4 py-2 text-sm transition hover:bg-surface-raised ${
              activePeriod === option.key ? "text-ember" : "text-mist"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function UpdateItem({
  item,
}: {
  item: {
    id: string;
    createdAt: Date;
    chapterNumber: number;
    title: string;
    novel: {
      slug: string;
      title: string;
      coverImage: string | null;
      author: string | null;
    };
  };
}) {
  return (
    <Link
      href={`/novels/${item.novel.slug}/${item.chapterNumber}`}
      className="group flex gap-3 rounded-xl border border-border bg-surface-raised p-3 transition hover:-translate-y-1 hover:border-ember"
    >
      <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-plum/40 to-ink-deep">
        {item.novel.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.novel.coverImage}
            alt={item.novel.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-xl text-paper/60">
              {item.novel.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-paper transition group-hover:text-ember">
          {item.novel.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-xs text-mist">
          Бүлэг {item.chapterNumber}: {item.title}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-mist-dim">
          <span className="line-clamp-1">
            {item.novel.author || "Зохиогч тодорхойгүй"}
          </span>
          <span className="shrink-0">{formatRelativeTime(item.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

function ContinueReadingItem({
  item,
}: {
  item: {
    updatedAt: Date;
    chapter: {
      chapterNumber: number;
      title: string;
    };
    novel: {
      slug: string;
      title: string;
      author: string | null;
      coverImage: string | null;
    };
  };
}) {
  return (
    <Link
      href={`/novels/${item.novel.slug}/${item.chapter.chapterNumber}`}
      className="group flex min-w-[230px] gap-3 rounded-xl border border-border bg-surface-raised p-3 transition hover:-translate-y-1 hover:border-ember"
    >
      <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-plum/40 to-ink-deep">
        {item.novel.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.novel.coverImage}
            alt={item.novel.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-xl text-paper/60">
              {item.novel.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-paper transition group-hover:text-ember">
          {item.novel.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-xs text-mist">
          Бүлэг {item.chapter.chapterNumber}: {item.chapter.title}
        </p>

        <p className="mt-2 text-xs text-mist-dim">
          {formatRelativeTime(item.updatedAt)}
        </p>
      </div>
    </Link>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;

  const activePeriod =
    params.period === "week" || params.period === "month"
      ? params.period
      : "day";

  const activeUpdates = params.updates === "mine" ? "mine" : "all";

  const { date: periodDate } = getPeriodDate(activePeriod);

  const [
    topAddedNovels,
    continueReading,
    newNovels,
    risingNovels,
    popularNovels,
    allUpdates,
    myReadingList,
  ] = await Promise.all([
    prisma.novel.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
      select: {
        slug: true,
        title: true,
        author: true,
        coverImage: true,
        chapters: {
          orderBy: {
            chapterNumber: "desc",
          },
          take: 1,
          select: {
            chapterNumber: true,
          },
        },
      },
    }),

    session?.user
      ? prisma.readingProgress.findMany({
          where: {
            userId: session.user.id,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 8,
          select: {
            updatedAt: true,
            chapter: {
              select: {
                chapterNumber: true,
                title: true,
              },
            },
            novel: {
              select: {
                slug: true,
                title: true,
                author: true,
                coverImage: true,
              },
            },
          },
        })
      : Promise.resolve([]),

    prisma.novel.findMany({
      where: {
        createdAt: {
          gte: periodDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        slug: true,
        title: true,
        author: true,
        coverImage: true,
      },
    }),

    prisma.novel.findMany({
      where: {
        updatedAt: {
          gte: periodDate,
        },
      },
      orderBy: [
        {
          views: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
      take: 5,
      select: {
        slug: true,
        title: true,
        author: true,
        coverImage: true,
      },
    }),

    prisma.novel.findMany({
      orderBy: {
        views: "desc",
      },
      take: 5,
      select: {
        slug: true,
        title: true,
        author: true,
        coverImage: true,
      },
    }),

    prisma.chapter.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      select: {
        id: true,
        title: true,
        chapterNumber: true,
        createdAt: true,
        novel: {
          select: {
            slug: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
    }),

    session?.user
      ? prisma.readingList.findMany({
          where: {
            userId: session.user.id,
          },
          select: {
            novelId: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const myNovelIds = myReadingList.map((item) => item.novelId);

  const myUpdates =
    session?.user && myNovelIds.length > 0
      ? await prisma.chapter.findMany({
          where: {
            novelId: {
              in: myNovelIds,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
          select: {
            id: true,
            title: true,
            chapterNumber: true,
            createdAt: true,
            novel: {
              select: {
                slug: true,
                title: true,
                author: true,
                coverImage: true,
              },
            },
          },
        })
      : [];

  const updatesToShow = activeUpdates === "mine" ? myUpdates : allUpdates;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Шинээр нэмэгдсэн новелууд */}
      <section className="mb-8 rounded-2xl border border-border bg-surface p-4 shadow-xl sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-paper sm:text-3xl">
              Шинээр нэмэгдсэн новелууд
            </h1>
          </div>

          <Link
            href="/catalog"
            className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium text-mist transition hover:border-ember hover:text-ember"
          >
            Бүгдийг үзэх →
          </Link>
        </div>

        {topAddedNovels.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {topAddedNovels.map((novel) => (
              <CoverNovelCard key={novel.slug} novel={novel} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface-raised px-6 py-12 text-center">
            <h2 className="font-display text-xl font-semibold text-paper">
              Новел хараахан нэмэгдээгүй байна
            </h2>

            <p className="mt-2 text-sm text-mist">
              Admin panel-оос новел нэмсний дараа энд харагдана.
            </p>
          </div>
        )}
      </section>

      {/* Үргэлжлүүлэн унших */}
      {session?.user && (
        <section className="mb-8 rounded-2xl border border-border bg-surface p-4 shadow-xl sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-paper">
              Үргэлжлүүлэн унших
            </h2>

            <Link
              href="/profile"
              className="text-sm font-medium text-ember transition hover:text-ember-soft"
            >
              Миний түүх →
            </Link>
          </div>

          {continueReading.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {continueReading.map((item) => (
                <ContinueReadingItem
                  key={`${item.novel.slug}-${item.chapter.chapterNumber}`}
                  item={item}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface-raised px-6 py-10 text-center">
              <h3 className="font-display text-lg font-semibold text-paper">
                Уншиж байсан новел байхгүй байна
              </h3>

              <p className="mt-1 text-sm text-mist-dim">
                Новел уншиж эхэлсний дараа энд үргэлжлүүлэн унших хэсэг гарна.
              </p>
            </div>
          )}
        </section>
      )}

      {/* 3 багана */}
      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        <SectionColumn title="Шинэ новелууд" novels={newNovels} />
        <SectionColumn title="Өсөж буй" novels={risingNovels} />
        <SectionColumn title="Алдартай" novels={popularNovels} />
      </div>

      {/* Сүүлийн шинэчлэлтүүд */}
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-xl sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-paper">
              Сүүлийн шинэчлэлтүүд
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PeriodDropdown activePeriod={activePeriod} />

            <Link
              href={`/?period=${activePeriod}&updates=all`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeUpdates === "all"
                  ? "bg-ember text-white"
                  : "border border-border text-mist hover:border-ember hover:text-ember"
              }`}
            >
              Бүх шинэчлэлтүүд
            </Link>

            <Link
              href={`/?period=${activePeriod}&updates=mine`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeUpdates === "mine"
                  ? "bg-ember text-white"
                  : "border border-border text-mist hover:border-ember hover:text-ember"
              }`}
            >
              Миний шинэчлэлтүүд
            </Link>
          </div>
        </div>

        {updatesToShow.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {updatesToShow.map((item) => (
              <UpdateItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface-raised px-6 py-12 text-center">
            <h3 className="font-display text-lg font-semibold text-paper">
              {activeUpdates === "mine"
                ? "Таны шинэчлэлт хоосон байна"
                : "Шинэчлэлт байхгүй байна"}
            </h3>

            <p className="mt-2 text-sm text-mist">
              {activeUpdates === "mine"
                ? "Новелыг жагсаалтдаа нэмбэл энд шинэ бүлгүүд нь харагдана."
                : "Chapter нэмэгдсэний дараа энд харагдана."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}