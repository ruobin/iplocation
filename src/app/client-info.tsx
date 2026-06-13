"use client";

import { useEffect, useState } from "react";
import type { IPInfo } from "@/lib/ip-info";

type Item = { label: string; value: string; warn?: boolean };

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

function Card({ label, value, warn }: Item) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent-glow)]">
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </div>
      <div className="text-base leading-relaxed break-all text-[var(--text)]">
        {warn ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {value}
          </span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

export function ClientInfoSection({ ipInfo }: { ipInfo: IPInfo }) {
  const [device, setDevice] = useState<Item[] | null>(null);
  const [privacy, setPrivacy] = useState<Item[] | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { effectiveType?: string; downlink?: number };
    };
    const scr = screen;

    setDevice([
      { label: "Screen Size", value: `${scr.width} × ${scr.height}` },
      { label: "Color Depth", value: `${scr.colorDepth}-bit` },
      {
        label: "Pixel Ratio",
        value: (window.devicePixelRatio || 1).toFixed(2),
      },
      { label: "CPU Cores", value: String(nav.hardwareConcurrency || "—") },
      {
        label: "Memory (GB)",
        value: nav.deviceMemory ? `${nav.deviceMemory} GB` : "—",
      },
      {
        label: "Touch Support",
        value:
          "ontouchstart" in window || nav.maxTouchPoints > 0 ? "Yes" : "No",
      },
      { label: "Language", value: nav.language || "—" },
      { label: "Cookies Enabled", value: nav.cookieEnabled ? "Yes" : "No" },
      {
        label: "Do Not Track",
        value:
          nav.doNotTrack === "1"
            ? "Enabled"
            : nav.doNotTrack === "0"
              ? "Disabled"
              : "Unset",
      },
    ]);

    setPrivacy([
      {
        label: "Proxy / VPN",
        value: ipInfo.isProxy ? "Detected" : "Not Detected",
        warn: ipInfo.isProxy,
      },
      {
        label: "Hosting / Data Center",
        value: ipInfo.isHosting ? "Detected" : "Not Detected",
        warn: ipInfo.isHosting,
      },
      { label: "Mobile Connection", value: ipInfo.isMobile ? "Yes" : "No" },
      {
        label: "Connection Type",
        value: nav.connection?.effectiveType
          ? nav.connection.effectiveType.toUpperCase()
          : "—",
      },
      {
        label: "Estimated Speed",
        value: nav.connection?.downlink
          ? `${nav.connection.downlink} Mbps`
          : "—",
      },
      { label: "User Agent", value: nav.userAgent || "—" },
    ]);
  }, [ipInfo.isProxy, ipInfo.isHosting, ipInfo.isMobile]);

  return (
    <>
      <section className="mb-10">
        <SectionHeader icon="📱" title="Device Details" />
        {device === null ? (
          <noscript>
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm text-[var(--text-muted)]">
                Enable JavaScript to see device details (screen size, memory,
                cores, etc.).
              </p>
            </div>
          </noscript>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {device.map((i) => (
              <Card key={i.label} {...i} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <SectionHeader icon="🛡" title="Privacy & Security" />
        {privacy === null ? (
          <noscript>
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm text-[var(--text-muted)]">
                Enable JavaScript for proxy/VPN detection and privacy details.
              </p>
            </div>
          </noscript>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {privacy.map((i) => (
              <Card key={i.label} {...i} />
            ))}
          </div>
        )}
      </section>

      <footer className="mt-16 border-t border-[var(--border)] pt-8 text-center">
        <p className="text-xs text-[var(--text-muted)]">
          IP data via{" "}
          <a href="https://ipinfo.io/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[var(--text)]">ipinfo.io</a>
          {" and "}
          <a href="https://ip-api.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[var(--text)]">ip-api.com</a>
          . No tracking. No ads. No logs stored.
        </p>
      </footer>
    </>
  );
}
