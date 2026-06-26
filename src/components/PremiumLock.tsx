import Link from "next/link";

export default function PremiumLock({
  chapterNumber,
  novelTitle,
}: {
  chapterNumber: number;
  novelTitle: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-ember/30 bg-ember/5 p-8 max-w-md w-full">
        <span className="text-5xl">👑</span>
        <h2 className="mt-4 font-display text-xl font-bold text-paper">
          Premium бүлэг
        </h2>
        <p className="mt-2 text-sm text-mist">
          <strong className="text-paper">{novelTitle}</strong>-ийн{" "}
          {chapterNumber}-р бүлэг Premium гишүүдэд зориулагдсан байна.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <Link
            href="/premium"
            className="rounded-xl bg-ember py-3 text-sm font-semibold text-ink-deep transition hover:bg-ember-soft"
          >
            👑 Premium авах
          </Link>
          <Link
            href="/premium"
            className="text-xs text-mist hover:text-ember"
          >
            Тарифийн төлөвлөгөө харах →
          </Link>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs text-mist-dim">Premium эрхтэй бол:</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-mist">
            <span>🔓 Бүх бүлэг нээлттэй</span>
            <span>⚡ Шинэ бүлэг эрт</span>
            <span>🚫 Зар байхгүй</span>
          </div>
        </div>
      </div>
    </div>
  );
}
