import { headers } from "next/headers";
import { getIPInfo, parseUserAgent, isPrivateIP, type IPInfo } from "@/lib/ip-info";
import { ClientInfoSection } from "./client-info";
import { LookupBox } from "./lookup-box";
import { MapEmbed } from "./map-embed";

function getClientIP(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIP = headersList.get("x-real-ip");
  if (realIP) return realIP.trim();

  return "127.0.0.1";
}

function InfoCard({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent-glow)]">
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </div>
      <div
        className={`text-base leading-relaxed break-all text-[var(--text)] ${
          mono ? "font-mono text-sm" : ""
        }`}
      >
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

export default async function Home() {
  const headersList = await headers();
  const ip = getClientIP(headersList);
  const userAgent = headersList.get("user-agent");

  const ipInfo: IPInfo = await getIPInfo(ip, null);
  const browserInfo = parseUserAgent(userAgent);
  const isPrivate = isPrivateIP(ip);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl">
          IP Lookup
        </h1>
        <p className="text-base text-[var(--text-muted)]">
          Your connection details at a glance. Private. Ad-free.
        </p>
      </header>

      {/* IP Highlight */}
      <div className="mb-12 rounded-2xl border border-[var(--accent)]/20 bg-[var(--surface)] p-8 text-center shadow-lg shadow-[var(--accent-glow)]">
        <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
          Your Public IP Address
        </div>
        <div className="text-3xl font-bold font-mono tracking-tight text-[var(--accent)] sm:text-4xl">
          {ipInfo.ip}
        </div>
        {isPrivate && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Local network — full details visible when deployed
          </div>
        )}
        {ipInfo.city !== "—" && (
          <div className="mt-2 text-sm text-[var(--text-muted)]">
            {[ipInfo.city, ipInfo.region, ipInfo.country]
              .filter(Boolean)
              .join(", ")}
          </div>
        )}
      </div>

      {/* Lookup */}
      <LookupBox />

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
            value={
              ipInfo.lat !== null
                ? `${ipInfo.lat.toFixed(4)}, ${ipInfo.lon?.toFixed(4)}`
                : "—"
            }
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
        </div>
      </section>

      {/* Browser & OS — server-side */}
      <section className="mb-10">
        <SectionHeader icon="💻" title="Browser &amp; OS" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            label="Browser"
            value={
              browserInfo.browserVersion
                ? `${browserInfo.browser} ${browserInfo.browserVersion}`
                : browserInfo.browser
            }
          />
          <InfoCard
            label="Operating System"
            value={
              browserInfo.osVersion
                ? `${browserInfo.os} ${browserInfo.osVersion}`
                : browserInfo.os
            }
          />
          <InfoCard label="Platform" value={browserInfo.platform} />
        </div>
      </section>

      <ClientInfoSection ipInfo={ipInfo} />
    </div>
  );
}
