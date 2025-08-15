'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing dance videos using the Gemini API to identify dance steps.
 *
 * - analyzeDanceVideo - A function that accepts a video URL and dance style, returning a list of detected dance steps.
 * - AnalyzeDanceVideoInput - The input type for the analyzeDanceVideo function.
 * - AnalyzeDanceVideoOutput - The return type for the analyzeDanceVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Define the input schema for the analyzeDanceVideo function
const AnalyzeDanceVideoInputSchema = z.object({
  videoUrl: z.string().describe('The URL of the dance video to analyze.'),
  danceStyle: z.string().describe('The style of dance in the video (e.g., Latin, Hip Hop, Ballet).'),
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
  prompt: `You are an AI dance instructor specializing in {{danceStyle}}, powered by the Gemini 2.0 Flash model. Your task is to analyze the dance video at the following URL: {{{videoUrl}}}.

  Your primary goal is to break down the choreography into logical, easy-to-learn segments for a beginner learning at home. 
  
  First, watch the video from start to finish to identify logical breakpoints in the choreography. Then, for each segment you identified, provide the following details, focusing exclusively on the dancer's legs and feet:
  1. A descriptive name for the steps in that segment.
  2. Its start time in seconds.
  3. Its end time in seconds.
  4. A detailed, step-by-step description of the footwork for a beginner. Be extremely specific. For each movement, you must specify:
    - Which foot is being used (left or right).
    - The type of step (e.g., toe tap, heel tap, stomp, slide).
    - The direction of the movement (e.g., in front, behind, to the side, in place).
  
  Please provide the output as a list of these logical learning segments. The output must conform to the AnalyzeDanceVideoOutput schema.

  IMPORTANT: YOU MUST ANALYZE THE VIDEO FROM ITS START TO ITS ACTUAL END. FIRST, DETERMINE THE TOTAL LENGTH OF THE VIDEO. ALL OF THE TIMESTAMPS YOU PROVIDE FOR THE DANCE STEPS MUST BE LESS THAN OR EQUAL TO THE TOTAL LENGTH OF THE VIDEO. DO NOT PROVIDE TIMESTAMPS BEYOND THE VIDEO'S DURATION. FAILURE TO ADHERE TO THE VIDEO'S TIMELINE WILL RENDER THE ANALYSIS USELESS.`,
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
