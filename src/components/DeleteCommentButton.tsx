"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-mist-dim transition hover:text-danger disabled:opacity-50"
    >
      Устгах
    </button>
  );
}
