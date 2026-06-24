import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { novelCardSelect, toNovelCard } from "@/lib/format";
import NovelCard from "@/components/NovelCard";
import CatalogFilters from "@/components/CatalogFilters";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 18;

type SearchParams = {
  q?: string;
  genres?: string;
  status?: string;
  sort?: string;
  page?: string;
};

function getOrderBy(sort: string): Prisma.NovelOrderByWithRelationInput {
  switch (sort) {
    case "views":      return { views: "desc" };
    case "createdAt":  return { createdAt: "desc" };
    case "updatedAt":  return { updatedAt: "desc" };
    case "title_asc":  return { title: "asc" };
    case "title_desc": return { title: "desc" };
    case "chapters":   return { chapters: { _count: "desc" } };
    default:           return { views: "desc" };
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const genreSlugs = params.genres?.split(",").filter(Boolean) ?? [];
  const status = params.status ?? "";
  const sort = params.sort ?? "views";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const where: Prisma.NovelWhereInput = {
    ...(q ? {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
      ],
    } : {}),
    ...(status && ["ONGOING", "COMPLETED", "HIATUS"].includes(status)
      ? { status: status as "ONGOING" | "COMPLETED" | "HIATUS" }
      : {}),
    ...(genreSlugs.length > 0
      ? { genres: { some: { genre: { slug: { in: genreSlugs } } } } }
      : {}),
  };

  const [novels, total, genres] = await Promise.all([
    prisma.novel.findMany({
      where,
      orderBy: getOrderBy(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: novelCardSelect,
    }),
    prisma.novel.count({ where }),
    prisma.genre.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true, _count: { select: { novels: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildUrl = (overrides: Partial<SearchParams>) => {
    const next = { q, genres: genreSlugs.join(","), status, sort, page: String(page), ...overrides };
    const sp = new URLSearchParams();
    if (next.q) sp.set("q", next.q);
    if (next.genres) sp.set("genres", next.genres);
    if (next.status) sp.set("status", next.status);
    if (next.sort && next.sort !== "views") sp.set("sort", next.sort);
    if (next.page && next.page !== "1") sp.set("page", next.page);
    const qs = sp.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-paper sm:text-3xl">
          📚 Каталог
        </h1>
        <p className="mt-1 text-sm text-mist-dim">
          {total.toLocaleString("mn-MN")} новел олдлоо
          {q && <span> — &ldquo;{q}&rdquo;</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Suspense>
          <CatalogFilters genres={genres} />
        </Suspense>
      </div>

      {/* Active genre tags */}
      {genreSlugs.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {genreSlugs.map((slug) => {
            const genre = genres.find((g) => g.slug === slug);
            return (
              <Link
                key={slug}
                href={buildUrl({ genres: genreSlugs.filter((g) => g !== slug).join(","), page: "1" })}
                className="inline-flex items-center gap-1.5 rounded-full border border-ember/40 bg-ember/10 px-3 py-1 text-xs text-ember hover:bg-ember/20"
              >
                {genre?.name ?? slug}
                <span>✕</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Novel grid */}
      {novels.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {novels.map((novel) => (
            <NovelCard key={novel.slug} novel={toNovelCard(novel)} compact />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl">🔍</span>
          <p className="mt-4 font-display text-lg text-paper">Новел олдсонгүй</p>
          <p className="mt-1 text-sm text-mist-dim">
            Өөр хайлт эсвэл шүүлтүүрийг туршиж үзнэ үү
          </p>
          <Link
            href="/catalog"
            className="mt-4 rounded-lg border border-border px-4 py-2 text-sm text-mist hover:border-ember hover:text-ember"
          >
            Шүүлтүүр цэвэрлэх
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
          <Link
            href={buildUrl({ page: String(Math.max(1, page - 1)) })}
            aria-disabled={page <= 1}
            className={`rounded-lg border px-4 py-2 text-sm transition ${
              page <= 1
                ? "pointer-events-none border-border text-mist-dim opacity-40"
                : "border-border text-mist hover:border-ember hover:text-ember"
            }`}
          >
            ← Өмнөх
          </Link>

          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let p: number;
            if (totalPages <= 7) {
              p = i + 1;
            } else if (page <= 4) {
              p = i + 1;
            } else if (page >= totalPages - 3) {
              p = totalPages - 6 + i;
            } else {
              p = page - 3 + i;
            }
            return (
              <Link
                key={p}
                href={buildUrl({ page: String(p) })}
                className={`h-9 w-9 rounded-lg border text-center text-sm leading-9 transition ${
                  p === page
                    ? "border-ember bg-ember text-ink-deep"
                    : "border-border text-mist hover:border-ember hover:text-ember"
                }`}
              >
                {p}
              </Link>
            );
          })}

          <Link
            href={buildUrl({ page: String(Math.min(totalPages, page + 1)) })}
            aria-disabled={page >= totalPages}
            className={`rounded-lg border px-4 py-2 text-sm transition ${
              page >= totalPages
                ? "pointer-events-none border-border text-mist-dim opacity-40"
                : "border-border text-mist hover:border-ember hover:text-ember"
            }`}
          >
            Дараах →
          </Link>
        </div>
      )}
    </div>
  );
}
