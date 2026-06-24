"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

type Genre = { slug: string; name: string; _count: { novels: number } };

const SORT_OPTIONS = [
  { value: "views", label: "Алдартай байгаагаараа" },
  { value: "updatedAt", label: "Шинэчлэгдсэн огноогоор" },
  { value: "createdAt", label: "Нэмсэн огноогоор" },
  { value: "chapters", label: "Бүлгийн тоогоор" },
  { value: "title_asc", label: "Үсэглэлээр (А → Я)" },
  { value: "title_desc", label: "Үсэглэлээр (Я → А)" },
];

const STATUS_OPTIONS = [
  { value: "ONGOING", label: "Үргэлжилж буй" },
  { value: "COMPLETED", label: "Дууссан" },
  { value: "HIATUS", label: "Түр зогссон" },
];

export default function CatalogFilters({ genres }: { genres: Genre[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState<"sort" | "genre" | "status" | null>(null);

  const currentSort = searchParams.get("sort") ?? "views";
  const currentStatus = searchParams.get("status") ?? "";
  const currentGenres = searchParams.get("genres")?.split(",").filter(Boolean) ?? [];
  const currentQ = searchParams.get("q") ?? "";

  const push = (params: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    sp.delete("page");
    startTransition(() => router.push(`${pathname}?${sp.toString()}`));
  };

  const toggleGenre = (slug: string) => {
    const next = currentGenres.includes(slug)
      ? currentGenres.filter((g) => g !== slug)
      : [...currentGenres, slug];
    push({ genres: next.join(",") });
  };

  const toggleStatus = (val: string) => {
    push({ status: currentStatus === val ? "" : val });
  };

  const sortLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? "Эрэмбэлэх";
  const activeCount = currentGenres.length + (currentStatus ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
          push({ q });
        }}
        className="flex items-center gap-0"
      >
        <input
          name="q"
          defaultValue={currentQ}
          placeholder="Гарчигаар хайх..."
          className="h-9 w-48 rounded-l-lg border border-border bg-surface px-3 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
        data-has-listeners="true"
        />
        <button
          type="submit"
          className="flex h-9 items-center rounded-r-lg bg-ember px-3 text-sm text-ink-deep hover:bg-ember-soft"
        >
          🔍
        </button>
      </form>

      {/* Sort dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(open === "sort" ? null : "sort")}
          className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-mist hover:border-ember hover:text-ember"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {sortLabel}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        {open === "sort" && (
          <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-ink-deep shadow-xl">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { push({ sort: opt.value }); setOpen(null); }}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-surface ${
                  currentSort === opt.value ? "text-ember" : "text-mist"
                }`}
              >
                <span className={`h-3 w-3 rounded-full border-2 flex-shrink-0 ${
                  currentSort === opt.value ? "border-ember bg-ember" : "border-mist-dim"
                }`} />
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Genre dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(open === "genre" ? null : "genre")}
          className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition ${
            currentGenres.length > 0
              ? "border-ember bg-ember/10 text-ember"
              : "border-border bg-surface text-mist hover:border-ember hover:text-ember"
          }`}
        >
          🏷 Жанр
          {currentGenres.length > 0 && (
            <span className="rounded-full bg-ember px-1.5 text-xs text-ink-deep">
              {currentGenres.length}
            </span>
          )}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        {open === "genre" && (
          <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-ink-deep shadow-xl">
            <div className="max-h-64 overflow-y-auto py-1">
              {genres.map((genre) => (
                <button
                  key={genre.slug}
                  type="button"
                  onClick={() => toggleGenre(genre.slug)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-sm transition hover:bg-surface"
                >
                  <span className="flex items-center gap-2">
                    <span className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                      currentGenres.includes(genre.slug)
                        ? "border-ember bg-ember text-ink-deep"
                        : "border-mist-dim"
                    }`}>
                      {currentGenres.includes(genre.slug) && "✓"}
                    </span>
                    <span className={currentGenres.includes(genre.slug) ? "text-ember" : "text-mist"}>
                      {genre.name}
                    </span>
                  </span>
                  <span className="text-xs text-mist-dim">{genre._count.novels}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(open === "status" ? null : "status")}
          className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition ${
            currentStatus
              ? "border-ember bg-ember/10 text-ember"
              : "border-border bg-surface text-mist hover:border-ember hover:text-ember"
          }`}
        >
          📋 Төлөв
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        {open === "status" && (
          <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-ink-deep shadow-xl">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { toggleStatus(opt.value); setOpen(null); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-surface"
              >
                <span className={`h-3 w-3 rounded-full border-2 flex-shrink-0 ${
                  currentStatus === opt.value ? "border-ember bg-ember" : "border-mist-dim"
                }`} />
                <span className={currentStatus === opt.value ? "text-ember" : "text-mist"}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear filters */}
      {(activeCount > 0 || currentQ) && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="flex h-9 items-center gap-1 rounded-lg border border-danger/40 bg-danger/10 px-3 text-sm text-danger hover:bg-danger/20"
        >
          ✕ Цэвэрлэх {activeCount > 0 && `(${activeCount})`}
        </button>
      )}

      {isPending && (
        <span className="text-xs text-mist-dim animate-pulse">Хайж байна...</span>
      )}

      {/* Close dropdowns on outside click */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(null)}
        />
      )}
    </div>
  );
}
