"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ChapterInitial = {
  id: string;
  chapterNumber: number;
  title: string;
  content: string;
  isPremium: boolean;
};

export default function ChapterForm({
  novelId,
  novelSlug,
  suggestedChapterNumber,
  initial,
}: {
  novelId: string;
  novelSlug: string;
  suggestedChapterNumber?: number;
  initial?: ChapterInitial;
}) {
  const router = useRouter();
  const isEdit = !!initial;

  const [chapterNumber, setChapterNumber] = useState(
    initial?.chapterNumber ?? suggestedChapterNumber ?? 1
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [isPremium, setIsPremium] = useState(initial?.isPremium ?? false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = { novelId, chapterNumber, title, content, isPremium };
    const res = await fetch(isEdit ? `/api/chapters/${initial!.id}` : "/api/chapters", {
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

    router.push(`/admin/novels/${novelId}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[140px_1fr]">
        <div>
          <label className="mb-1.5 block text-sm text-mist">Дугаар</label>
          <input
            type="number"
            min={1}
            required
            value={chapterNumber}
            onChange={(e) => setChapterNumber(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-paper focus:border-ember focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-mist">Бүлгийн гарчиг</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-paper focus:border-ember focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-mist">Бүлгийн агуулга</label>
        <textarea
          required
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-reading text-sm leading-relaxed text-paper focus:border-ember focus:outline-none"
          placeholder="Бүлгийн текстээ энд бичнэ..."
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsPremium((v) => !v)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
            isPremium
              ? "border-ember bg-ember/10 text-ember"
              : "border-border text-mist hover:border-ember/50"
          }`}
        >
          <span>👑</span>
          {isPremium ? "Premium бүлэг" : "Энгийн бүлэг (Premium биш)"}
        </button>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ember px-6 py-2.5 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft disabled:opacity-60"
        >
          {loading ? "Хадгалж байна..." : isEdit ? "Хадгалах" : "Нийтлэх"}
        </button>
        {isEdit && (
          <a
            href={`/novels/${novelSlug}/${initial!.chapterNumber}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-border px-6 py-2.5 text-sm text-mist hover:border-ember hover:text-ember"
          >
            Урьдчилан үзэх
          </a>
        )}
      </div>
    </form>
  );
}
