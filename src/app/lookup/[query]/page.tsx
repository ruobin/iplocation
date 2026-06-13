import Link from "next/link";
import { getIPInfo, isPrivateIP, type IPInfo } from "@/lib/ip-info";
import { MapEmbed } from "@/app/map-embed";
import { SearchForm } from "../search-form";

function InfoCard({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent-glow)]">
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

export default async function LookupResultPage({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const { query } = await params;
  const decoded = decodeURIComponent(query);

  if (isPrivateIP(decoded)) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 mx-auto max-w-2xl">
          <SearchForm defaultValue={decoded} />
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
          <p className="font-medium">Private / local IP</p>
          <p className="mt-1 text-sm opacity-80">
            <code className="font-mono">{decoded}</code> is a private or loopback address — geolocation data is not available.
          </p>
        </div>
      </div>
    );
  }

  const ipInfo: IPInfo = await getIPInfo(decoded, null);
  const noData = ipInfo.city === "—" && ipInfo.country === "—";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Search bar */}
      <div className="mb-10 mx-auto max-w-2xl">
        <SearchForm defaultValue={decoded} />
      </div>

      {noData ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-800 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300">
          <p className="font-medium">No results found</p>
          <p className="mt-1 text-sm opacity-80">
            Could not resolve <code className="font-mono">{decoded}</code>. Check the address and try again.
          </p>
        </div>
      ) : (
        <>
          {/* IP highlight */}
          <div className="mb-10 rounded-2xl border border-[var(--accent)]/20 bg-[var(--surface)] p-8 text-center shadow-lg shadow-[var(--accent-glow)]">
            <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
              {decoded !== ipInfo.ip ? (
                <>
                  <span className="font-mono">{decoded}</span> resolved to
                </>
              ) : (
                "IP Address"
              )}
            </div>
            <div className="text-3xl font-bold font-mono tracking-tight text-[var(--accent)] sm:text-4xl">
              {ipInfo.ip}
            </div>
            {ipInfo.city !== "—" && (
              <div className="mt-2 text-sm text-[var(--text-muted)]">
                {[ipInfo.city, ipInfo.region, ipInfo.country].filter(v => v && v !== "—").join(", ")}
              </div>
            )}
          </div>

          {/* Location */}
          <section className="mb-10">
            <SectionHeader icon="📍" title="Location" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="City" value={ipInfo.city} />
              <InfoCard label="Region" value={ipInfo.region} />
              <InfoCard label="Country" value={ipInfo.country} />
              <InfoCard label="Country Code" value={ipInfo.countryCode} mono />
              <InfoCard
                label="Coordinates"
                value={ipInfo.lat !== null ? `${ipInfo.lat.toFixed(4)}, ${ipInfo.lon?.toFixed(4)}` : "—"}
                mono
              />
              <InfoCard label="Timezone" value={ipInfo.timezone} mono />
            </div>
            {ipInfo.lat !== null && ipInfo.lon !== null && (
              <MapEmbed lat={ipInfo.lat} lon={ipInfo.lon} />
            )}
          </section>

          {/* Network */}
          <section className="mb-10">
            <SectionHeader icon="🌐" title="Network" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="ISP" value={ipInfo.isp} />
              <InfoCard label="Organization" value={ipInfo.org} />
              <InfoCard label="IP Address" value={ipInfo.ip} mono />
              <InfoCard label="Proxy / VPN" value={ipInfo.isProxy ? "Detected" : "Not Detected"} />
              <InfoCard label="Hosting / DC" value={ipInfo.isHosting ? "Detected" : "Not Detected"} />
              <InfoCard label="Mobile" value={ipInfo.isMobile ? "Yes" : "No"} />
            </div>
          </section>
        </>
      )}

      <footer className="mt-8 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--text-muted)]">
        IP data via{" "}
        <a href="https://ip-api.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[var(--text)]">
          ip-api
        </a>
        {" · "}
        <Link href="/" className="underline underline-offset-2 hover:text-[var(--text)]">
          View your IP
        </Link>
      </footer>
    </div>
  );
}
