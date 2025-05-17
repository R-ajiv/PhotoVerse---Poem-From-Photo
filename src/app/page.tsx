
"use client";

import { useState, useCallback, ChangeEvent, DragEvent, useRef } from "react";
import NextImage from "next/image";
import { generatePoem } from "@/ai/flows/generate-poem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, Save, AlertCircle, Download, Trash2, Image as ImageIcon, Sparkles, FileImage } from "lucide-react";
import type { SavedPoem } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File | undefined | null) => {
    setError(null);
    setGeneratedPoem(null);

    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB. Please choose a smaller image.`);
        setPhotoFile(null);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP).");
        setPhotoFile(null);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
  }, [processFile]);

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // Optional: add visual feedback for drag over
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processFile(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  };
  
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
        title: "Error Generating Poem",
        description: e.message || "An unexpected error occurred. Please try again.",
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
    setSavedPoems(prevPoems => [newPoem, ...prevPoems].slice(0, 50)); // Limit to 50 saved poems
    toast({
      title: "Poem Saved!",
      description: "Your masterpiece is now in your collection.",
      className: "bg-green-600 border-green-600 text-white",
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        <Card className="shadow-xl transition-all duration-300 hover:shadow-glow-card-hover flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <FileImage className="h-7 w-7 text-primary" />
              Upload Your Image
            </CardTitle>
            <CardDescription>
              Drag & drop an image or click to select (JPEG, PNG, GIF, WEBP, max {MAX_FILE_SIZE_MB}MB).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col space-y-6">
            {!photoPreview && (
              <div
                className={`flex-grow flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                  ${isDragging ? 'border-primary bg-primary/10' : 'border-primary/30 hover:border-primary bg-card'}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className={`h-16 w-16 mb-4 ${isDragging ? 'text-primary' : 'text-primary/70'}`} />
                <p className={`text-lg font-semibold ${isDragging ? 'text-primary' : 'text-foreground'}`}>
                  {isDragging ? "Drop your image here!" : "Drag & drop or click to upload"}
                </p>
                <p className="text-sm text-muted-foreground">Let your image inspire poetry.</p>
                <Input
                  ref={fileInputRef}
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-describedby="error-message file-type-description"
                />
              </div>
            )}
            
            {photoPreview && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-primary/50 shadow-md bg-muted">
                <NextImage
                  src={photoPreview}
                  alt="Uploaded photo preview"
                  layout="fill"
                  objectFit="contain"
                  className="transition-opacity duration-300 opacity-0 data-[loaded=true]:opacity-100"
                  data-loaded={!!photoPreview}
                  data-ai-hint="uploaded photo"
                />
              </div>
            )}

            {error && (
              <div id="error-message" className="flex items-center gap-2 text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/30">
                <AlertCircle className="h-5 w-5" /> 
                <span className="font-medium">{error}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row md:flex-col lg:flex-row justify-between items-center gap-3 pt-6 mt-auto">
             <Button onClick={handleClear} variant="outline" disabled={!photoFile && !photoPreview} className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" /> Clear Image
            </Button>
            <Button 
              onClick={handleGeneratePoem} 
              disabled={!photoFile || isLoading} 
              className="w-full sm:w-auto"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Generate Poem
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-xl transition-all duration-300 hover:shadow-glow-card-hover flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <Sparkles className="h-7 w-7 text-accent" />
              AI-Generated Poem
            </CardTitle>
            <CardDescription>
              {generatedPoem ? "Behold, the verses inspired by your image." : "Your unique poem will magically appear here."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3 p-6 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-xl font-semibold">Crafting your masterpiece...</p>
                <p className="text-sm">The muse is at work, this might take a moment.</p>
              </div>
            )}
            {!isLoading && generatedPoem && (
              <ScrollArea className="h-[300px] sm:h-[350px] md:h-auto md:max-h-[450px] w-full rounded-md border bg-background/30 p-1">
                 <pre className="whitespace-pre-wrap break-words font-serif text-foreground text-base leading-relaxed p-4">
                  {generatedPoem}
                </pre>
              </ScrollArea>
            )}
            {!isLoading && !generatedPoem && !error && !photoPreview && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6 rounded-lg border border-dashed border-muted-foreground/30 bg-card space-y-3">
                    <ImageIcon className="h-20 w-20 mb-2 text-muted-foreground/70" />
                    <p className="text-xl font-semibold">Awaiting Inspiration</p>
                    <p className="text-sm max-w-xs">Upload an image, and watch this space transform with poetry!</p>
                </div>
            )}
             {!isLoading && !generatedPoem && !error && photoPreview && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6 rounded-lg border border-dashed border-primary/50 bg-primary/5 space-y-3">
                    <Sparkles className="h-20 w-20 mb-2 text-primary/80" />
                    <p className="text-xl font-semibold text-primary">Ready to Weave Words!</p>
                    <p className="text-sm max-w-xs">Click "Generate Poem" and let the AI craft a unique verse for your image.</p>
                </div>
            )}
          </CardContent>
          {generatedPoem && !isLoading && (
            <CardFooter className="flex flex-col sm:flex-row md:flex-col lg:flex-row justify-end gap-3 pt-6 mt-auto">
              <Button onClick={handleDownloadPoem} variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button onClick={handleSavePoem} className="w-full sm:w-auto" variant="default">
                <Save className="mr-2 h-4 w-4" /> Save Poem
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

    