import Link from 'next/link';
import { BookOpenText, Camera } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Camera className="h-7 w-7 text-primary" />
          <span className="text-2xl font-semibold text-primary">
            PhotoVerse
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link 
            href="/saved-poems" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            aria-label="View saved poems"
          >
            <BookOpenText className="h-5 w-5" />
            Saved Poems
          </Link>
        </nav>
      </div>
    </header>
  );
}
