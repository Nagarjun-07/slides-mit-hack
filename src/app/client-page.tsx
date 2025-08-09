'use client';

import { useState } from 'react';
import { generateImageFromPrompt } from '@/ai/flows/generate-image-from-prompt';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SlideViewer from '@/components/slide-viewer';
import FlashFlowLogo from '@/components/flashflow-logo';
import { Loader2, Wand2 } from 'lucide-react';
import type { FlashcardData } from '@/lib/types';

export default function ClientPage() {
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [promptInput, setPromptInput] = useState('A majestic dragon soaring over a mystical forest at dawn.');
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setFlashcards([]);

    if (!promptInput.trim()) {
        toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please enter a prompt.' });
        setIsLoading(false);
        return;
    }
    
    try {
      const result = await generateImageFromPrompt({ prompt: promptInput });
      const newFlashcard: FlashcardData = {
        question: promptInput,
        answer: '',
        visualizationDataUri: result.imageDataUri,
        reasoning: 'AI-generated image based on your prompt.',
      };
      setFlashcards([newFlashcard]);
      toast({ title: 'Success!', description: 'Your slide is ready.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate the image. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b">
        <div className="container mx-auto flex items-center gap-4">
          <FlashFlowLogo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">FlashFlow</h1>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="grid gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Create Your Slide</CardTitle>
              <CardDescription>Enter a text prompt below, then click generate to create your slide with an AI-generated image.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Textarea
                  placeholder="Enter your prompt here..."
                  className="min-h-[100px] font-sans text-base"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  disabled={isLoading}
                />
                <Button onClick={handleGenerate} disabled={isLoading} className="w-full md:w-auto self-end">
                  {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                  <span>{isLoading ? 'Generating...' : 'Generate Slide'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {(isLoading || flashcards.length > 0) && <Separator />}

          {isLoading && (
             <div className="flex justify-center items-center p-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
          )}

          {flashcards.length > 0 && !isLoading && (
            <SlideViewer flashcards={flashcards} />
          )}
        </div>
      </main>
      <footer className="p-4 border-t mt-8">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
              Built with Firebase Studio.
          </div>
      </footer>
    </div>
  );
}
