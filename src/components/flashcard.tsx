'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Lightbulb, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlashcardData } from '@/lib/types';


export default function Flashcard({ question, answer, visualizationDataUri, reasoning }: FlashcardData) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full aspect-[16/9] [perspective:1000px]">
      <div
        className={cn(
          'relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d]',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of Card */}
        <div className="absolute w-full h-full [backface-visibility:hidden]">
          <Card className="w-full h-full flex flex-col justify-center items-center p-6 shadow-xl bg-white dark:bg-slate-900">
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Question</p>
              <p className="text-2xl md:text-4xl font-semibold">{question}</p>
            </CardContent>
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm text-muted-foreground">
              <RotateCcw className="h-4 w-4" />
              Click to flip
            </div>
          </Card>
        </div>

        {/* Back of Card */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Card className="w-full h-full flex flex-col p-6 shadow-xl bg-white dark:bg-slate-900">
            <p className="text-sm text-muted-foreground mb-2 flex-shrink-0">Answer</p>
            <ScrollArea className="flex-1 pr-4">
              <div className={cn("grid gap-4", visualizationDataUri && "md:grid-cols-2")}>
                <p className="text-lg md:text-xl leading-relaxed">{answer}</p>
                {visualizationDataUri && (
                  <div className="flex flex-col gap-4 border-l pl-4">
                    <Image
                      src={visualizationDataUri}
                      alt="AI generated visualization"
                      width={400}
                      height={300}
                      className="rounded-md object-contain border bg-slate-50"
                      data-ai-hint="chart diagram"
                    />
                    {reasoning && (
                      <div className="text-xs text-muted-foreground p-2 rounded-md bg-muted flex gap-2">
                        <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>{reasoning}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
             <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm text-muted-foreground">
              <RotateCcw className="h-4 w-4" />
              Click to flip
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
