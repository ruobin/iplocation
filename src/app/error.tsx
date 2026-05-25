"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--text)]">
          Something went wrong
        </h2>
        <p className="mb-6 text-[var(--text-muted)]">
          Could not load IP information. Please try again.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
