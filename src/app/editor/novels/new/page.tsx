import { prisma } from "@/lib/prisma";
import NovelForm from "@/components/admin/NovelForm";

export default async function EditorNewNovelPage() {
  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-paper">Шинэ новел нэмэх</h1>
      <NovelForm genres={genres} />
    </div>
  );
}
