"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function CommentForm({
  novelId,
  chapterId,
  isLoggedIn,
}: {
  novelId: string;
  chapterId?: string;
  isLoggedIn: boolean;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-mist">
        Сэтгэгдэл бичихийн тулд{" "}
        <a href="/login" className="text-ember hover:underline">
          нэвтэрнэ үү
        </a>
        .
      </p>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError("");

    startTransition(async () => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelId, chapterId, content: content.trim() }),
      });
      if (!res.ok) {
        setError("Сэтгэгдэл илгээхэд алдаа гарлаа");
        return;
      }
      setContent("");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Сэтгэгдэл бичих..."
        rows={3}
        className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <button
        type="submit"
        disabled={isPending || !content.trim()}
        className="self-end rounded-lg bg-ember px-5 py-2 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft disabled:opacity-50"
      >
        {isPending ? "Илгээж байна..." : "Илгээх"}
      </button>
    </form>
  );
}
