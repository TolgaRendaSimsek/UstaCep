import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { AppShell } from '@/components/layout/app-shell';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'UstaCep - Mobil İş ve Müşteri Takip',
  description: 'Ustalar, tamirciler ve teknik servisler için mobil iş, müşteri ve alacak takip uygulaması.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'UstaCep',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full bg-slate-950 text-slate-100 antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <QueryProvider>
          <InstallPrompt />
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
