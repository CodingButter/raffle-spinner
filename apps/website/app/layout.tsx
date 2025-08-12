import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://drawday.app'),
  title: 'DrawDay Spinner - Professional Live Draw Management',
  description:
    'Turn your live draws into unforgettable experiences with DrawDay Spinner. The professional Chrome extension for fair, transparent, and exciting competition draws.',
  keywords: 'drawday, raffle, lottery, spinner, chrome extension, live draw, competition, giveaway, UK competitions',
  authors: [{ name: 'DrawDay Team' }],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'DrawDay Spinner',
    description: 'Professional live draw Chrome extension for UK competitions',
    type: 'website',
    images: [
      {
        url: '/logo.svg',
        width: 512,
        height: 512,
        alt: 'DrawDay Logo',
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
