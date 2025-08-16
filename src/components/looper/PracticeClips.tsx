"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Clip, PlaybackSpeed } from "@/lib/types";
import { formatTime } from "@/lib/utils";

type PracticeClipsProps = {
  clips: Clip[];
  playbackSpeed: PlaybackSpeed;
  setPlaybackSpeed: React.Dispatch<React.SetStateAction<PlaybackSpeed>>;
  isLooping: boolean;
  setIsLooping: React.Dispatch<React.SetStateAction<boolean>>;
  handleClipPlayback: (startTime: number, endTime: number) => void;
  practiceClipsRef: React.RefObject<HTMLDivElement>;
};

export function PracticeClips({
  clips,
  playbackSpeed,
  setPlaybackSpeed,
  isLooping,
  setIsLooping,
  handleClipPlayback,
  practiceClipsRef
}: PracticeClipsProps) {
  const [isPracticeClipsOpen, setIsPracticeClipsOpen] = useState(true);

  if (clips.length === 0) return null;

  return (
    <div className="mt-8" ref={practiceClipsRef}>
      <Collapsible open={isPracticeClipsOpen} onOpenChange={setIsPracticeClipsOpen}>
        <Card className="shadow-lg">
          <CollapsibleTrigger asChild>
             <div className="flex justify-between items-center p-6 cursor-pointer">
               <div className="text-left">
                <CardTitle>Your Clips</CardTitle>
                <CardDescription>Click a clip to play. Adjust speed or loop it.</CardDescription>
               </div>
               <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronDown className={cn("h-6 w-6 transition-transform duration-200", isPracticeClipsOpen && "rotate-180")} />
                <span className="sr-only">Toggle</span>
              </Button>
             </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 pb-6 pt-0">
              <div className="pt-4 flex items-center gap-6 justify-between">
                <div className="flex-1">
                  <Label className="mb-2 block text-sm font-medium">Playback Speed</Label>
                  <Tabs value={playbackSpeed.toString()} onValueChange={(val) => setPlaybackSpeed(Number(val) as PlaybackSpeed)} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="0.25">0.25x</TabsTrigger>
                      <TabsTrigger value="0.5">0.5x</TabsTrigger>
                      <TabsTrigger value="0.75">0.75x</TabsTrigger>
                      <TabsTrigger value="1">1x</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="flex flex-col items-center pt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="loop-switch" className="block text-sm font-medium">Loop</Label>
                       <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Repeats the clip automatically until you stop it.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                    </div>
                  <Switch id="loop-switch" checked={isLooping} onCheckedChange={setIsLooping} />
                </div>
              </div>
            </div>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {clips.map((clip, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded-md">
                        {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                      </span>
                      <Button onClick={() => handleClipPlayback(clip.startTime, clip.endTime)} size="sm" variant="mystic">
                        <Play className="mr-2 h-4 w-4" />
                        Play Clip
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
