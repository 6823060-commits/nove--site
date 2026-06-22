"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({
  url,
  confirmText,
}: {
  url: string;
  confirmText: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!window.confirm(confirmText)) return;
    startTransition(async () => {
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg border border-border px-3 py-1.5 text-xs text-mist transition hover:border-danger hover:text-danger disabled:opacity-50"
    >
      {isPending ? "Устгаж байна..." : "Устгах"}
    </button>
  );
}
