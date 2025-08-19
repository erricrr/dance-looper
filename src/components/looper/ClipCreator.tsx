"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import YouTube, { YouTubePlayer } from 'react-youtube';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Plus, ChevronsRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Clip, customClipSchema } from "@/lib/types";

type ClipCreatorProps = {
  player: YouTubePlayer | null;
  videoDuration: number;
  isPlayerLoading: boolean;
  clips: Clip[];
  setClips: React.Dispatch<React.SetStateAction<Clip[]>>;
  practiceClipsRef: React.RefObject<HTMLDivElement>;
};

export function ClipCreator({
  player,
  videoDuration,
  isPlayerLoading,
  clips,
  setClips,
  practiceClipsRef
}: ClipCreatorProps) {
  const [isCreateClipsOpen, setIsCreateClipsOpen] = useState(true);
  const [isCustomClipOpen, setIsCustomClipOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [showAutoSegmentInfo, setShowAutoSegmentInfo] = useState(false);

  // Close info panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-info-button]')) {
        setShowAutoSegmentInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const customClipForm = useForm<z.infer<typeof customClipSchema>>({
    resolver: zodResolver(customClipSchema),
    defaultValues: {
      startTime: "",
      endTime: ""
    }
  });

  const scrollToPracticeClips = () => {
    setTimeout(() => {
      practiceClipsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
      const [minutes, seconds] = timeStr.split(':').map(Number);
      return minutes * 60 + seconds;
    };

    const startTime = parseTime(values.startTime);
    const endTime = parseTime(values.endTime);

    if (startTime >= endTime || endTime > videoDuration) {
      return;
    }

    const newCustomClip: Clip = { startTime, endTime, isCustom: true };
    const existingCustomClips = clips.filter(clip => clip.isCustom);
    const existingAutoClips = clips.filter(clip => !clip.isCustom);

    const allClips = [...existingCustomClips, newCustomClip, ...existingAutoClips].sort((a, b) => a.startTime - b.startTime);
    setClips(allClips);
    scrollToPracticeClips();

    customClipForm.reset();
  };

  const addAllClips = () => {
    if (!player || !videoDuration) return;

    const customClips = clips.filter(clip => clip.isCustom);
    const autoClips = clips.filter(clip => !clip.isCustom);

    const allClips = [...customClips, ...autoClips].sort((a, b) => a.startTime - b.startTime);
    setClips(allClips);
    scrollToPracticeClips();
  };

  return (
    <div className="mt-8">
      <Collapsible open={isCreateClipsOpen} onOpenChange={setIsCreateClipsOpen} disabled={!player || !videoDuration || isPlayerLoading}>
        <Card className="shadow-lg">
          <CollapsibleTrigger asChild>
            <button className="w-full p-6">
              <div className="flex justify-between items-center">
                <div className="text-left flex items-center gap-4">
                  <div>
                    <CardTitle>Create Clips</CardTitle>
                    <CardDescription>Automatically segment the video or create your own custom clips.</CardDescription>
                  </div>
                </div>
                <ChevronDown className={cn("h-6 w-6 transition-transform duration-200", isCreateClipsOpen && "rotate-180")} />
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-2">
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
                      <div className="absolute top-full left-0 mt-1 bg-background border rounded-md p-2 text-sm shadow-lg z-50 w-80">
                        <div className="text-center">
                          <p>Clip end times may appear 1 second</p>
                          <p>longer due to fractional seconds</p>
                          <p>in the video duration.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button variant={selectedSegment === 3 ? "mystic" : "outline"} onClick={() => segmentVideo(3)}>Every 3 Secs</Button>
                    <Button variant={selectedSegment === 5 ? "mystic" : "outline"} onClick={() => segmentVideo(5)}>Every 5 Secs</Button>
                    <Button variant={selectedSegment === 10 ? "mystic" : "outline"} onClick={() => segmentVideo(10)}>Every 10 Secs</Button>
                  </div>
                </div>
                <Collapsible open={isCustomClipOpen} onOpenChange={setIsCustomClipOpen}>
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center gap-2 text-sm font-semibold pt-4">
                            <Plus className={cn("h-4 w-4 transition-transform duration-200", isCustomClipOpen && "rotate-45")} />
                            Create Custom Clip
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <Form {...customClipForm}>
                          <form onSubmit={customClipForm.handleSubmit(handleCustomClipSubmit)} className="flex items-end gap-2 mt-2">
                              <FormField
                                  control={customClipForm.control}
                                  name="startTime"
                                  render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Start</FormLabel>
                                      <FormControl>
                                      <Input placeholder="MM:SS" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                                  )}
                              />
                              <ChevronsRight className="h-6 w-6 mb-2" />
                              <FormField
                                  control={customClipForm.control}
                                  name="endTime"
                                  render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>End</FormLabel>
                                      <FormControl>
                                      <Input placeholder="MM:SS" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                                  )}
                              />
                              <Button type="submit" variant="mystic" size="icon" className="mb-1"><Plus/></Button>
                          </form>
                      </Form>
                    </CollapsibleContent>
                </Collapsible>
              </fieldset>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
