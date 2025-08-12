import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Raffle Winner Spinner - Professional Live Raffle Management",
  description: "Turn your live raffles into unforgettable experiences with our professional Chrome extension. Fair, transparent, and exciting raffle draws for events and competitions.",
  keywords: "raffle, lottery, spinner, chrome extension, live draw, competition, giveaway",
  authors: [{ name: "Raffle Winner Spinner Team" }],
  openGraph: {
    title: "Raffle Winner Spinner",
    description: "Professional raffle management Chrome extension for live events",
    type: "website",
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
        className={`${inter.variable} font-sans antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
