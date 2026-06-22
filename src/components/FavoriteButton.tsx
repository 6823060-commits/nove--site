"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function FavoriteButton({
  novelId,
  initialFavorited,
  isLoggedIn,
  favoriteCount,
}: {
  novelId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
  favoriteCount: number;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(favoriteCount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const nextFavorited = !favorited;
    setFavorited(nextFavorited);
    setCount((c) => (nextFavorited ? c + 1 : Math.max(0, c - 1)));

    startTransition(async () => {
      try {
        const res = await fetch("/api/favorites", {
          method: nextFavorited ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ novelId }),
        });
        if (!res.ok) throw new Error("failed");
      } catch {
        setFavorited(!nextFavorited);
        setCount((c) => (!nextFavorited ? c + 1 : Math.max(0, c - 1)));
      }
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition disabled:opacity-60 ${
        favorited
          ? "border-ember bg-ember/10 text-ember"
          : "border-border text-mist hover:border-ember hover:text-ember"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"}>
        <path
          d="M12 20.5s-7.5-4.6-10-9.3C0.5 7.8 2.3 4 6 4c2.2 0 3.8 1.2 6 3.6C14.2 5.2 15.8 4 18 4c3.7 0 5.5 3.8 4 7.2-2.5 4.7-10 9.3-10 9.3z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
      {favorited ? "Дуртай зохиол" : "Дуртай гэж тэмдэглэх"}
      <span className="text-xs text-mist-dim">{count}</span>
    </button>
  );
}
