import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { novelCardSelect, toNovelCard } from "@/lib/format";
import NovelCard from "@/components/NovelCard";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 12;

type SearchParams = {
  q?: string;
  genre?: string;
  status?: string;
  page?: string;
};

export default async function NovelsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const genreSlug = params.genre ?? "";
  const status = params.status ?? "";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const where: Prisma.NovelWhereInput = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { author: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && ["ONGOING", "COMPLETED", "HIATUS"].includes(status)
      ? { status: status as "ONGOING" | "COMPLETED" | "HIATUS" }
      : {}),
    ...(genreSlug
      ? { genres: { some: { genre: { slug: genreSlug } } } }
      : {}),
  };

  const [novels, total, genres] = await Promise.all([
    prisma.novel.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: novelCardSelect,
    }),
    prisma.novel.count({ where }),
    prisma.genre.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildUrl = (overrides: Partial<SearchParams>) => {
    const next = { q, genre: genreSlug, status, page: String(page), ...overrides };
    const sp = new URLSearchParams();
    if (next.q) sp.set("q", next.q);
    if (next.genre) sp.set("genre", next.genre);
    if (next.status) sp.set("status", next.status);
    if (next.page && next.page !== "1") sp.set("page", next.page);
    const qs = sp.toString();
    return qs ? `/novels?${qs}` : "/novels";
  };

  const statusOptions = [
    { value: "", label: "Бүгд" },
    { value: "ONGOING", label: "Үргэлжилж буй" },
    { value: "COMPLETED", label: "Дууссан" },
    { value: "HIATUS", label: "Түр зогссон" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-paper sm:text-3xl">
        Бүх новелууд
      </h1>
      <p className="mt-1 text-sm text-mist">
        {total} новел олдлоо{q ? ` — "${q}"` : ""}
      </p>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/novels">
        {genreSlug && <input type="hidden" name="genre" value={genreSlug} />}
        {status && <input type="hidden" name="status" value={status} />}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Гарчиг эсвэл зохиолчоор хайх..."
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft"
        >
          Хайх
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {statusOptions.map((opt) => (
          <Link
            key={opt.value}
            href={buildUrl({ status: opt.value, page: "1" })}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              status === opt.value
                ? "border-ember bg-ember/10 text-ember"
                : "border-border text-mist hover:border-ember hover:text-ember"
            }`}
          >
            {opt.label}
          </Link>
        ))}
        <span className="mx-1 h-4 w-px bg-border" />
        <Link
          href={buildUrl({ genre: "", page: "1" })}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            !genreSlug
              ? "border-ember bg-ember/10 text-ember"
              : "border-border text-mist hover:border-ember hover:text-ember"
          }`}
        >
          Бүх төрөл
        </Link>
        {genres.map((genre) => (
          <Link
            key={genre.slug}
            href={buildUrl({ genre: genre.slug, page: "1" })}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              genreSlug === genre.slug
                ? "border-ember bg-ember/10 text-ember"
                : "border-border text-mist hover:border-ember hover:text-ember"
            }`}
          >
            {genre.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {novels.map((novel) => (
          <NovelCard key={novel.slug} novel={toNovelCard(novel)} />
        ))}
      </div>

      {novels.length === 0 && (
        <p className="mt-10 text-center text-sm text-mist-dim">
          Хайлтад тохирох новел олдсонгүй.
        </p>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Link
            href={buildUrl({ page: String(Math.max(1, page - 1)) })}
            aria-disabled={page <= 1}
            className={`rounded-lg border border-border px-4 py-2 text-sm ${
              page <= 1 ? "pointer-events-none opacity-40" : "text-mist hover:border-ember hover:text-ember"
            }`}
          >
            ← Өмнөх
          </Link>
          <span className="px-3 text-sm text-mist-dim">
            {page} / {totalPages}
          </span>
          <Link
            href={buildUrl({ page: String(Math.min(totalPages, page + 1)) })}
            aria-disabled={page >= totalPages}
            className={`rounded-lg border border-border px-4 py-2 text-sm ${
              page >= totalPages ? "pointer-events-none opacity-40" : "text-mist hover:border-ember hover:text-ember"
            }`}
          >
            Дараах →
          </Link>
        </div>
      )}
    </div>
  );
}
