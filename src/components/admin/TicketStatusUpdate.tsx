"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const statusOptions = [
  { value: "PENDING", label: "Хүлээгдэж буй", color: "text-ember" },
  { value: "IN_PROGRESS", label: "Хянагдаж байна", color: "text-plum-soft" },
  { value: "RESOLVED", label: "Шийдэгдсэн", color: "text-success" },
  { value: "CLOSED", label: "Хаагдсан", color: "text-mist" },
];

export default function TicketStatusUpdate({
  ticketId,
  currentStatus,
  currentNote,
}: {
  ticketId: string;
  currentStatus: string;
  currentNote: string | null;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [adminNote, setAdminNote] = useState(currentNote ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-4 font-display text-base font-semibold text-paper">
        Admin үйлдэл
      </h3>

      <div className="mb-4">
        <label className="mb-2 block text-sm text-mist">Төлөв өөрчлөх</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                status === opt.value
                  ? `border-current bg-current/10 ${opt.color}`
                  : "border-border text-mist-dim hover:text-mist"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm text-mist">
          Хариу (хэрэглэгчид харагдана)
        </label>
        <textarea
          rows={4}
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Хүсэлтийн хариу, тайлбар бичнэ үү..."
          className="w-full rounded-lg border border-border bg-ink-deep px-4 py-3 text-sm text-paper placeholder:text-mist-dim focus:border-ember focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="rounded-lg bg-ember px-5 py-2 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft disabled:opacity-60"
      >
        {isPending ? "Хадгалж байна..." : saved ? "✓ Хадгалагдлаа" : "Хадгалах"}
      </button>
    </div>
  );
}
