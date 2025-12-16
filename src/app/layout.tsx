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
  title: "SHADOWMODE.US - Tesla Robotaxi Tracker",
  description: "Track Tesla's Unsupervised FSD / Robotaxi deployment progress across US cities in real-time",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "SHADOWMODE.US - Tesla Robotaxi Tracker",
    description: "Track Tesla's Unsupervised FSD / Robotaxi deployment progress across US cities in real-time",
    url: "https://shadowmode.us",
    siteName: "SHADOWMODE",
    images: [
      {
        url: "/link-thumb.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHADOWMODE.US - Tesla Robotaxi Tracker",
    description: "Track Tesla's Unsupervised FSD / Robotaxi deployment progress across US cities in real-time",
    images: ["/link-thumb.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
