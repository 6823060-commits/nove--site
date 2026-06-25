import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatRelativeTime, formatDate } from "@/lib/format";
import { novelCardSelect } from "@/lib/format";

const STATUS_META = {
  READING: { label: "Уншиж байна", icon: "📖", color: "text-success" },
  PLANNED: { label: "Төлөвлөсөн", icon: "📋", color: "text-plum-soft" },
  DROPPED: { label: "Хаясан", icon: "⏸️", color: "text-mist" },
  COMPLETED: { label: "Уншиж дууссан", icon: "✅", color: "text-ember" },
  FAVORITE: { label: "Дуртай", icon: "⭐", color: "text-ember-soft" },
} as const;

type StatusKey = keyof typeof STATUS_META;

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string }>;
}) {
  const session = await auth();

  if (!session?.user) return null;

  const params = await searchParams;

  const activeTab =
    params.tab === "history" || params.tab === "comments"
      ? params.tab
      : "novels";

  const rawStatus = params.status as StatusKey | undefined;

  const activeStatus: StatusKey | null =
    rawStatus && rawStatus in STATUS_META ? rawStatus : null;

  const [readingListCounts, readingListItems, comments, progress] =
    await Promise.all([
      prisma.readingList.groupBy({
        by: ["status"],
        where: {
          userId: session.user.id,
          status: {
            in: Object.keys(STATUS_META) as StatusKey[],
          },
        },
        _count: {
          _all: true,
        },
      }),

      prisma.readingList.findMany({
        where: {
          userId: session.user.id,
          status: activeStatus
            ? activeStatus
            : {
                in: Object.keys(STATUS_META) as StatusKey[],
              },
        },
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          status: true,
          updatedAt: true,
          novel: {
            select: {
              ...novelCardSelect,
              id: true,
              slug: true,
              title: true,
              coverImage: true,
              _count: {
                select: {
                  chapters: true,
                },
              },
            },
          },
        },
      }),

      activeTab === "comments"
        ? prisma.comment.findMany({
            where: {
              userId: session.user.id,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 20,
            select: {
              id: true,
              content: true,
              createdAt: true,
              novel: {
                select: {
                  slug: true,
                  title: true,
                },
              },
              chapter: {
                select: {
                  chapterNumber: true,
                  title: true,
                },
              },
            },
          })
        : Promise.resolve([]),

      prisma.readingProgress.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 10,
        select: {
          updatedAt: true,
          novel: {
            select: {
              slug: true,
              title: true,
              _count: {
                select: {
                  chapters: true,
                },
              },
            },
          },
          chapter: {
            select: {
              chapterNumber: true,
              title: true,
            },
          },
        },
      }),
    ]);

  const countMap = readingListCounts.reduce(
    (acc, c) => ({
      ...acc,
      [c.status]: c._count._all,
    }),
    {} as Record<string, number>
  );

  const totalReadingList = Object.values(countMap).reduce(
    (a, b) => a + b,
    0
  );

  const tabs = [
    { key: "novels", label: "Жагсаалт", icon: "📚" },
    { key: "history", label: "Унших түүх", icon: "⏱️" },
    { key: "comments", label: "Сэтгэгдэл", icon: "☁️" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Profile header */}
      <div className="mb-6 flex items-center gap-5 rounded-2xl border border-border bg-surface p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-plum/30 font-display text-2xl font-bold text-plum-soft">
          {session.user.name?.charAt(0).toUpperCase()}
        </span>

        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-paper">
            {session.user.name}
          </h1>

          <p className="text-sm text-mist-dim">{session.user.email}</p>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-mist-dim">
            <span>{totalReadingList} жагсаалтад</span>
            <span>нийт коммент</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/profile?tab=${tab.key}`}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-ember text-ink-deep"
                : "text-mist hover:bg-surface-raised hover:text-paper"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>

      {/* Novels tab */}
      {activeTab === "novels" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="md:sticky md:top-24 md:self-start">
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="border-b border-border px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-mist-dim">
                  Жагсаалтууд
                </p>
              </div>

              <Link
                href="/profile?tab=novels"
                className={`flex items-center justify-between px-4 py-3 text-sm transition hover:bg-surface-raised ${
                  !activeStatus ? "font-medium text-ember" : "text-mist"
                }`}
              >
                <span>Бүгд</span>
                <span className="rounded-full bg-surface-raised px-2 py-0.5 text-xs text-mist-dim">
                  {totalReadingList}
                </span>
              </Link>

              {(Object.keys(STATUS_META) as StatusKey[]).map((key) => (
                <Link
                  key={key}
                  href={`/profile?tab=novels&status=${key}`}
                  className={`flex items-center justify-between px-4 py-3 text-sm transition hover:bg-surface-raised ${
                    activeStatus === key
                      ? `${STATUS_META[key].color} font-medium`
                      : "text-mist"
                  }`}
                >
                  <span>
                    {STATUS_META[key].icon} {STATUS_META[key].label}
                  </span>

                  <span className="rounded-full bg-surface-raised px-2 py-0.5 text-xs text-mist-dim">
                    {countMap[key] ?? 0}
                  </span>
                </Link>
              ))}
            </div>
          </aside>

          {/* Novel list */}
          <div className="flex flex-col gap-2">
            {readingListItems.length > 0 ? (
              readingListItems.map((item) => {
                const totalChapters = item.novel._count.chapters;
                const prog = progress.find(
                  (p) => p.novel.slug === item.novel.slug
                );
                const currentChapter = prog?.chapter.chapterNumber ?? 0;
                const pct =
                  totalChapters > 0
                    ? Math.round((currentChapter / totalChapters) * 100)
                    : 0;
                const meta = STATUS_META[item.status as StatusKey];

                return (
                  <Link
                    key={item.novel.slug}
                    href={`/novels/${item.novel.slug}`}
                    className="flex gap-4 rounded-xl border border-border bg-surface p-4 transition hover:border-ember-dim hover:bg-surface-raised"
                  >
                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-plum/40 to-ink-deep">
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

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-1 font-display text-sm font-semibold text-paper hover:text-ember">
                            {item.novel.title}
                          </p>

                          <span
                            className={`shrink-0 text-xs font-medium ${meta.color}`}
                          >
                            {meta.icon} {meta.label}
                          </span>
                        </div>

                        {prog && (
                          <p className="mt-0.5 text-xs text-mist-dim">
                            Бүлэг {currentChapter} / {totalChapters} —{" "}
                            {prog.chapter.title}
                          </p>
                        )}
                      </div>

                      <div className="mt-2">
                        {totalChapters > 0 && (
                          <>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                              <div
                                className="h-full rounded-full bg-ember transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>

                            <div className="mt-1 flex items-center justify-between text-xs text-mist-dim">
                              <span>{pct}%</span>
                              <span>{formatRelativeTime(item.updatedAt)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="rounded-xl border border-border bg-surface py-16 text-center">
                <span className="text-4xl">📚</span>

                <p className="mt-3 font-display text-lg text-paper">
                  {activeStatus
                    ? `${STATUS_META[activeStatus].icon} ${STATUS_META[activeStatus].label} жагсаалт хоосон байна`
                    : "Жагсаалт хоосон байна"}
                </p>

                <p className="mt-1 text-sm text-mist-dim">
                  Новел харахдаа &ldquo;Жагсаалтад нэмэх&rdquo; товчоор нэмнэ үү
                </p>

                <Link
                  href="/catalog"
                  className="mt-4 inline-block rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold text-ink-deep hover:bg-ember-soft"
                >
                  Каталог үзэх
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold text-paper">
            Унших түүх
          </h2>

          {progress.length > 0 ? (
            progress.map((item) => {
              const pct =
                item.novel._count.chapters > 0
                  ? Math.round(
                      (item.chapter.chapterNumber /
                        item.novel._count.chapters) *
                        100
                    )
                  : 0;

              return (
                <Link
                  key={item.novel.slug}
                  href={`/novels/${item.novel.slug}/${item.chapter.chapterNumber}`}
                  className="flex gap-4 rounded-xl border border-border bg-surface p-4 transition hover:border-ember-dim"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-sm font-semibold text-paper">
                        {item.novel.title}
                      </p>

                      <p className="text-xs text-mist-dim">
                        {formatRelativeTime(item.updatedAt)}
                      </p>
                    </div>

                    <p className="mt-0.5 text-xs text-mist">
                      Бүлэг {item.chapter.chapterNumber}: {item.chapter.title}
                    </p>

                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-ember"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <p className="mt-1 text-right text-xs text-mist-dim">
                      {pct}%
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-xl border border-border bg-surface py-16 text-center">
              <span className="text-4xl">⏱️</span>

              <p className="mt-3 font-display text-lg text-paper">
                Унших түүх хоосон байна
              </p>

              <Link
                href="/catalog"
                className="mt-4 inline-block text-sm text-ember hover:underline"
              >
                Новел унших →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Comments tab */}
      {activeTab === "comments" && (
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold text-paper">
            Сэтгэгдлүүд
          </h2>

          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={
                      comment.chapter
                        ? `/novels/${comment.novel.slug}/${comment.chapter.chapterNumber}`
                        : `/novels/${comment.novel.slug}`
                    }
                    className="text-sm font-medium text-ember hover:underline"
                  >
                    {comment.novel.title}
                    {comment.chapter &&
                      ` — Бүлэг ${comment.chapter.chapterNumber}`}
                  </Link>

                  <span className="text-xs text-mist-dim">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                <p className="mt-2 line-clamp-3 text-sm text-mist">
                  {comment.content}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-surface py-16 text-center">
              <span className="text-4xl">☁️</span>

              <p className="mt-3 font-display text-lg text-paper">
                Сэтгэгдэл байхгүй байна
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}