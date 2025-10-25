import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Indie_Flower } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
  title: 'Reminiscence | Your Personal Memory Diary',
  description: 'Capture and preserve your memories with AI-generated illustrations',
  applicationName: 'Reminiscence',
  keywords: ['diary', 'memories', 'AI', 'personal', 'entries'],
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
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
