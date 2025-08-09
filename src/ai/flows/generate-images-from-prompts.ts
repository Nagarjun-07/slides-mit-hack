// This is a server action.
'use server';

/**
 * @fileOverview Generates an image for each text prompt in a list.
 *
 * - generateImagesFromPrompts - A function that takes a list of text prompts and returns an image for each.
 * - GenerateImagesFromPromptsInput - The input type for the generateImagesFromPrompts function.
 * - GenerateImagesFromPromptsOutput - The return type for the generateImagesFromPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImagesFromPromptsInputSchema = z.object({
  prompts: z.array(z.string()).describe('A list of text prompts to generate images from.'),
});
export type GenerateImagesFromPromptsInput = z.infer<typeof GenerateImagesFromPromptsInputSchema>;

const GenerateImagesFromPromptsOutputSchema = z.object({
  imageDataUris: z.array(z.string()).describe("A list of data URIs, each containing a generated image. Each URI must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateImagesFromPromptsOutput = z.infer<typeof GenerateImagesFromPromptsOutputSchema>;

export async function generateImagesFromPrompts(input: GenerateImagesFromPromptsInput): Promise<GenerateImagesFromPromptsOutput> {
  return generateImagesFromPromptsFlow(input);
}

const generateImage = async (prompt: string): Promise<string> => {
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `A high quality, creative, and vibrant image representing the following concept: ${prompt}`,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media || !media.url) {
      throw new Error(`Image generation failed for prompt: ${prompt}`);
    }

    return media.url;
};


const generateImagesFromPromptsFlow = ai.defineFlow(
  {
    name: 'generateImagesFromPromptsFlow',
    inputSchema: GenerateImagesFromPromptsInputSchema,
    outputSchema: GenerateImagesFromPromptsOutputSchema,
  },
  async ({ prompts }) => {
    const imagePromises = prompts.map(generateImage);
    const imageDataUris = await Promise.all(imagePromises);
    
    return {
      imageDataUris,
    };
  }
);
