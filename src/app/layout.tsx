import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import { InstallPromptCapture } from "@/components/InstallPromptCapture";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: '#0F1724',
}

export const metadata: Metadata = {
  metadataBase: new URL("https://studiq.org"),
  title: {
    default: "StudiQ — AI Maths Tutor for A-Level | Get Your A*",
    template: "%s | StudiQ",
  },
  description: "SPOK knows exactly what you don't know — and fixes it. AI-powered A-level Maths tutoring with Bayesian Knowledge Tracing, voice chat, and past paper prediction. Free to start.",
  keywords: "A-level maths tutor, AI tutor, A-level revision, AQA maths, Edexcel maths, OCR maths, SPOK, StudiQ, Bayesian knowledge tracing, spaced repetition",
  openGraph: {
    title: "StudiQ — AI Maths Tutor for A-Level",
    description: "SPOK pinpoints exactly what you don't know and fixes it. Free to start.",
    type: "website",
    url: "https://studiq.org",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudiQ — AI Maths Tutor for A-Level",
    description: "SPOK pinpoints exactly what you don't know and fixes it.",
  },
  appleWebApp: {
    capable: true,
    title: 'StudiQ',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieConsent />
        <InstallPromptCapture />
      </body>
    </html>
  );
}
