"use client";

import { useState, useRef } from "react";
import type { IPInfo } from "@/lib/ip-info";

function InfoCard({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent-glow)]">
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </div>
      <div className={`text-base leading-relaxed break-all text-[var(--text)] ${mono ? "font-mono text-sm" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <h2 className="flex items-center gap-2.5 text-lg font-semibold text-[var(--text)] tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-base">
        {icon}
      </span>
      {title}
    </h2>
  );
}

export function LookupBox() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<IPInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleLookup() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lookup failed");
      } else {
        setResult(data as IPInfo);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleLookup();
  }

  return (
    <section className="mb-10">
      <SectionHeader icon="🔍" title="IP / Domain Lookup" />
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Enter any IPv4, IPv6 address, or domain name to look up its location and network info.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 8.8.8.8 or google.com"
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
          disabled={loading}
        />
        <button
          onClick={handleLookup}
          disabled={loading || !query.trim()}
          className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Looking up…" : "Lookup"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <div className="mb-4 rounded-2xl border border-[var(--accent)]/20 bg-[var(--surface)] p-6 text-center shadow-lg shadow-[var(--accent-glow)]">
            <div className="mb-1 text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
              Queried IP
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-[var(--accent)]">
              {result.ip}
            </div>
            {result.city !== "—" && (
              <div className="mt-1.5 text-sm text-[var(--text-muted)]">
                {[result.city, result.region, result.country].filter(Boolean).join(", ")}
              </div>
            )}
          </div>

          <div className="mb-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Location</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="City" value={result.city} />
              <InfoCard label="Region" value={result.region} />
              <InfoCard label="Country" value={result.country} />
              <InfoCard label="Country Code" value={result.countryCode} mono />
              <InfoCard
                label="Coordinates"
                value={result.lat !== null ? `${result.lat.toFixed(4)}, ${result.lon?.toFixed(4)}` : "—"}
                mono
              />
              <InfoCard label="Timezone" value={result.timezone} mono />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Network</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="ISP" value={result.isp} />
              <InfoCard label="Organization" value={result.org} />
              <InfoCard label="Proxy / VPN" value={result.isProxy ? "Detected" : "Not Detected"} />
              <InfoCard label="Hosting / DC" value={result.isHosting ? "Detected" : "Not Detected"} />
              <InfoCard label="Mobile" value={result.isMobile ? "Yes" : "No"} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
