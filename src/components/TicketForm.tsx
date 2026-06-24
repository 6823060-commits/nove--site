"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const typeOptions = [
  { value: "BUG", label: "Алдаа засах", icon: "🐛" },
  { value: "FEATURE", label: "Нэмэлт өөрчлөлт", icon: "✨" },
  { value: "AUTHOR_REQUEST", label: "Зохиолч болох хүсэлт", icon: "✍️" },
  { value: "NOVEL_REQUEST", label: "Новел нэмэх хүсэлт", icon: "📖" },
  { value: "OTHER", label: "Бусад", icon: "💬" },
];

const priorityOptions = [
  { value: "LOW", label: "Бага", color: "text-mist" },
  { value: "NORMAL", label: "Энгийн", color: "text-success" },
  { value: "HIGH", label: "Яаралтай", color: "text-ember" },
  { value: "URGENT", label: "Маш яаралтай", color: "text-danger" },
];

export default function TicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("OTHER");
  const [priority, setPriority] = useState("NORMAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, type, priority }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Алдаа гарлаа");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/tickets"), 2000);
  };

  if (success) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/10 px-6 py-10 text-center">
        <span className="text-4xl">✅</span>
        <p className="mt-3 font-display text-lg font-semibold text-paper">
          Хүсэлт амжилттай илгээгдлээ!
        </p>
        <p className="mt-1 text-sm text-mist">
          Таны хүсэлтийг admin хянаж, удахгүй хариу өгөх болно.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-sm text-mist">
          Хүсэлтийн гарчиг <span className="text-danger">*</span>
        </label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Хүсэлтийн товч гарчиг"
          className="w-full rounded-lg border border-border bg-ink-deep px-4 py-2.5 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-mist">Хүсэлтийн төрөл</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {typeOptions.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                type === opt.value
                  ? "border-ember bg-ember/10 text-ember"
                  : "border-border text-mist hover:border-ember/50 hover:text-paper"
              }`}
            >
              <span>{opt.icon}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-mist">Яаралтай эсэх</label>
        <div className="flex gap-2">
          {priorityOptions.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setPriority(opt.value)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                priority === opt.value
                  ? `border-current bg-current/10 ${opt.color}`
                  : "border-border text-mist-dim hover:border-border hover:text-mist"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-mist">
          Дэлгэрэнгүй тайлбар <span className="text-danger">*</span>
        </label>
        <textarea
          required
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Хүсэлтийнхээ талаар дэлгэрэнгүй бичнэ үү..."
          className="w-full rounded-lg border border-border bg-ink-deep px-4 py-3 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-mist-dim">{content.length} тэмдэгт</p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ember px-6 py-2.5 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft disabled:opacity-60"
        >
          {loading ? "Илгээж байна..." : "Хүсэлт илгээх"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-6 py-2.5 text-sm text-mist transition hover:border-ember hover:text-ember"
        >
          Болих
        </button>
      </div>
    </form>
  );
}
