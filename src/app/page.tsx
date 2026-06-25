import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/format";

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
      className="group block w-[140px] shrink-0"
    >
      <div className="relative h-[190px] overflow-hidden rounded-xl border border-border bg-gradient-to-br from-plum/40 to-ink-deep shadow-md transition group-hover:-translate-y-1 group-hover:border-ember">
        {novel.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={novel.coverImage}
            alt={novel.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-4xl text-paper/60">
              {novel.title.charAt(0)}
            </span>
          </div>
        )}

        {latestChapter && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
            Бүлэг {latestChapter.chapterNumber}
          </span>
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-paper transition group-hover:text-ember">
        {novel.title}
      </h3>

      <p className="mt-0.5 line-clamp-1 text-xs text-mist-dim">
        {novel.author || "Зохиогч тодорхойгүй"}
      </p>
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
      className="group flex min-w-0 gap-3 rounded-xl p-2 transition hover:bg-surface-raised"
    >
      <div className="h-[72px] w-[52px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-plum/40 to-ink-deep">
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

      <div className="min-w-0 pt-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-paper transition group-hover:text-ember">
          {novel.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-xs text-mist-dim">
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
    <div>
      <h2 className="mb-3 text-sm font-semibold text-mist-dim">{title}</h2>

      <div className="space-y-1">
        {novels.length > 0 ? (
          novels.map((novel) => <NovelMiniItem key={novel.slug} novel={novel} />)
        ) : (
          <div className="rounded-xl border border-border bg-surface px-4 py-8 text-center">
            <p className="text-sm text-mist-dim">Новел байхгүй байна.</p>
          </div>
        )}
      </div>
    </div>
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
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-paper transition hover:border-ember"
      >
        {current.label}
        <span className="text-[10px] text-mist-dim">▼</span>
      </button>

      <div className="invisible absolute right-0 top-full z-20 mt-2 w-36 rounded-xl border border-border bg-surface p-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
        {PERIOD_OPTIONS.map((option) => (
          <Link
            key={option.key}
            href={`/?period=${option.key}`}
            className={`block rounded-lg px-3 py-2 text-sm transition ${
              activePeriod === option.key
                ? "bg-surface-raised text-ember"
                : "text-mist hover:bg-surface-raised hover:text-paper"
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
      className="flex items-center gap-4 border-b border-border px-4 py-3 transition last:border-b-0 hover:bg-surface-raised"
    >
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-plum/40 to-ink-deep">
        {item.novel.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.novel.coverImage}
            alt={item.novel.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-lg text-paper/60">
              {item.novel.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-sm font-semibold text-paper">
          {item.novel.title}
        </h3>

        <p className="mt-0.5 line-clamp-1 text-xs text-mist">
          Бүлэг {item.chapterNumber}: {item.title}
        </p>

        <p className="mt-1 text-xs text-mist-dim">
          {item.novel.author || "Зохиогч тодорхойгүй"}
        </p>
      </div>

      <span className="hidden text-xs text-mist-dim sm:block">
        {formatRelativeTime(item.createdAt)}
      </span>
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
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Хамгийн дээр харагдах нэмсэн новелууд */}
      <section className="mb-8 rounded-2xl border border-border bg-surface p-4 shadow-xl sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="font-display text-xl font-semibold text-paper">
            Шинээр нэмэгдсэн новелууд
          </h1>

          <Link
            href="/novels"
            className="text-sm font-medium text-ember hover:text-ember-soft"
          >
            Бүгдийг үзэх →
          </Link>
        </div>

        {topAddedNovels.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {topAddedNovels.map((novel) => (
              <CoverNovelCard key={novel.slug} novel={novel} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface-raised px-6 py-12 text-center">
            <p className="text-4xl">📚</p>

            <h2 className="mt-3 font-display text-lg font-semibold text-paper">
              Новел хараахан нэмэгдээгүй байна
            </h2>

            <p className="mt-1 text-sm text-mist-dim">
              Admin panel-оос новел нэмсний дараа энд харагдана.
            </p>
          </div>
        )}
      </section>

      {/* 3 багана */}
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-xl sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <Link
            href="/novels"
            className="text-base font-semibold text-ember transition hover:text-ember-soft"
          >
            Одоо уншиж байна →
          </Link>

          <PeriodDropdown activePeriod={activePeriod} />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <SectionColumn title="Шинэ" novels={newNovels} />
          <SectionColumn title="Олны анхааралд" novels={risingNovels} />
          <SectionColumn title="Алдартай" novels={popularNovels} />
        </div>
      </section>

      {/* Сүүлийн шинэчлэлтүүд */}
      <section className="mt-8 rounded-2xl border border-border bg-surface shadow-xl">
        <div className="border-b border-border px-4 pt-4 sm:px-5">
          <h2 className="font-display text-xl font-semibold text-paper">
            Сүүлийн шинэчлэлтүүд
          </h2>

          <div className="mt-3 flex gap-5 text-sm">
            <Link
              href={`/?period=${activePeriod}&updates=all`}
              className={`border-b-2 pb-3 transition ${
                activeUpdates === "all"
                  ? "border-ember text-paper"
                  : "border-transparent text-mist-dim hover:text-paper"
              }`}
            >
              Бүх шинэчлэлтүүд
            </Link>

            <Link
              href={`/?period=${activePeriod}&updates=mine`}
              className={`border-b-2 pb-3 transition ${
                activeUpdates === "mine"
                  ? "border-ember text-paper"
                  : "border-transparent text-mist-dim hover:text-paper"
              }`}
            >
              Миний шинэчлэлтүүд
            </Link>
          </div>
        </div>

        {updatesToShow.length > 0 ? (
          <div>
            {updatesToShow.map((item) => (
              <UpdateItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-14 text-center">
            <p className="text-4xl">📚</p>

            <h3 className="mt-3 font-display text-lg font-semibold text-paper">
              {activeUpdates === "mine"
                ? "Таны шинэчлэлт хоосон байна"
                : "Шинэчлэлт байхгүй байна"}
            </h3>

            <p className="mt-1 text-sm text-mist-dim">
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