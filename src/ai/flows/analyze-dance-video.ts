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
import {googleAI} from '@genkit-ai/googleai';

// Define the input schema for the analyzeDanceVideo function
const AnalyzeDanceVideoInputSchema = z.object({
  videoUrl: z.string().describe('The URL of the dance video to analyze.'),
});
export type AnalyzeDanceVideoInput = z.infer<typeof AnalyzeDanceVideoInputSchema>;

// Define the output schema for the analyzeDanceVideo function
const AnalyzeDanceVideoOutputSchema = z.object({
  danceSteps: z
    .array(
      z.object({
        startTime: z.number().describe('The start time of the dance step in seconds.'),
        endTime: z.number().describe('The end time of the dance step in seconds.'),
        stepName: z.string().describe('The name of the dance step.'),
        description: z
          .string()
          .describe('A short, helpful description of how to perform the dance step.'),
      })
    )
    .describe(
      'A list of detected dance steps with start and end times, names, and descriptions.'
    ),
});
export type AnalyzeDanceVideoOutput = z.infer<typeof AnalyzeDanceVideoOutputSchema>;

// Exported function that wraps the flow
export async function analyzeDanceVideo(
  input: AnalyzeDanceVideoInput
): Promise<AnalyzeDanceVideoOutput> {
  return analyzeDanceVideoFlow(input);
}

// Define the prompt for analyzing the dance video
const analyzeDanceVideoPrompt = ai.definePrompt({
  name: 'analyzeDanceVideoPrompt',
  input: {schema: AnalyzeDanceVideoInputSchema},
  output: {schema: AnalyzeDanceVideoOutputSchema},
  prompt: `You are an AI dance analyst and instructor, powered by the latest Gemini 2.0 Flash model. Your task is to analyze the dance video at the following URL: {{{videoUrl}}}. 
  
  Your goal is to break down the video into digestible chunks or clips, each representing a distinct dance move or a short combination of moves. When analyzing, focus on THE FEET ONLY. For each chunk, you need to identify:
  1. A descriptive name for the step.
  2. Its start time in seconds.
  3. Its end time in seconds.
  4. A short, helpful description of how to perform the dance step for a beginner.
  
  Please provide the output as a list of these dance step chunks. The output must conform to the AnalyzeDanceVideoOutput schema.`,
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
