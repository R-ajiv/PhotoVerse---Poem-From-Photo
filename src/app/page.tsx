"use client";

import { useState, useCallback, ChangeEvent } from "react";
import NextImage from "next/image";
import { generatePoem } from "@/ai/flows/generate-poem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, Save, AlertCircle, Download, Trash2, Image as ImageIcon } from "lucide-react";
import type { SavedPoem } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function PhotoVersePage() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [generatedPoem, setGeneratedPoem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [savedPoems, setSavedPoems] = useLocalStorage<SavedPoem[]>("savedPoems", []);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setGeneratedPoem(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB. Please choose a smaller image.`);
        setPhotoFile(null);
        setPhotoPreview(null);
        event.target.value = ""; // Reset file input
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP).");
        setPhotoFile(null);
        setPhotoPreview(null);
        event.target.value = ""; // Reset file input
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  }, []);

  const handleGeneratePoem = useCallback(async () => {
    if (!photoPreview) {
      setError("Please upload a photo first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedPoem(null);

    try {
      const result = await generatePoem({ photoDataUri: photoPreview });
      setGeneratedPoem(result.poem);
    } catch (e: any) {
      console.error("Poem generation failed:", e);
      setError(e.message || "Failed to generate poem. Please try again.");
      toast({
        title: "Error",
        description: "Poem generation failed.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [photoPreview, toast]);

  const handleSavePoem = useCallback(() => {
    if (!photoPreview || !generatedPoem) {
      toast({
        title: "Cannot Save",
        description: "No photo or poem to save.",
        variant: "destructive",
      });
      return;
    }
    const newPoem: SavedPoem = {
      id: crypto.randomUUID(),
      imageDataUrl: photoPreview,
      poemText: generatedPoem,
      createdAt: new Date().toISOString(),
    };
    setSavedPoems(prevPoems => [newPoem, ...prevPoems]);
    toast({
      title: "Poem Saved!",
      description: "Your poem has been saved to your collection.",
    });
  }, [photoPreview, generatedPoem, setSavedPoems, toast]);
  
  const handleDownloadPoem = () => {
    if (!generatedPoem || !photoFile) return;

    const element = document.createElement("a");
    const fileContent = `Image: ${photoFile.name}\n\n${generatedPoem}`;
    const file = new Blob([fileContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${photoFile.name.split('.')[0]}_poem.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({ title: "Poem Downloaded", description: "Check your downloads folder." });
  };

  const handleClear = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setGeneratedPoem(null);
    setError(null);
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UploadCloud className="h-6 w-6 text-primary" />
              Upload Your Photo
            </CardTitle>
            <CardDescription>
              Choose an image file (JPEG, PNG, GIF, WEBP, max {MAX_FILE_SIZE_MB}MB) to inspire a poem.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="photo-upload" className="sr-only">Upload Photo</Label>
              <Input
                id="photo-upload"
                type="file"
                accept="image/jpeg, image/png, image/gif, image/webp"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                aria-describedby="error-message"
              />
            </div>
            {photoPreview && (
              <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                <NextImage
                  src={photoPreview}
                  alt="Uploaded photo preview"
                  layout="fill"
                  objectFit="contain"
                  data-ai-hint="uploaded photo"
                />
              </div>
            )}
            {error && (
              <p id="error-message" className="text-sm text-destructive flex items-center gap-1 mt-2">
                <AlertCircle className="h-4 w-4" /> {error}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
             <Button onClick={handleClear} variant="outline" disabled={!photoFile && !photoPreview} className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
            <Button onClick={handleGeneratePoem} disabled={!photoFile || isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="mr-2 h-4 w-4" />
              )}
              Generate Poem
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg transition-all duration-300 hover:shadow-xl sticky top-20">
          <CardHeader>
            <CardTitle className="text-2xl">Generated Poem</CardTitle>
            <CardDescription>
              {generatedPoem ? "Here's the poem inspired by your photo." : "Your generated poem will appear here."}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">Generating your masterpiece...</p>
                <p className="text-sm">This might take a moment.</p>
              </div>
            )}
            {!isLoading && generatedPoem && (
              <div className="space-y-4">
                <pre className="whitespace-pre-wrap break-words font-serif text-foreground text-base leading-relaxed p-4 bg-background rounded-md border max-h-[400px] overflow-y-auto">
                  {generatedPoem}
                </pre>
              </div>
            )}
            {!isLoading && !generatedPoem && !error && !photoPreview && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6 rounded-lg border border-dashed">
                    <ImageIcon className="h-16 w-16 mb-4" />
                    <p className="text-lg font-medium">Waiting for Inspiration</p>
                    <p className="text-sm">Upload a photo and click "Generate Poem" to see the magic happen!</p>
                </div>
            )}
             {!isLoading && !generatedPoem && !error && photoPreview && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6 rounded-lg border border-dashed">
                    <ImageIcon className="h-16 w-16 mb-4 text-primary" />
                    <p className="text-lg font-medium">Ready to Generate!</p>
                    <p className="text-sm">Click the "Generate Poem" button to create a poem from your uploaded image.</p>
                </div>
            )}
          </CardContent>
          {generatedPoem && !isLoading && (
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
              <Button onClick={handleDownloadPoem} variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button onClick={handleSavePoem} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" /> Save Poem
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
