import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import UserRoleSelect from "@/components/admin/UserRoleSelect";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isPremium: true,
      premiumExpiresAt: true,
      createdAt: true,
      _count: { select: { createdNovels: true, comments: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-paper">Хэрэглэгчид</h1>
        <span className="text-sm text-mist-dim">Нийт {users.length}</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-mist-dim">
              <th className="px-4 py-3">Хэрэглэгч</th>
              <th className="px-4 py-3">Premium</th>
              <th className="px-4 py-3">Новел</th>
              <th className="px-4 py-3">Нэгдсэн</th>
              <th className="px-4 py-3">Эрх</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => {
              const premiumActive =
                user.isPremium &&
                (!user.premiumExpiresAt || user.premiumExpiresAt > new Date());

              return (
                <tr key={user.id} className="hover:bg-surface-raised">
                  <td className="px-4 py-3">
                    <p className="font-medium text-paper">{user.name}</p>
                    <p className="text-xs text-mist-dim">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {premiumActive ? (
                      <span className="text-xs font-medium text-ember">
                        👑 {user.premiumExpiresAt
                          ? formatDate(user.premiumExpiresAt) + " хүртэл"
                          : "Идэвхтэй"}
                      </span>
                    ) : (
                      <span className="text-xs text-mist-dim">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-mist">{user._count.createdNovels}</td>
                  <td className="px-4 py-3 text-xs text-mist-dim">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <UserRoleSelect
                      userId={user.id}
                      currentRole={user.role as "USER" | "EDITOR" | "ADMIN"}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
