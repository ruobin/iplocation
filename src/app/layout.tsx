import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "./nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IP Lookup — Your IP Address Details",
  description:
    "View your IP address, location, browser, ISP, and device information. Clean, private, ad-free.",
  openGraph: {
    title: "IP Lookup — Your IP Address Details",
    description:
      "View your IP address, location, browser, ISP, and device information. Clean, private, ad-free.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "IP Lookup — Your IP Address Details",
    description:
      "View your IP address, location, browser, ISP, and device information. Clean, private, ad-free.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full font-sans">
        <Nav />
        {children}
      </body>
    </html>
  );
}
