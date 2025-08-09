'use client';

import { useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import Flashcard from './flashcard';
import { useToast } from '@/hooks/use-toast';
import type { FlashcardData } from '@/lib/types';

interface SlideViewerProps {
  flashcards: FlashcardData[];
}

export default function SlideViewer({ flashcards }: SlideViewerProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'FlashFlow';
      pptx.title = 'FlashFlow Presentation';

      for (const card of flashcards) {
        // Question Slide
        const qSlide = pptx.addSlide();
        qSlide.background = { color: 'F0F8FF' };
        qSlide.addText('Question', { x: 0.5, y: 0.25, fontSize: 18, bold: true, color: '363636' });
        qSlide.addText(card.question, { x: 0.5, y: 1.0, w: '90%', h: '80%', fontSize: 32, valign: 'middle', align: 'center', color: '000000' });

        // Answer Slide
        const aSlide = pptx.addSlide();
        aSlide.background = { color: 'F0F8FF' };
        aSlide.addText('Answer', { x: 0.5, y: 0.25, fontSize: 18, bold: true, color: '363636' });
        
        if (card.visualizationDataUri) {
          aSlide.addText(card.answer, { x: 0.5, y: 1.0, w: '45%', h: '80%', fontSize: 16, valign: 'top', color: '000000' });
          aSlide.addImage({ data: card.visualizationDataUri, x: '52%', y: 1.0, w: '45%', h: '80%' });
        } else {
          aSlide.addText(card.answer, { x: 0.5, y: 1.0, w: '90%', h: '80%', fontSize: 24, valign: 'middle', align: 'left', color: '000000' });
        }
      }

      await pptx.writeFile({ fileName: 'FlashFlow-Export.pptx' });
      toast({ title: 'Export successful!', description: 'Your presentation has been downloaded.' });
    } catch (error) {
      console.error("Failed to export PPT:", error);
      toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not generate the PPT file.' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Your Slides</h3>
          <Button onClick={handleExport} disabled={isExporting}>
             {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
            <span>{isExporting ? 'Exporting...' : 'Export to PPT'}</span>
          </Button>
        </div>
        <Carousel className="w-full">
          <CarouselContent>
            {flashcards.map((card, index) => (
              <CarouselItem key={index}>
                <Flashcard {...card} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 md:-left-12" />
          <CarouselNext className="-right-4 md:-right-12" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
