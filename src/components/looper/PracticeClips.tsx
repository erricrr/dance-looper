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
import { Play, ChevronDown, Info, Trash2, X, List, ArrowRight } from "lucide-react";
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
  const [isSequenceMode, setIsSequenceMode] = useState(false);
  const [selectedClips, setSelectedClips] = useState<number[]>([]);
  const [sequenceStartIndex, setSequenceStartIndex] = useState<number | null>(null);
  const [sequenceEndIndex, setSequenceEndIndex] = useState<number | null>(null);

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedClips([]);
    setIsSequenceMode(false);
    setSequenceStartIndex(null);
    setSequenceEndIndex(null);
  };

  const toggleSequenceMode = () => {
    setIsSequenceMode(!isSequenceMode);
    setSelectedClips([]);
    setIsDeleteMode(false);
    setSequenceStartIndex(null);
    setSequenceEndIndex(null);
  };

  const toggleClipSelection = (index: number) => {
    if (isDeleteMode) {
      setSelectedClips(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else if (isSequenceMode) {
      if (sequenceStartIndex === null) {
        setSequenceStartIndex(index);
      } else if (sequenceEndIndex === null) {
        if (index >= sequenceStartIndex) {
          setSequenceEndIndex(index);
        } else {
          // If selected index is before start, make it the new start
          setSequenceStartIndex(index);
          setSequenceEndIndex(sequenceStartIndex);
        }
      } else {
        // Reset and start over
        setSequenceStartIndex(index);
        setSequenceEndIndex(null);
      }
    }
  };

  const deleteSelectedClips = () => {
    if (selectedClips.length === 0) return;

    const newClips = clips.filter((_, index) => !selectedClips.includes(index));
    setClips(newClips);
    setSelectedClips([]);
    setIsDeleteMode(false);
  };

  const playSequence = () => {
    if (sequenceStartIndex === null || sequenceEndIndex === null) return;

    const startClip = clips[sequenceStartIndex];
    const endClip = clips[sequenceEndIndex];

    // Play from the start of the first clip to the end of the last clip
    handleClipPlayback(startClip.startTime, endClip.endTime);
  };

  const clearSequence = () => {
    setSequenceStartIndex(null);
    setSequenceEndIndex(null);
  };

  const getSequenceClips = () => {
    if (sequenceStartIndex === null || sequenceEndIndex === null) return [];
    return clips.slice(sequenceStartIndex, sequenceEndIndex + 1);
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
              <div className="pt-1 space-y-4">
                {/* Playback Speed and Sequence Controls */}
                <div>
                  <Label className="mb-2 block text-sm font-medium">Playback Speed</Label>
                  <div className="flex items-center gap-4">
                    <Tabs value={playbackSpeed.toString()} onValueChange={(val) => setPlaybackSpeed(Number(val) as PlaybackSpeed)} className="w-full">
                      <TabsList className="grid w-full grid-cols-4 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                        <TabsTrigger value="0.25">0.25x</TabsTrigger>
                        <TabsTrigger value="0.5">0.5x</TabsTrigger>
                        <TabsTrigger value="0.75">0.75x</TabsTrigger>
                        <TabsTrigger value="1">1x</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <Button
                      variant={isSequenceMode ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSequenceMode();
                      }}
                      className="shrink-0"
                    >
                      <List className="h-4 w-4 mr-2" />
                      Create Sequence
                    </Button>
                  </div>
                </div>

                {/* Loop, Sequence, and Delete Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
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
                                     ) : isSequenceMode ? (
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

                       <div className="flex items-center gap-2 ml-5">
                       <Button
                           variant="default"
                           size="sm"
                           disabled={sequenceStartIndex === null || sequenceEndIndex === null}
                           onClick={(e) => {
                             e.stopPropagation();
                             playSequence();
                           }}
                         >
                           <Play className="h-4 w-4 mr-1" />
                           Play Sequence
                         </Button>


                         {(sequenceStartIndex !== null || sequenceEndIndex !== null) && (
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               clearSequence();
                             }}
                           >
                             Clear
                           </Button>
                         )}
                       </div>
                     </div>
                  ) : (
                    <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="loop-switch" className="text-sm font-medium whitespace-nowrap">Loop</Label>
                        <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <button
                                className="p-1 rounded-md hover:bg-muted active:bg-muted transition-colors touch-manipulation"
                                onTouchStart={(e) => e.currentTarget.click()}
                              >
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="z-50">
                              <div className="text-center">
                                <p>Repeats the clip automatically</p>
                                <p>until you stop it.</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Switch id="loop-switch" checked={isLooping} onCheckedChange={setIsLooping} />
                      </div>

                      <div className="flex items-center gap-2 ml-5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDeleteMode();
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                          <span className="sr-only">Delete selected clips</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                                 {/* Loop toggle - always visible in delete mode */}
                 {isDeleteMode && (
                   <div className="flex items-center gap-2">
                     <Label htmlFor="loop-switch" className="text-sm font-medium whitespace-nowrap">Loop</Label>
                                            <TooltipProvider>
                         <Tooltip delayDuration={0}>
                           <TooltipTrigger asChild>
                             <button
                               className="p-1 rounded-md hover:bg-muted active:bg-muted transition-colors touch-manipulation"
                               onTouchStart={(e) => e.currentTarget.click()}
                             >
                               <Info className="h-4 w-4 text-muted-foreground" />
                             </button>
                           </TooltipTrigger>
                           <TooltipContent side="top" className="z-50">
                             <div className="text-center">
                               <p>Repeats the clip automatically</p>
                               <p>until you stop it.</p>
                             </div>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     <Switch id="loop-switch" checked={isLooping} onCheckedChange={setIsLooping} />
                   </div>
                 )}

                {/* Sequence Selection Display */}
                {isSequenceMode && (
                  <div className="bg-muted/30 rounded-lg p-3 border">
                    <div className="flex items-center gap-2 mb-2">
                      <List className="h-4 w-4" />
                      <span className="text-sm font-medium">Sequence Selection</span>
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button
                              className="p-1 rounded-md hover:bg-muted active:bg-muted transition-colors touch-manipulation"
                              onTouchStart={(e) => e.currentTarget.click()}
                            >
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs z-50">
                            <div className="text-center">
                              <p className="font-medium mb-1">How to create a sequence:</p>
                              <p>1. Click on the first clip you want to start with</p>
                              <p>2. Click on the last clip you want to end with</p>
                              <p>3. Click "Play Sequence" to practice all clips in order</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {(sequenceStartIndex !== null || sequenceEndIndex !== null) ? (
                      <div className="space-y-1">
                        {sequenceStartIndex !== null && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Start:</span>
                            <span className="font-mono bg-background px-2 py-1 rounded">
                              {formatTime(clips[sequenceStartIndex].startTime)} - {formatTime(clips[sequenceStartIndex].endTime)}
                            </span>
                          </div>
                        )}
                        {sequenceEndIndex !== null && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">End:</span>
                            <span className="font-mono bg-background px-2 py-1 rounded">
                              {formatTime(clips[sequenceEndIndex].startTime)} - {formatTime(clips[sequenceEndIndex].endTime)}
                            </span>
                          </div>
                        )}
                        {sequenceStartIndex !== null && sequenceEndIndex !== null && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Total clips:</span>
                            <span className="font-medium">{getSequenceClips().length}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Click on clips below to select your sequence start and end points
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {clips.map((clip, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors",
                        isDeleteMode && selectedClips.includes(index) && "bg-muted/30 border-primary",
                        isSequenceMode && sequenceStartIndex === index && "bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700",
                        isSequenceMode && sequenceEndIndex === index && "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700",
                        isSequenceMode && sequenceStartIndex !== null && sequenceEndIndex !== null &&
                          index > sequenceStartIndex && index < sequenceEndIndex && "bg-muted/20 border-muted-foreground/20"
                      )}
                      onClick={() => {
                        if (isDeleteMode || isSequenceMode) {
                          toggleClipSelection(index);
                        } else {
                          handleClipPlayback(clip.startTime, clip.endTime);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {isDeleteMode && (
                          <Checkbox
                            checked={selectedClips.includes(index)}
                            onCheckedChange={() => toggleClipSelection(index)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        {isSequenceMode && sequenceStartIndex === index && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Play className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {isSequenceMode && sequenceEndIndex === index && (
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-sm"></div>
                          </div>
                        )}
                        {isSequenceMode && sequenceStartIndex !== null && sequenceEndIndex !== null &&
                          index > sequenceStartIndex && index < sequenceEndIndex && (
                          <div className="w-4 h-4 bg-muted-foreground/30 rounded-full flex items-center justify-center">
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded-md">
                          {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                        </span>
                      </div>
                      {!isDeleteMode && !isSequenceMode && (
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
