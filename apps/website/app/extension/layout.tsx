import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DrawDay Extension',
  description: 'DrawDay Chrome Extension Interface',
  robots: 'noindex, nofollow',
  // Security headers handled by middleware.ts for proper CSP and framing control
};

export default function ExtensionLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="h-full bg-background text-foreground antialiased">
        <div className="h-full w-full">{children}</div>
      </body>
    </html>
  );
}
