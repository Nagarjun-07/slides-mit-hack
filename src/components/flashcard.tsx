'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlashcardData } from '@/lib/types';


export default function Flashcard({ question, answer, visualizationDataUri }: FlashcardData) {
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
          <Card className="w-full h-full flex flex-col justify-center items-center p-6 shadow-xl bg-white dark:bg-slate-900">
            {visualizationDataUri ? (
              <Image
                src={visualizationDataUri}
                alt="AI generated visualization"
                fill
                className="rounded-md object-contain"
                data-ai-hint="creative image"
              />
            ) : (
                <ScrollArea className="flex-1 pr-4 w-full">
                    <p className="text-lg md:text-xl leading-relaxed">{answer}</p>
                </ScrollArea>
            )}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm text-muted-foreground bg-white/70 dark:bg-black/70 p-1 rounded-md">
              <RotateCcw className="h-4 w-4" />
              Click to flip
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
