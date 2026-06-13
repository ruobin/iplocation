"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "My IP" },
  { href: "/lookup", label: "Lookup" },
];

export function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mr-4 text-sm font-bold tracking-tight text-[var(--accent)]"
        >
          IP Lookup
        </Link>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive(href)
                ? "bg-[var(--accent-glow)] text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:bg-[var(--accent-glow)] hover:text-[var(--text)]"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
