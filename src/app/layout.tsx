import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { CONTACT_EMAIL, REPO_URL, REPO_ISSUES_URL } from "@/lib/contact";
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

// NOTE: every field below is verifiable. `address` is deliberately absent
// rather than filled with a plausible one — a fabricated postal address in
// structured data is exactly the signal this markup exists to establish.
// Add it (and CONTACT_EMAIL in src/lib/contact.ts) when there is a real one.
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://shadowmode.us/#organization",
  "name": "SHADOWMODE",
  "url": "https://shadowmode.us",
  "logo": "https://shadowmode.us/shadowmode-logo.svg",
  "description": "Sourced intelligence on Tesla's physical layer: robotaxi deployment, energy storage, and the Semi contract ledger.",
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "technical support",
      "url": REPO_ISSUES_URL,
      "availableLanguage": "English",
      ...(CONTACT_EMAIL ? { email: CONTACT_EMAIL } : {}),
    },
    {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": "https://shadowmode.us/contact",
      "availableLanguage": "English",
      ...(CONTACT_EMAIL ? { email: CONTACT_EMAIL } : {}),
    },
  ],
  "sameAs": [REPO_URL],
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
    "@id": "https://shadowmode.us/#organization"
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="alternate" type="text/markdown" href="https://shadowmode.us/md" />
        <link rel="alternate" type="application/json" href="https://shadowmode.us/openapi.json" title="OpenAPI specification" />
      </head>
      <body className={`${ibmPlexMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
