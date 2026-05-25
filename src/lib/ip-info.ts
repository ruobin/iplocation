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

export async function getIPInfo(
  ip: string,
  acceptLanguage: string | null
): Promise<IPInfo> {
  if (isPrivateIP(ip)) {
    return {
      ip,
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
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=66846719`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`ip-api returned ${res.status}`);
    const data = await res.json();

    return {
      ip: data.query ?? ip,
      city: data.city ?? "—",
      region: data.regionName ?? "—",
      country: data.country ?? "—",
      countryCode: data.countryCode ?? "—",
      isp: data.isp ?? "—",
      org: data.org ?? "—",
      timezone: data.timezone ?? "—",
      lat: data.lat ?? null,
      lon: data.lon ?? null,
      isProxy: data.proxy ?? false,
      isHosting: data.hosting ?? false,
      isMobile: data.mobile ?? false,
    };
  } catch {
    return {
      ip,
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
  }
}

export function parseUserAgent(userAgent: string | null): BrowserInfo {
  const ua = userAgent ?? "";

  let browser = "Unknown";
  let browserVersion = "";
  let os = "Unknown";
  let osVersion = "";

  // OS detection
  if (ua.includes("Windows NT 10.0")) {
    os = "Windows";
    osVersion = "10 / 11";
  } else if (ua.includes("Windows NT 6.3")) {
    os = "Windows";
    osVersion = "8.1";
  } else if (ua.includes("Windows NT 6.1")) {
    os = "Windows";
    osVersion = "7";
  } else if (ua.includes("Mac OS X")) {
    os = "macOS";
    const m = ua.match(/Mac OS X ([0-9_]+)/);
    osVersion = m ? m[1].replace(/_/g, ".") : "";
  } else if (ua.includes("iPhone")) {
    os = "iOS";
    const m = ua.match(/iPhone OS ([0-9_]+)/);
    osVersion = m ? m[1].replace(/_/g, ".") : "";
  } else if (ua.includes("iPad")) {
    os = "iPadOS";
    const m = ua.match(/CPU OS ([0-9_]+)/);
    osVersion = m ? m[1].replace(/_/g, ".") : "";
  } else if (ua.includes("Android")) {
    os = "Android";
    const m = ua.match(/Android ([0-9.]+)/);
    osVersion = m ? m[1] : "";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  } else if (ua.includes("CrOS")) {
    os = "ChromeOS";
  }

  // Browser detection
  if (ua.includes("Edg/")) {
    browser = "Edge";
    const m = ua.match(/Edg\/([0-9.]+)/);
    browserVersion = m ? m[1] : "";
  } else if (ua.includes("OPR/") || ua.includes("Opera/")) {
    browser = "Opera";
    const m = ua.match(/OPR\/([0-9.]+)/);
    browserVersion = m ? m[1] : "";
  } else if (ua.includes("Brave/")) {
    browser = "Brave";
    const m = ua.match(/Brave\/([0-9.]+)/);
    browserVersion = m ? m[1] : "";
  } else if (ua.includes("Chrome/")) {
    browser = "Chrome";
    const m = ua.match(/Chrome\/([0-9.]+)/);
    browserVersion = m ? m[1] : "";
  } else if (ua.includes("Safari/") && ua.includes("Version/")) {
    browser = "Safari";
    const m = ua.match(/Version\/([0-9.]+)/);
    browserVersion = m ? m[1] : "";
  } else if (ua.includes("Firefox/")) {
    browser = "Firefox";
    const m = ua.match(/Firefox\/([0-9.]+)/);
    browserVersion = m ? m[1] : "";
  }

  return {
    userAgent: ua,
    browser,
    browserVersion,
    os,
    osVersion,
    platform: ua.includes("Mobile") ? "Mobile" : ua.includes("Tablet") ? "Tablet" : "Desktop",
    language: "",
    languages: [],
  };
}