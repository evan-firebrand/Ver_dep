import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { Nav } from '@/components/Nav';

import './globals.css';

// Using local font files avoids network requests to Google Fonts at build time.
// The woff2 files are the same Geist typeface bundled with Next.js itself.
const geistSans = localFont({
  src: '../../public/fonts/geist-latin.woff2',
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = localFont({
  src: '../../public/fonts/geist-mono-latin.woff2',
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NOLA Music Tracker',
    template: '%s | NOLA Music Tracker',
  },
  description:
    'Live music, festivals, second lines, and events happening in New Orleans.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-900 text-zinc-100">
        <Nav />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
