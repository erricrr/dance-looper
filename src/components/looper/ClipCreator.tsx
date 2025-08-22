"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ChevronsRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Clip, customClipSchema } from "@/lib/types";

type ClipCreatorProps = {
  player: any;
  videoDuration: number;
  isPlayerLoading: boolean;
  clips: Clip[];
  setClips: React.Dispatch<React.SetStateAction<Clip[]>>;
  practiceClipsRef: React.RefObject<HTMLDivElement>;
  isOpen?: boolean;
  resetKey?: number;
};

export function ClipCreator({
  player,
  videoDuration,
  isPlayerLoading,
  clips,
  setClips,
  practiceClipsRef,
  isOpen = true,
  resetKey,
}: ClipCreatorProps) {
  const [isCustomClipOpen, setIsCustomClipOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [showAutoSegmentInfo, setShowAutoSegmentInfo] = useState(false);
  const customClipRef = useRef<HTMLDivElement>(null);

  const customClipForm = useForm<z.infer<typeof customClipSchema>>({
    resolver: zodResolver(customClipSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
    },
  });

  useEffect(() => {
    if (resetKey !== undefined) {
      setSelectedSegment(null);
      setIsCustomClipOpen(false);
      setShowAutoSegmentInfo(false);
      customClipForm.reset({
        startTime: "",
        endTime: "",
      });
    }
  }, [resetKey, customClipForm]);

  const scrollToPracticeClips = () => {
    setTimeout(() => {
      if (practiceClipsRef.current) {
        const element = practiceClipsRef.current;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 150;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const segmentVideo = (seconds: number) => {
    if (!player || !videoDuration) return;
    setSelectedSegment(seconds);
    const newClips: Clip[] = [];
    for (let startTime = 0; startTime < videoDuration; startTime += seconds) {
      const endTime = Math.min(startTime + seconds, videoDuration);
      newClips.push({ startTime, endTime });
    }
    setClips(newClips);
    scrollToPracticeClips();
  };

  const handleCustomClipSubmit = (values: z.infer<typeof customClipSchema>) => {
    if (!player || !videoDuration) return;
    const parseTime = (timeStr: string): number => {
      const [minutes, seconds] = timeStr.split(":").map(Number);
      return minutes * 60 + seconds;
    };
    const startTime = parseTime(values.startTime);
    const endTime = parseTime(values.endTime);
    if (startTime >= endTime || endTime > videoDuration) {
      return;
    }
    const newCustomClip: Clip = { startTime, endTime, isCustom: true };
    const existingCustomClips = clips.filter((clip) => clip.isCustom);
    const existingAutoClips = clips.filter((clip) => !clip.isCustom);
    const allClips = [...existingCustomClips, newCustomClip, ...existingAutoClips].sort((a, b) => a.startTime - b.startTime);
    setClips(allClips);
    scrollToPracticeClips();
    customClipForm.reset();
  };

  return (
    <div className="mt-8">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle>Create Clips</CardTitle>
          <CardDescription>Automatically segment the video or create your own custom clips.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <fieldset disabled={!player || !videoDuration || isPlayerLoading}>
            <div>
              <div className="flex items-center gap-2 relative">
                <Label className="font-semibold">Auto-Segment Video</Label>
                <button
                  data-info-button
                  className="p-1 rounded-md hover:bg-muted active:bg-muted transition-colors"
                  onClick={() => setShowAutoSegmentInfo(!showAutoSegmentInfo)}
                >
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
                {showAutoSegmentInfo && (
                  <div className="absolute top-full left-0 mt-1 bg-background border rounded-md p-2 text-sm shadow-lg z-50 w-80 transition-opacity duration-200 opacity-100">
                    <div className="text-center">
                      <p>Clip end times may appear 1 second</p>
                      <p>longer due to fractional seconds</p>
                      <p>in the video duration.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button variant={selectedSegment === 3 ? "mystic" : "outline"} onClick={() => segmentVideo(3)}>
                  Every 3 Secs
                </Button>
                <Button variant={selectedSegment === 5 ? "mystic" : "outline"} onClick={() => segmentVideo(5)}>
                  Every 5 Secs
                </Button>
                <Button variant={selectedSegment === 10 ? "mystic" : "outline"} onClick={() => segmentVideo(10)}>
                  Every 10 Secs
                </Button>
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={() => setIsCustomClipOpen(!isCustomClipOpen)}
                className="w-full flex items-center gap-2 text-sm font-semibold hover:bg-muted/50 rounded-md p-2 transition-colors"
              >
                <Plus className={cn("h-4 w-4 transition-transform duration-300", isCustomClipOpen && "rotate-45")} />
                Create Custom Clip
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out overflow-hidden",
                  isCustomClipOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden pb-1">
                  <Form {...customClipForm}>
                    <form onSubmit={customClipForm.handleSubmit(handleCustomClipSubmit)} className="flex items-center gap-2 pt-2">
                      <FormField
                        control={customClipForm.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormLabel className="text-sm font-medium whitespace-nowrap">Start:</FormLabel>
                            <FormControl>
                              <Input placeholder="MM:SS" {...field} className="w-[80px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <ChevronsRight className="h-4 w-4" />
                      <FormField
                        control={customClipForm.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormLabel className="text-sm font-medium whitespace-nowrap">End:</FormLabel>
                            <FormControl>
                              <Input placeholder="MM:SS" {...field} className="w-[80px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" variant="mystic" size="icon" className="active:scale-95 transition-transform">
                        <Plus />
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </fieldset>
        </CardContent>
      </Card>
    </div>
  );
}
