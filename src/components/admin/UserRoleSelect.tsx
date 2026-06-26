"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Role = "USER" | "EDITOR" | "ADMIN";

const ROLE_OPTIONS: { value: Role; label: string; color: string }[] = [
  { value: "USER",   label: "Хэрэглэгч",  color: "text-mist"      },
  { value: "EDITOR", label: "Редактор",   color: "text-plum-soft" },
  { value: "ADMIN",  label: "Админ",      color: "text-ember"     },
];

export default function UserRoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: Role;
}) {
  const [role, setRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleChange = (newRole: Role) => {
    setRole(newRole);
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center gap-1">
      {ROLE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => handleChange(opt.value)}
          disabled={isPending}
          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
            role === opt.value
              ? `border-current bg-current/10 ${opt.color}`
              : "border-border text-mist-dim hover:border-border hover:text-mist"
          }`}
        >
          {opt.label}
        </button>
      ))}
      {saved && <span className="ml-1 text-xs text-success">✓</span>}
    </div>
  );
}
