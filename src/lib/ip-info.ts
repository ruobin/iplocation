export interface IPInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  isp: string;
  org: string;
  timezone: string;
  lat: number | null;
  lon: number | null;
  isProxy: boolean;
  isHosting: boolean;
  isMobile: boolean;
}

export interface BrowserInfo {
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  platform: string;
  language: string;
  languages: string[];
}

export interface DeviceInfo {
  screenWidth: string;
  screenHeight: string;
  colorDepth: string;
  pixelRatio: string;
  cpuCores: string;
  memoryGB: string;
  touchSupport: boolean;
  cookiesEnabled: boolean;
  doNotTrack: string | null;
}

export function isPrivateIP(ip: string): boolean {
  // IPv6 loopback / link-local
  if (ip === "::1" || ip.startsWith("fe80:")) return true;

  // IPv4 private ranges
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p))) return false;
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254)
  );
}

const EMPTY: IPInfo = {
  ip: "—",
  city: "—",
  region: "—",
  country: "—",
  countryCode: "—",
  isp: "—",
  org: "—",
  timezone: "—",
  lat: null,
  lon: null,
  isProxy: false,
  isHosting: false,
  isMobile: false,
};

async function fetchIpApi(ip: string): Promise<IPInfo | null> {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=66846719`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const d = await res.json();
    return {
      ip: d.query ?? ip,
      city: d.city ?? "—",
      region: d.regionName ?? "—",
      country: d.country ?? "—",
      countryCode: d.countryCode ?? "—",
      isp: d.isp ?? "—",
      org: d.org ?? "—",
      timezone: d.timezone ?? "—",
      lat: d.lat ?? null,
      lon: d.lon ?? null,
      isProxy: d.proxy ?? false,
      isHosting: d.hosting ?? false,
      isMobile: d.mobile ?? false,
    };
  } catch {
    return null;
  }
}

async function fetchIpInfo(ip: string): Promise<Partial<IPInfo> | null> {
  try {
    const token = process.env.IPINFO_TOKEN;
    const url = token
      ? `https://ipinfo.io/${ip}/json?token=${token}`
      : `https://ipinfo.io/${ip}/json`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const d = await res.json();

    const [lat, lon] = (d.loc ?? "").split(",").map(Number);
    return {
      ip: d.ip ?? ip,
      city: d.city ?? undefined,
      region: d.region ?? undefined,
      countryCode: d.country ?? undefined,
      org: d.org ?? undefined,
      timezone: d.timezone ?? undefined,
      lat: isNaN(lat) ? undefined : lat,
      lon: isNaN(lon) ? undefined : lon,
    };
  } catch {
    return null;
  }
}

function val(a: string | undefined, b: string | undefined): string {
  return (a && a !== "—") ? a : (b ?? "—");
}

export async function getIPInfo(
  ip: string,
  acceptLanguage: string | null
): Promise<IPInfo> {
  if (isPrivateIP(ip)) {
    return { ...EMPTY, ip };
  }

  const [ipApi, ipInfo] = await Promise.all([fetchIpApi(ip), fetchIpInfo(ip)]);

  if (!ipApi && !ipInfo) return { ...EMPTY, ip };

  // ipinfo.io is preferred for city/region/coords/timezone (more accurate);
  // ip-api.com is used for full country name, ISP, and proxy/hosting/mobile flags.
  return {
    ip: ipInfo?.ip ?? ipApi?.ip ?? ip,
    city: val(ipInfo?.city, ipApi?.city),
    region: val(ipInfo?.region, ipApi?.region),
    country: ipApi?.country ?? "—",
    countryCode: val(ipInfo?.countryCode, ipApi?.countryCode),
    isp: ipApi?.isp ?? "—",
    org: val(ipInfo?.org, ipApi?.org),
    timezone: val(ipInfo?.timezone, ipApi?.timezone),
    lat: ipInfo?.lat ?? ipApi?.lat ?? null,
    lon: ipInfo?.lon ?? ipApi?.lon ?? null,
    isProxy: ipApi?.isProxy ?? false,
    isHosting: ipApi?.isHosting ?? false,
    isMobile: ipApi?.isMobile ?? false,
  };
}

