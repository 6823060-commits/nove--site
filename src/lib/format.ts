export const novelCardSelect = {
  slug: true,
  title: true,
  author: true,
  description: true,
  coverImage: true,
  status: true,
  genres: { select: { genre: { select: { name: true } } } },
  _count: { select: { chapters: true } },
} as const;

type RawNovel = {
  slug: string;
  title: string;
  author: string;
  description: string;
  coverImage: string | null;
  status: "ONGOING" | "COMPLETED" | "HIATUS";
  genres: { genre: { name: string } }[];
  _count: { chapters: number };
};

export function toNovelCard(novel: RawNovel) {
  return {
    slug: novel.slug,
    title: novel.title,
    author: novel.author,
    description: novel.description,
    coverImage: novel.coverImage,
    status: novel.status,
    genres: novel.genres.map((g) => g.genre.name),
    chapterCount: novel._count.chapters,
  };
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatRelativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "дөнгөж сая";
  if (diffMin < 60) return `${diffMin} минутын өмнө`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} цагийн өмнө`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} өдрийн өмнө`;
  return formatDate(date);
}
