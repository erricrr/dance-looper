import * as z from "zod";

export const formSchema = z.object({
  youtubeUrl: z.string().url({ message: "Please enter a valid YouTube URL." })
    .refine(url => url.includes("youtube.com") || url.includes("youtu.be"), {
      message: "Please enter a valid YouTube URL.",
    }),
});

export const customClipSchema = z.object({
  startTime: z.string().refine(val => /^\d{1,2}:\d{2}$/.test(val), { message: "Use MM:SS" }),
  endTime: z.string().refine(val => /^\d{1,2}:\d{2}$/.test(val), { message: "Use MM:SS" }),
});

export type Clip = {
  startTime: number;
  endTime: number;
  isCustom?: boolean;
};

export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1;