interface DetectionRule {
  name: string;
  test: (ua: string) => boolean;
  /** Static version, used when it can't be read from the UA string (e.g. Windows). */
  version?: string;
  /** Regex whose first capture group is the version; underscores are treated as dots. */
  versionPattern?: RegExp;
}

const OS_RULES: DetectionRule[] = [
  { name: "Windows", test: (ua) => ua.includes("Windows NT 10.0"), version: "10 / 11" },
  { name: "Windows", test: (ua) => ua.includes("Windows NT 6.3"), version: "8.1" },
  { name: "Windows", test: (ua) => ua.includes("Windows NT 6.1"), version: "7" },
  { name: "macOS", test: (ua) => ua.includes("Mac OS X"), versionPattern: /Mac OS X ([0-9_]+)/ },
  { name: "iOS", test: (ua) => ua.includes("iPhone"), versionPattern: /iPhone OS ([0-9_]+)/ },
  { name: "iPadOS", test: (ua) => ua.includes("iPad"), versionPattern: /CPU OS ([0-9_]+)/ },
  { name: "Android", test: (ua) => ua.includes("Android"), versionPattern: /Android ([0-9.]+)/ },
  { name: "Linux", test: (ua) => ua.includes("Linux") },
  { name: "ChromeOS", test: (ua) => ua.includes("CrOS") },
];

// Order matters: e.g. Edge/Opera/Brave also include "Chrome/", and Safari's
// UA also includes "Safari/" without "Version/" on Chrome-based browsers.
const BROWSER_RULES: DetectionRule[] = [
  { name: "Edge", test: (ua) => ua.includes("Edg/"), versionPattern: /Edg\/([0-9.]+)/ },
  {
    name: "Opera",
    test: (ua) => ua.includes("OPR/") || ua.includes("Opera/"),
    versionPattern: /OPR\/([0-9.]+)/,
  },
  { name: "Brave", test: (ua) => ua.includes("Brave/"), versionPattern: /Brave\/([0-9.]+)/ },
  { name: "Chrome", test: (ua) => ua.includes("Chrome/"), versionPattern: /Chrome\/([0-9.]+)/ },
  {
    name: "Safari",
    test: (ua) => ua.includes("Safari/") && ua.includes("Version/"),
    versionPattern: /Version\/([0-9.]+)/,
  },
  { name: "Firefox", test: (ua) => ua.includes("Firefox/"), versionPattern: /Firefox\/([0-9.]+)/ },
];

function detect(
  rules: DetectionRule[],
  ua: string,
  fallbackName: string
): { name: string; version: string } {
  const rule = rules.find((r) => r.test(ua));
  if (!rule) return { name: fallbackName, version: "" };

  if (rule.version !== undefined) return { name: rule.name, version: rule.version };

  const match = rule.versionPattern ? ua.match(rule.versionPattern) : null;
  const version = match ? match[1].replace(/_/g, ".") : "";
  return { name: rule.name, version };
}

function detectPlatform(ua: string): "Mobile" | "Tablet" | "Desktop" {
  if (ua.includes("Mobile")) return "Mobile";
  if (ua.includes("Tablet")) return "Tablet";
  return "Desktop";
}

export function parseUserAgent(userAgent: string | null): BrowserInfo {
  const ua = userAgent ?? "";

  const { name: os, version: osVersion } = detect(OS_RULES, ua, "Unknown");
  const { name: browser, version: browserVersion } = detect(BROWSER_RULES, ua, "Unknown");

  return {
    userAgent: ua,
    browser,
    browserVersion,
    os,
    osVersion,
    platform: detectPlatform(ua),
    language: "",
    languages: [],
  };
}