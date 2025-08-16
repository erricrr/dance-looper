"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Plus, ChevronsRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { customClipSchema, Clip } from "@/lib/types";
import { parseTimeToSeconds, formatTime } from "@/lib/utils";
import { YouTubePlayer } from "react-youtube";

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
  const { toast } = useToast();

  const customClipForm = useForm<z.infer<typeof customClipSchema>>({
    resolver: zodResolver(customClipSchema),
    defaultValues: { startTime: "00:00", endTime: "00:00" },
  });

  const scrollToPracticeClips = () => {
    setTimeout(() => {
        practiceClipsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  const handleCustomClipSubmit = (values: z.infer<typeof customClipSchema>) => {
      const startTime = parseTimeToSeconds(values.startTime);
      const endTime = parseTimeToSeconds(values.endTime);

      if (startTime >= endTime) {
          toast({ variant: "destructive", title: "Invalid Time", description: "Start time must be before end time." });
          return;
      }
      if (endTime > videoDuration) {
          toast({ variant: "destructive", title: "Invalid Time", description: `End time cannot exceed video duration (${formatTime(videoDuration)}).` });
          return;
      }

      const newClip: Clip = {
        startTime,
        endTime,
        isCustom: true,
      };

      setClips(prev => [...prev, newClip].sort((a,b) => a.startTime - b.startTime));
      customClipForm.reset({startTime: "00:00", endTime: "00:00"});
      scrollToPracticeClips();
  };

  const segmentVideo = (segmentDuration: number) => {
    if (!videoDuration) return;

    if (selectedSegment === segmentDuration) {
      const customClips = clips.filter(clip => clip.isCustom);
      setClips(customClips);
      setSelectedSegment(null);
      return;
    }

    setSelectedSegment(segmentDuration);

    const customClips = clips.filter(clip => clip.isCustom);
    const newAutoClips: Clip[] = [];

    for (let i = 0; i < videoDuration; i += segmentDuration) {
      const startTime = i;
      const endTime = Math.min(i + segmentDuration, videoDuration);
      newAutoClips.push({
        startTime,
        endTime,
        isCustom: false,
      });
    }

    const allClips = [...customClips, ...newAutoClips].sort((a, b) => a.startTime - b.startTime);
    setClips(allClips);
    scrollToPracticeClips();
  };

  return (
    <div className="mt-8">
      <Collapsible open={isCreateClipsOpen} onOpenChange={setIsCreateClipsOpen} disabled={!player || !videoDuration || isPlayerLoading}>
        <Card className="shadow-lg">
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-6 cursor-pointer">
              <div className="text-left">
                <CardTitle>Create Clips</CardTitle>
                <CardDescription>Automatically segment the video or create your own custom clips.</CardDescription>
              </div>
               <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronDown className={cn("h-6 w-6 transition-transform duration-200", isCreateClipsOpen && "rotate-180")} />
                  <span className="sr-only">Toggle</span>
                </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-2">
              <fieldset disabled={!player || !videoDuration || isPlayerLoading}>
                <div>
                  <Label className="font-semibold">Auto-Segment Video</Label>
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
