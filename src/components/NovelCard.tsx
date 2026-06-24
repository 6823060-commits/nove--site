import Link from "next/link";

type NovelCardData = {
  slug: string;
  title: string;
  author: string;
  description: string;
  coverImage: string | null;
  status: "ONGOING" | "COMPLETED" | "HIATUS";
  genres: string[];
  chapterCount: number;
};

const statusLabel: Record<NovelCardData["status"], string> = {
  ONGOING: "Үргэлжилж буй",
  COMPLETED: "Дууссан",
  HIATUS: "Түр зогссон",
};

const statusColor: Record<NovelCardData["status"], string> = {
  ONGOING: "text-success border-success/40 bg-success/10",
  COMPLETED: "text-plum-soft border-plum/40 bg-plum/10",
  HIATUS: "text-mist border-border bg-surface",
};

export default function NovelCard({
  novel,
  compact = false,
}: {
  novel: NovelCardData;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Link
        href={`/novels/${novel.slug}`}
        className="group relative overflow-hidden rounded-xl border border-border bg-surface transition hover:border-ember-dim"
      >
        {/* Cover */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-br from-plum/40 to-ink-deep">
          {novel.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={novel.coverImage}
              alt={novel.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-4xl text-paper/60">
                {novel.title.charAt(0)}
              </span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/20 to-transparent" />
          {/* Status badge */}
          <span
            className={`absolute left-2 top-2 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${statusColor[novel.status]}`}
          >
            {statusLabel[novel.status]}
          </span>
          {/* Chapter badge */}
          <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
            <p className="font-display text-xs font-semibold text-paper line-clamp-2 group-hover:text-ember transition">
              {novel.title}
            </p>
            <p className="mt-0.5 text-[10px] text-mist-dim">{novel.chapterCount} бүлэг</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/novels/${novel.slug}`}
      className="group flex gap-4 rounded-xl border border-border bg-surface p-3 transition hover:border-ember-dim hover:bg-surface-raised sm:flex-col sm:gap-0 sm:p-0 sm:overflow-hidden"
    >
      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-plum/40 to-ink-deep sm:h-56 sm:w-full sm:rounded-none">
        {novel.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={novel.coverImage}
            alt={novel.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-3xl text-paper/70 sm:text-5xl">
              {novel.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-deep/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100 sm:opacity-60" />
      </div>

      <div className="flex flex-1 flex-col sm:p-4">
        <span
          className={`mb-1.5 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusColor[novel.status]}`}
        >
          {statusLabel[novel.status]}
        </span>
        <h3 className="font-display text-base font-semibold text-paper transition group-hover:text-ember sm:text-lg line-clamp-2">
          {novel.title}
        </h3>
        <p className="mt-0.5 text-xs text-mist-dim">{novel.author}</p>
        <p className="mt-2 hidden text-sm text-mist line-clamp-2 sm:block">
          {novel.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 text-xs text-mist-dim">
          <span>{novel.chapterCount} бүлэг</span>
          {novel.genres.slice(0, 2).map((g) => (
            <span
              key={g}
              className="rounded-full border border-border px-2 py-0.5 text-plum-soft"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
