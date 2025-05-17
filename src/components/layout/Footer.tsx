
import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/50 py-6 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Rajiv Kumar Singh. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
