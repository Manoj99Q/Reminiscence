import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: 'Chrysalis | Transform Your Memories',
  description: 'A personal diary that transforms your written memories into beautiful visual experiences.',
  icons: {
    icon: [
      {
        url: '/chrysalis.svg',
        type: 'image/svg+xml',
      },
    ],
  },
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
