"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, ChevronDown, Info, Trash2, X } from "lucide-react";
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
  setClips: React.Dispatch<React.SetStateAction<Clip[]>>;
};

export function PracticeClips({
  clips,
  playbackSpeed,
  setPlaybackSpeed,
  isLooping,
  setIsLooping,
  handleClipPlayback,
  practiceClipsRef,
  setClips
}: PracticeClipsProps) {
  const [isPracticeClipsOpen, setIsPracticeClipsOpen] = useState(true);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedClips, setSelectedClips] = useState<number[]>([]);

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedClips([]);
  };

  const toggleClipSelection = (index: number) => {
    setSelectedClips(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const deleteSelectedClips = () => {
    if (selectedClips.length === 0) return;

    const newClips = clips.filter((_, index) => !selectedClips.includes(index));
    setClips(newClips);
    setSelectedClips([]);
    setIsDeleteMode(false);
  };

  if (clips.length === 0) return null;

  return (
    <div className="mt-8" ref={practiceClipsRef}>
      <Collapsible open={isPracticeClipsOpen} onOpenChange={setIsPracticeClipsOpen}>
        <Card className="shadow-lg">
          <CollapsibleTrigger asChild>
            <button className="w-full p-6">
              <div className="flex justify-between items-center">
                <div className="text-left flex items-center gap-4">
                  <div>
                    <CardTitle>Your Clips</CardTitle>
                    <CardDescription>Click a clip to play. Adjust speed or loop it.</CardDescription>
                  </div>
                </div>
                <ChevronDown className={cn("h-6 w-6 transition-transform duration-200", isPracticeClipsOpen && "rotate-180")} />
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
                                    <div className="px-6 pb-6 pt-0">
              {/* Controls Section */}
              <div className="pt-4 space-y-4">
                {/* Playback Speed */}
                <div>
                  <Label className="mb-2 block text-sm font-medium">Playback Speed</Label>
                  <Tabs value={playbackSpeed.toString()} onValueChange={(val) => setPlaybackSpeed(Number(val) as PlaybackSpeed)} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                      <TabsTrigger value="0.25">0.25x</TabsTrigger>
                      <TabsTrigger value="0.5">0.5x</TabsTrigger>
                      <TabsTrigger value="0.75">0.75x</TabsTrigger>
                      <TabsTrigger value="1">1x</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Loop and Delete Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {isDeleteMode ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDeleteMode();
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={selectedClips.length === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSelectedClips();
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="loop-switch" className="text-sm font-medium whitespace-nowrap">Loop</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-center">
                                <p>Repeats the clip automatically</p>
                                <p>until you stop it.</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Switch id="loop-switch" checked={isLooping} onCheckedChange={setIsLooping} />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 sm:hidden"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDeleteMode();
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Delete clips</span>
                      </Button>
                    </div>
                  )}

                  {!isDeleteMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 hidden sm:flex"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDeleteMode();
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Delete clips</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {clips.map((clip, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3",
                        isDeleteMode && selectedClips.includes(index) && "bg-muted/30 border-primary"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {isDeleteMode && (
                          <Checkbox
                            checked={selectedClips.includes(index)}
                            onCheckedChange={() => toggleClipSelection(index)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded-md">
                          {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                        </span>
                      </div>
                      {!isDeleteMode && (
                        <Button onClick={() => handleClipPlayback(clip.startTime, clip.endTime)} size="sm" variant="mystic">
                          <Play className="mr-2 h-4 w-4" />
                          Play Clip
                        </Button>
                      )}
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
