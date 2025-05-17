
import type { Metadata } from 'next';
import { Lora } from 'next/font/google';
// Import the font objects directly
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer'; // Added Footer import
import { cn } from '@/lib/utils';

// Lora is from next/font/google, so it IS a function to call
const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora', // This will create a CSS variable --font-lora
  display: 'swap',
});

// GeistSans and GeistMono (from geist/font/*) are objects that directly provide .variable
// Their .variable properties are class names that set up CSS variables like --font-geist-sans and --font-geist-mono.
// These CSS variables are then used by Tailwind's fontFamily configuration.

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
          GeistSans.variable, // Use the .variable property of the imported GeistSans object
          lora.variable,      // Use the .variable property of the 'lora' const (which came from Lora())
          GeistMono.variable, // Use the .variable property of the imported GeistMono object
          "font-sans",        // Apply Tailwind's default sans-serif (which uses var(--font-geist-sans) from tailwind.config.ts)
          "antialiased flex flex-col min-h-screen bg-background text-foreground"
        )}
      >
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer /> {/* Added Footer component */}
        <Toaster />
      </body>
    </html>
  );
}
