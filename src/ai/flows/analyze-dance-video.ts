'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing dance videos using the Gemini API to identify dance steps.
 *
 * - analyzeDanceVideo - A function that accepts a video URL and returns a list of detected dance steps.
 * - AnalyzeDanceVideoInput - The input type for the analyzeDanceVideo function, which includes the video URL.
 * - AnalyzeDanceVideoOutput - The return type for the analyzeDanceVideo function, which includes a list of dance steps with timestamps.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the analyzeDanceVideo function
const AnalyzeDanceVideoInputSchema = z.object({
  videoUrl: z.string().describe('The URL of the dance video to analyze.'),
});
export type AnalyzeDanceVideoInput = z.infer<typeof AnalyzeDanceVideoInputSchema>;

// Define the output schema for the analyzeDanceVideo function
const AnalyzeDanceVideoOutputSchema = z.object({
  danceSteps: z.array(
    z.object({
      timestamp: z.number().describe('The timestamp of the dance step in seconds.'),
      stepName: z.string().describe('The name of the dance step.'),
    })
  ).describe('A list of detected dance steps with timestamps and names.'),
});
export type AnalyzeDanceVideoOutput = z.infer<typeof AnalyzeDanceVideoOutputSchema>;

// Exported function that wraps the flow
export async function analyzeDanceVideo(input: AnalyzeDanceVideoInput): Promise<AnalyzeDanceVideoOutput> {
  return analyzeDanceVideoFlow(input);
}

// Define the prompt for analyzing the dance video
const analyzeDanceVideoPrompt = ai.definePrompt({
  name: 'analyzeDanceVideoPrompt',
  input: {schema: AnalyzeDanceVideoInputSchema},
  output: {schema: AnalyzeDanceVideoOutputSchema},
  prompt: `You are an AI dance analyst. Analyze the dance video at the following URL: {{{videoUrl}}}. Identify the different dance steps performed in the video and provide a list of dance steps with timestamps and names. The output must conform to the AnalyzeDanceVideoOutput schema.`,
});

// Define the Genkit flow for analyzing the dance video
const analyzeDanceVideoFlow = ai.defineFlow(
  {
    name: 'analyzeDanceVideoFlow',
    inputSchema: AnalyzeDanceVideoInputSchema,
    outputSchema: AnalyzeDanceVideoOutputSchema,
  },
  async input => {
    const {output} = await analyzeDanceVideoPrompt(input);
    return output!;
  }
);
