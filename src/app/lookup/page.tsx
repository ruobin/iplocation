import Link from "next/link";
import { SearchForm } from "./search-form";

export default function LookupPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl">
          IP / Domain Lookup
        </h1>
        <p className="text-base text-[var(--text-muted)]">
          Enter any IPv4, IPv6, or domain name to see its location, ISP, and network details.
        </p>
      </header>

      <div className="mx-auto max-w-2xl">
        <SearchForm />
        <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
          Looking for{" "}
          <Link href="/" className="underline underline-offset-2 hover:text-[var(--text)]">
            your own IP
          </Link>
          ?
        </p>
      </div>
    </div>
  );
}
