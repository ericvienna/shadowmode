import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SHADOWMODE | Tesla Digital Energy Terminal",
  description: "Sourced intelligence on Tesla's physical layer: Robotaxi deployment, Energy storage (GWh, Megapack deals), and Semi contract ledger. Falsifiable scoreboards for the power-is-the-bottleneck thesis.",
  keywords: "Tesla Robotaxi, Tesla Energy, Megapack, Tesla Semi, digital energy, autonomous vehicles, energy storage, grid storage, Tesla FSD, shadowmode",
  icons: {
    icon: "/icon.png?v=2",
    apple: "/apple-icon.png?v=2",
  },
  openGraph: {
    title: "SHADOWMODE | Tesla Digital Energy Terminal",
    description: "Robotaxi milestones, Energy storage scoreboard, Semi contract ledger — sourced, falsifiable intelligence on Tesla's physical layer.",
    url: "https://shadowmode.us",
    siteName: "SHADOWMODE",
    images: [
      {
        url: "https://shadowmode.us/link-thumb.png?v=2",
        width: 1200,
        height: 630,
        alt: "SHADOWMODE - Tesla Robotaxi Deployment Tracker Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHADOWMODE | Tesla Digital Energy Terminal",
    description: "Robotaxi, Energy storage, Semi — sourced scoreboards for the digital energy thesis.",
    images: ["https://shadowmode.us/link-thumb.png?v=2"],
    creator: "@shadowabordeaux",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://shadowmode.us",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SHADOWMODE",
  "description": "Real-time Tesla Robotaxi deployment tracker covering permits, approvals, and milestones across US cities",
  "url": "https://shadowmode.us",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "creator": {
    "@type": "Organization",
    "name": "SHADOWMODE"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${ibmPlexMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
