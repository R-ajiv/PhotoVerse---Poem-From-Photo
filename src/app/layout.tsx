
import type { Metadata } from 'next';
import { Lora } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import { cn } from '@/lib/utils';

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

const geistSans = GeistSans({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = GeistMono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PhotoVerse - AI Poems from Your Photos',
  description: 'Transform your photos into unique, AI-generated poems. Upload an image and let creativity flow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body 
        className={cn(
          geistSans.variable, 
          lora.variable, 
          geistMono.variable, 
          "font-sans antialiased flex flex-col min-h-screen bg-background text-foreground"
        )}
      >
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
