'use server';

/**
 * @fileOverview A flow for generating descriptions of dance steps.
 *
 * - generateDanceStepDescriptions - A function that generates dance step descriptions.
 * - GenerateDanceStepDescriptionsInput - The input type for the generateDanceStepDescriptions function.
 * - GenerateDanceStepDescriptionsOutput - The return type for the generateDanceStepDescriptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDanceStepDescriptionsInputSchema = z.object({
  danceStep: z.string().describe('The name of the dance step.'),
  videoDescription: z.string().describe('The description of the dance video.'),
});
export type GenerateDanceStepDescriptionsInput = z.infer<
  typeof GenerateDanceStepDescriptionsInputSchema
>;

const GenerateDanceStepDescriptionsOutputSchema = z.object({
  description: z.string().describe('The description of the dance step.'),
});
export type GenerateDanceStepDescriptionsOutput = z.infer<
  typeof GenerateDanceStepDescriptionsOutputSchema
>;

export async function generateDanceStepDescriptions(
  input: GenerateDanceStepDescriptionsInput
): Promise<GenerateDanceStepDescriptionsOutput> {
  return generateDanceStepDescriptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDanceStepDescriptionsPrompt',
  input: {schema: GenerateDanceStepDescriptionsInputSchema},
  output: {schema: GenerateDanceStepDescriptionsOutputSchema},
  prompt: `You are a dance instructor explaining dance steps.

  Given the name of a dance step, and a description of the video it appears in, generate a description of the dance step.

  Dance Step: {{{danceStep}}}
  Video Description: {{{videoDescription}}}
  `,
});

const generateDanceStepDescriptionsFlow = ai.defineFlow(
  {
    name: 'generateDanceStepDescriptionsFlow',
    inputSchema: GenerateDanceStepDescriptionsInputSchema,
    outputSchema: GenerateDanceStepDescriptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
