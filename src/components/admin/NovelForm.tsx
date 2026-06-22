"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slugify";

type Genre = { id: string; name: string };

type NovelInitial = {
  id: string;
  title: string;
  slug: string;
  author: string;
  description: string;
  coverImage: string | null;
  status: "ONGOING" | "COMPLETED" | "HIATUS";
  genreIds: string[];
};

export default function NovelForm({
  genres: initialGenres,
  initial,
}: {
  genres: Genre[];
  initial?: NovelInitial;
}) {
  const router = useRouter();
  const isEdit = !!initial;

  const [genres, setGenres] = useState(initialGenres);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [status, setStatus] = useState(initial?.status ?? "ONGOING");
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>(initial?.genreIds ?? []);
  const [newGenreName, setNewGenreName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const toggleGenre = (id: string) => {
    setSelectedGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const addGenre = async () => {
    if (!newGenreName.trim()) return;
    const res = await fetch("/api/genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGenreName.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setGenres((prev) => [...prev, data.genre]);
      setSelectedGenreIds((prev) => [...prev, data.genre.id]);
      setNewGenreName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      title,
      slug,
      author,
      description,
      coverImage,
      status,
      genreIds: selectedGenreIds,
    };

    const res = await fetch(isEdit ? `/api/novels/${initial!.id}` : "/api/novels", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Алдаа гарлаа");
      return;
    }

    router.push("/admin/novels");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-mist">Гарчиг</label>
          <input
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-paper focus:border-ember focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-mist">Slug (URL)</label>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-paper focus:border-ember focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-mist">Зохиолч</label>
          <input
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-paper focus:border-ember focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-mist">Төлөв</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-paper focus:border-ember focus:outline-none"
          >
            <option value="ONGOING">Үргэлжилж буй</option>
            <option value="COMPLETED">Дууссан</option>
            <option value="HIATUS">Түр зогссон</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-mist">Тойм</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-paper focus:border-ember focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-mist">Нүүр зургийн URL (заавал биш)</label>
        <input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-paper focus:border-ember focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-mist">Төрөл</label>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              type="button"
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selectedGenreIds.includes(genre.id)
                  ? "border-ember bg-ember/10 text-ember"
                  : "border-border text-mist hover:border-ember hover:text-ember"
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            placeholder="Шинэ төрлийн нэр"
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-paper focus:border-ember focus:outline-none"
          />
          <button
            type="button"
            onClick={addGenre}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-mist hover:border-ember hover:text-ember"
          >
            + Нэмэх
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ember px-6 py-2.5 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft disabled:opacity-60"
        >
          {loading ? "Хадгалж байна..." : isEdit ? "Хадгалах" : "Үүсгэх"}
        </button>
      </div>
    </form>
  );
}
