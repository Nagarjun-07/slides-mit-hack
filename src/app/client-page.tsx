'use client';

import { useState } from 'react';
import { generateImagesFromPrompts } from '@/ai/flows/generate-images-from-prompts';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SlideViewer from '@/components/slide-viewer';
import FlashFlowLogo from '@/components/flashflow-logo';
import { Loader2, Wand2 } from 'lucide-react';
import type { FlashcardData } from '@/lib/types';

// Function to split a long text into smaller chunks of a maximum length
const chunkText = (text: string, maxLength: number): string[] => {
    const sentences = text.match(/\b[^.!?]+[.!?]+/g) || [];
    if (sentences.length <= 1 && text.length < maxLength) {
        return [text];
    }
    
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = sentence;
        } else {
            currentChunk += sentence;
        }
    }
    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    // If no sentences were found, split by character length
    if (chunks.length === 0 && text.length > 0) {
        for (let i = 0; i < text.length; i += maxLength) {
            chunks.push(text.substring(i, i + maxLength));
        }
    }

    return chunks;
}

const processJson = (obj: any): string[] => {
    const prompts: string[] = [];
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (typeof value !== 'object' && value !== null) {
                prompts.push(`${key}: ${value}`);
            }
        }
    }
    return prompts;
};


export default function ClientPage() {
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [promptInput, setPromptInput] = useState('{\n    "name": "France",\n    "capital": "Paris",\n    "population": 67364357,\n    "area": 551695,\n    "currency": "Euro",\n    "languages": ["French"],\n    "region": "Europe",\n    "subregion": "Western Europe",\n    "flag": "https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg"\n}');
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setFlashcards([]);

    if (!promptInput.trim()) {
        toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please enter a prompt.' });
        setIsLoading(false);
        return;
    }
    
    let prompts: string[] = [];
    try {
        const parsed = JSON.parse(promptInput);
        if (Array.isArray(parsed)) {
            prompts = parsed.map(item => {
                if (typeof item === 'string') return item;
                if (typeof item === 'object' && item !== null && (item.question || item.prompt)) {
                    return item.question || item.prompt;
                }
                return JSON.stringify(item);
            });
        } else if (typeof parsed === 'object' && parsed !== null) {
            prompts = processJson(parsed);
        }
    } catch (error) {
        // Not a valid JSON, treat as multiline text
    }

    if (prompts.length === 0) {
        const lines = promptInput.split('\n').map(p => p.trim()).filter(p => p.length > 0);
        if(lines.length === 1 && lines[0].length > 250) {
            prompts = chunkText(lines[0], 250);
        } else {
            prompts = lines;
        }
    }
    
    if (prompts.length === 0) {
        toast({ variant: 'destructive', title: 'Invalid Input', description: 'No valid prompts found.' });
        setIsLoading(false);
        return;
    }

    try {
      const result = await generateImagesFromPrompts({ prompts });
      const newFlashcards: FlashcardData[] = prompts.map((prompt, index) => ({
        question: prompt,
        answer: '',
        visualizationDataUri: result.imageDataUris[index],
        reasoning: 'AI-generated image based on your prompt.',
      }));

      setFlashcards(newFlashcards);
      toast({ title: 'Success!', description: `Generated ${newFlashcards.length} slide(s).` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate the images. Please try again.' });
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
              <CardTitle>Create Your Slides</CardTitle>
              <CardDescription>Enter text prompts (one per line) or a JSON array below. Then click generate to create slides with AI-generated images. Long paragraphs will be split automatically.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Textarea
                  placeholder="Enter your prompts here..."
                  className="min-h-[100px] font-sans text-base"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  disabled={isLoading}
                />
                <Button onClick={handleGenerate} disabled={isLoading} className="w-full md:w-auto self-end">
                  {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                  <span>{isLoading ? 'Generating...' : 'Generate Slides'}</span>
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
