"use client";

import NextImage from "next/image";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { SavedPoem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Download, CalendarDays, BookOpenText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function SavedPoemsPage() {
  const [savedPoems, setSavedPoems] = useLocalStorage<SavedPoem[]>("savedPoems", []);
  const { toast } = useToast();

  const handleDeletePoem = (id: string) => {
    setSavedPoems(prevPoems => prevPoems.filter(poem => poem.id !== id));
    toast({
      title: "Poem Deleted",
      description: "The poem has been removed from your collection.",
    });
  };
  
  const handleDownloadPoem = (poem: SavedPoem) => {
    const element = document.createElement("a");
    // Extracting a filename part from data URL is tricky, so using a generic name or poem's first line
    const poemTitle = poem.poemText.substring(0, 30).replace(/\s+/g, '_') || "poem";
    const fileContent = `Poem generated on: ${new Date(poem.createdAt).toLocaleDateString()}\n\n${poem.poemText}`;
    const file = new Blob([fileContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${poemTitle}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({ title: "Poem Downloaded", description: "Check your downloads folder." });
  };

  if (savedPoems.length === 0) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <BookOpenText className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-semibold mb-2">No Saved Poems Yet</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          It looks like your collection is empty. Go ahead and create some beautiful poems from your photos!
        </p>
        <Button asChild>
          <Link href="/">Create a Poem</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Your Saved Poems</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A collection of verses inspired by your moments.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedPoems.map((poem) => (
          <Card key={poem.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="relative aspect-video w-full overflow-hidden rounded-t-md bg-muted">
                <NextImage
                  src={poem.imageDataUrl}
                  alt="Saved photo"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="saved photo"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardTitle className="text-xl mb-2 truncate" title={poem.poemText.substring(0,50) + "..."}>
                Poem Snippet
              </CardTitle>
              <pre className="whitespace-pre-wrap break-words font-serif text-sm text-foreground leading-relaxed p-3 bg-background rounded-md border max-h-[150px] overflow-y-auto">
                {poem.poemText}
              </pre>
              <p className="text-xs text-muted-foreground mt-3 flex items-center">
                <CalendarDays className="h-3 w-3 mr-1.5" />
                Saved on: {new Date(poem.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" size="sm" onClick={() => handleDownloadPoem(poem)} aria-label="Download poem">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeletePoem(poem.id)} aria-label="Delete poem">
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
