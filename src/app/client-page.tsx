'use client';

import { useState } from 'react';
import { generateVisualizations } from '@/ai/flows/generate-visualizations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SlideViewer from '@/components/slide-viewer';
import FlashFlowLogo from '@/components/flashflow-logo';
import { Loader2, Wand2 } from 'lucide-react';
import type { FlashcardData } from '@/lib/types';

const sampleJson = JSON.stringify(
  [
    {
      "question": "What are the three main states of matter?",
      "answer": "Solid, Liquid, and Gas. Plasma is often considered the fourth state."
    },
    {
      "question": "Describe the water cycle.",
      "answer": "The water cycle involves evaporation (water turns into vapor), condensation (vapor forms clouds), precipitation (water falls back to Earth), and collection (water gathers in bodies of water)."
    },
    {
      "question": "What is the powerhouse of the cell?",
      "answer": "The mitochondrion is known as the powerhouse of the cell because it generates most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy."
    }
  ],
  null,
  2
);

export default function ClientPage() {
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [jsonInput, setJsonInput] = useState(sampleJson);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setFlashcards([]);
    let parsedJson;

    try {
      parsedJson = JSON.parse(jsonInput);
      if (!Array.isArray(parsedJson) || parsedJson.length === 0 || !parsedJson.every(item => typeof item.question === 'string' && typeof item.answer === 'string')) {
        throw new Error('Invalid flashcard format. Must be an array of objects with "question" and "answer" keys.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Please provide valid JSON.';
      toast({ variant: 'destructive', title: 'Invalid JSON', description: errorMessage });
      setIsLoading(false);
      return;
    }

    try {
      const flashcardPromises = parsedJson.map(async (card: { question: string; answer: string }) => {
        const cardJsonString = JSON.stringify(card);
        const vizData = await generateVisualizations({ flashcardData: cardJsonString });
        return {
          ...card,
          visualizationDataUri: vizData.visualizationDataUri,
          reasoning: vizData.reasoning,
        };
      });

      const newFlashcards = await Promise.all(flashcardPromises);
      setFlashcards(newFlashcards);
      toast({ title: 'Success!', description: 'Your flashcards are ready.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate visualizations. Please try again.' });
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
              <CardTitle>Create Your Flashcards</CardTitle>
              <CardDescription>Paste your flashcard content as JSON below, then click generate to create your slides.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Textarea
                  placeholder="Paste your JSON here..."
                  className="min-h-[200px] font-code text-sm"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
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
