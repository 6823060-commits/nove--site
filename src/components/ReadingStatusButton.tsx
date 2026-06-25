"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Status = "READING" | "PLANNED" | "DROPPED" | "COMPLETED" | "FAVORITE";

const STATUS_OPTIONS: { value: Status; label: string; icon: string; color: string }[] = [
  { value: "READING",   label: "Уншиж байна",  icon: "📖", color: "text-success" },
  { value: "PLANNED",   label: "Төлөвлөсөн",   icon: "📋", color: "text-plum-soft" },
  { value: "DROPPED",   label: "Орхисон",       icon: "⏸️", color: "text-mist" },
  { value: "COMPLETED", label: "Уншиж дууссан", icon: "✅", color: "text-ember" },
  { value: "FAVORITE",  label: "Дуртай",        icon: "⭐", color: "text-ember-soft" },
];

export default function ReadingStatusButton({
  novelId,
  initialStatus,
  isLoggedIn,
}: {
  novelId: string;
  initialStatus: Status | null;
  isLoggedIn: boolean;
}) {
  const [status, setStatus] = useState<Status | null>(initialStatus);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = STATUS_OPTIONS.find((o) => o.value === status);

  const handleSelect = (val: Status) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setOpen(false);

    startTransition(async () => {
      const res = await fetch("/api/reading-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelId, status: val }),
      });
      if (res.ok) setStatus(val);
    });
  };

  const handleRemove = () => {
    setOpen(false);
    startTransition(async () => {
      const res = await fetch("/api/reading-list", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelId }),
      });
      if (res.ok) setStatus(null);
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          if (!isLoggedIn) { router.push("/login"); return; }
          setOpen((v) => !v);
        }}
        disabled={isPending}
        className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition disabled:opacity-60 ${
          status
            ? "border-ember bg-ember/10 text-ember"
            : "border-border text-mist hover:border-ember hover:text-ember"
        }`}
      >
        <span>{current?.icon ?? "📚"}</span>
        <span>{current?.label ?? "Жагсаалтад нэмэх"}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          className={`transition ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-border bg-ink-deep shadow-xl">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-surface ${
                status === opt.value ? opt.color + " font-semibold" : "text-mist"
              }`}
            >
              <span className="text-base">{opt.icon}</span>
              <span>{opt.label}</span>
              {status === opt.value && (
                <span className="ml-auto text-xs">✓</span>
              )}
            </button>
          ))}

          {status && (
            <>
              <div className="mx-3 my-1 h-px bg-border" />
              <button
                type="button"
                onClick={handleRemove}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-danger transition hover:bg-danger/10"
              >
                <span>🗑️</span>
                <span>Жагсаалтаас хасах</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
