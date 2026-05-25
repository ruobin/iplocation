function SkeletonCard() {
  return (
    <div className="h-20 rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
  );
}

function SkeletonSection() {
  return (
    <section className="mb-10">
      <div className="mb-4 h-8 w-36 rounded-lg bg-[var(--border)]" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <div className="mx-auto mb-3 h-12 w-64 rounded-lg bg-[var(--border)]" />
        <div className="mx-auto h-4 w-80 rounded bg-[var(--border)]" />
      </header>

      <div className="mb-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <div className="mx-auto mb-2 h-3 w-40 rounded bg-[var(--border)]" />
        <div className="mx-auto h-10 w-48 rounded-lg bg-[var(--border)]" />
      </div>

      <SkeletonSection />
      <SkeletonSection />
      <SkeletonSection />
    </div>
  );
}
