// This is a server action.
'use server';

/**
 * @fileOverview Generates visualizations (charts, graphs) from flashcard data to enhance understanding.
 *
 * - generateVisualizations - A function that takes flashcard data and returns visualizations.
 * - GenerateVisualizationsInput - The input type for the generateVisualizations function.
 * - GenerateVisualizationsOutput - The return type for the generateVisualizations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVisualizationsInputSchema = z.object({
  flashcardData: z.string().describe('JSON formatted flashcard data.'),
});
export type GenerateVisualizationsInput = z.infer<typeof GenerateVisualizationsInputSchema>;

const GenerateVisualizationsOutputSchema = z.object({
  visualizationDataUri: z.string().describe("A data URI containing the generated visualization (e.g., chart or graph).  It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  reasoning: z.string().describe('The AI reasoning for generating this visualization.'),
});
export type GenerateVisualizationsOutput = z.infer<typeof GenerateVisualizationsOutputSchema>;

export async function generateVisualizations(input: GenerateVisualizationsInput): Promise<GenerateVisualizationsOutput> {
  return generateVisualizationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVisualizationsPrompt',
  input: {schema: GenerateVisualizationsInputSchema},
  output: {schema: GenerateVisualizationsOutputSchema},
  prompt: `You are an AI assistant that generates visualizations (charts, graphs, etc.) from flashcard data.

You will receive flashcard data in JSON format. Analyze the data and determine if a visualization would be helpful for understanding the information.
If a visualization is beneficial, generate it and return a data URI of the generated visualization. Also explain your reasoning for generating it. It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.
If a visualization is not beneficial, return an empty string for the visualizationDataUri.

Flashcard Data: {{{flashcardData}}}
`,
});

const generateVisualizationsFlow = ai.defineFlow(
  {
    name: 'generateVisualizationsFlow',
    inputSchema: GenerateVisualizationsInputSchema,
    outputSchema: GenerateVisualizationsOutputSchema,
  },
  async input => {
     // This flow is no longer used directly by the client, but we keep it for reference.
     // Let's return a dummy response.
     return {
        visualizationDataUri: '',
        reasoning: 'This flow is deprecated.',
     }
  }
);
