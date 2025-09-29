import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Indie_Flower } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const handwriting = Indie_Flower({
  variable: "--font-handwriting",
  weight: "400",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Reminiscence | Your Personal Memory Journal',
  description: 'Capture and preserve your memories with AI-generated illustrations',
  applicationName: 'Reminiscence',
  keywords: ['diary', 'journal', 'memories', 'AI', 'personal'],
  authors: [{ name: 'Reminiscence Team' }],
  icons: {
    icon: { url: '/logo.png', type: 'image/png' },
    shortcut: { url: '/logo.png', type: 'image/png' },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${handwriting.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
