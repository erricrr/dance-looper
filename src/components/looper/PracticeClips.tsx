"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { Play, ChevronDown, Info, Trash2, X, List, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Clip, PlaybackSpeed } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Reusable Loop component
function LoopControls({
  isLooping,
  setIsLooping,
  showInfo,
  setShowInfo
}: {
  isLooping: boolean;
  setIsLooping: React.Dispatch<React.SetStateAction<boolean>>;
  showInfo: boolean;
  setShowInfo: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="flex items-center gap-2 relative">
      <button
        data-info-button
        className="p-1"
        onClick={() => setShowInfo(!showInfo)}
      >
        <Info className="h-4 w-4 text-muted-foreground hover:text-primary" />
      </button>
      <Label htmlFor="loop-switch" className="text-sm font-medium whitespace-nowrap">Loop</Label>

      {showInfo && (
                <div className="absolute top-full -left-6 mt-1 bg-background border-primary border-2 rounded-md p-2 text-sm shadow-lg z-50 w-60">
          <div className="text-center">
            <p>Repeats the clip automatically</p>
            <p>until you stop it.</p>
          </div>
        </div>
      )}
      <Switch id="loop-switch" checked={isLooping} onCheckedChange={setIsLooping} />
    </div>
  );
}

type PracticeClipsProps = {
  clips: Clip[];
  playbackSpeed: PlaybackSpeed;
  setPlaybackSpeed: React.Dispatch<React.SetStateAction<PlaybackSpeed>>;
  isLooping: boolean;
  setIsLooping: React.Dispatch<React.SetStateAction<boolean>>;
  handleClipPlayback: (startTime: number, endTime: number) => void;
  practiceClipsRef: React.RefObject<HTMLDivElement>;
  setClips: React.Dispatch<React.SetStateAction<Clip[]>>;
  setCurrentClipIndex: React.Dispatch<React.SetStateAction<number | null>>;
  isSequenceMode: boolean;
  setIsSequenceMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export function PracticeClips({
  clips,
  playbackSpeed,
  setPlaybackSpeed,
  isLooping,
  setIsLooping,
  handleClipPlayback,
  practiceClipsRef,
  setClips,
  setCurrentClipIndex,
  isSequenceMode,
  setIsSequenceMode
}: PracticeClipsProps) {
  const isMobile = useIsMobile();

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedClips, setSelectedClips] = useState<number[]>([]);
  const [sequenceStartIndex, setSequenceStartIndex] = useState<number | null>(null);
  const [sequenceEndIndex, setSequenceEndIndex] = useState<number | null>(null);
  const [showLoopInfo, setShowLoopInfo] = useState(false);
  const [showSequenceInfo, setShowSequenceInfo] = useState(false);

  // Close info panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-info-button]')) {
        setShowLoopInfo(false);
        setShowSequenceInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



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

    // Set the current clip index to the start of the sequence
    setCurrentClipIndex(sequenceStartIndex);

    // Play from the start of the first clip to the end of the last clip
    handleClipPlayback(startClip.startTime, endClip.endTime);
  };

  const getSequenceClips = () => {
    if (sequenceStartIndex === null || sequenceEndIndex === null) return [];
    return clips.slice(sequenceStartIndex, sequenceEndIndex + 1);
  };

  if (clips.length === 0) return null;

  return (
    <div className="mt-8" ref={practiceClipsRef}>
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Clips</CardTitle>
              <CardDescription>Click a clip to play. Adjust speed or loop it.</CardDescription>
            </div>
            {!isDeleteMode && !isSequenceMode && (
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-transparent hover:bg-transparent hover:text-primary h-8 w-8 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDeleteMode();
                }}
              >
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Delete selected clips</span>
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          {/* Controls Section */}
          <div className="pt-1 space-y-4">
            {/* Playback Speed and Sequence Controls */}
            <div>
              <Label className="mb-2 block text-sm font-medium">Playback Speed</Label>
              <div className="flex items-center gap-4">
                {isMobile ? (
                  <Select value={playbackSpeed.toString()} onValueChange={(val) => setPlaybackSpeed(Number(val) as PlaybackSpeed)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select speed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.25">0.25x</SelectItem>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Tabs value={playbackSpeed.toString()} onValueChange={(val) => setPlaybackSpeed(Number(val) as PlaybackSpeed)} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                      <TabsTrigger value="0.25">0.25x</TabsTrigger>
                      <TabsTrigger value="0.5">0.5x</TabsTrigger>
                      <TabsTrigger value="0.75">0.75x</TabsTrigger>
                      <TabsTrigger value="1">1x</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
               <button
  onClick={(e) => {
    e.stopPropagation();
    toggleSequenceMode();
  }}
  className={cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-3 shrink-0",
    isSequenceMode
      ? "bg-primary text-primary-foreground shadow-md"
      : "border border-input bg-background "
  )}
>
  <List className={cn("h-4 w-4 mr-2 transition-transform duration-200", isSequenceMode && "scale-110")} />
  Create Sequence
</button>
              </div>
            </div>

            {/* Loop, Sequence, and Delete Controls */}
            <div className="flex items-center justify-between gap-5 pb-2">
              <div className="flex items-center gap-4 h-9">
                <LoopControls
                  isLooping={isLooping}
                  setIsLooping={setIsLooping}
                  showInfo={showLoopInfo}
                  setShowInfo={setShowLoopInfo}
                />

                {isSequenceMode ? (
                  <Button
                    variant="mystic"
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
                ) : null}
              </div>

              <div className="flex items-center gap-2 h-9">
                {isDeleteMode ? (
                  <>
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
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Sequence Selection Display */}
          {isSequenceMode && (
            <div className="bg-secondary-foreground/10 rounded-lg p-3 border h-32 sm:h-20 my-2">
              <div className="flex items-center gap-2 mb-2 relative">
                <List className="h-4 w-4" />
                <span className="text-sm font-medium">Sequence Selection</span>
                <button
                  data-info-button
                  className="p-1"
                  onClick={() => setShowSequenceInfo(!showSequenceInfo)}
                >
        <Info className="h-4 w-4 text-muted-foreground hover:text-primary" />
        </button>
                {showSequenceInfo && (
                <div className="absolute top-full -left-6 mt-1 bg-background border-primary border-2 rounded-md p-2 text-sm shadow-lg z-50 w-96">
                    <div className="p-1">
                      <p className="font-medium mb-1">How to create a sequence:</p>
                      <p>1. Click on the first clip you want to start with</p>
                      <p>2. Click on the last clip you want to end with</p>
                      <p>3. Click "Play Sequence" to practice all clips in order</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="overflow-y-auto">
                {(sequenceStartIndex !== null || sequenceEndIndex !== null) ? (
                  <div className="space-y-1">
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                      {sequenceStartIndex !== null && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                          <span className="text-muted-foreground">Start:</span>
                          <span className="font-mono bg-background px-2 py-1 rounded">
                            {formatTime(clips[sequenceStartIndex].startTime)} - {formatTime(clips[sequenceStartIndex].endTime)}
                          </span>
                        </div>
                      )}
                      {sequenceEndIndex !== null && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-none"></div>
                          </div>
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
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Click on clips below to select your sequence start and end points
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clips List */}
          <ScrollArea className="h-[400px] ">
            <div className="space-y-2">
              {clips.map((clip, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors",
                    isDeleteMode && selectedClips.includes(index) && "bg-muted/30 border-primary",
                    isSequenceMode && sequenceStartIndex === index && "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700",
                    isSequenceMode && sequenceEndIndex === index && "bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700",
                    isSequenceMode && sequenceStartIndex !== null && sequenceEndIndex !== null &&
                      index > sequenceStartIndex && index < sequenceEndIndex && "bg-muted/20 border-muted-foreground/20"
                  )}
                  onClick={() => {
                    if (isDeleteMode || isSequenceMode) {
                      toggleClipSelection(index);
                    } else {
                      setCurrentClipIndex(index);
                      handleClipPlayback(clip.startTime, clip.endTime);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {isSequenceMode && sequenceStartIndex === index && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    )}
                    {isSequenceMode && sequenceEndIndex === index && (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-white rounded-none"></div>
                      </div>
                    )}
                    {isSequenceMode && sequenceStartIndex !== null && sequenceEndIndex !== null &&
                      index > sequenceStartIndex && index < sequenceEndIndex && (
                      <div className="w-4 h-4 bg-muted-foreground/30 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}

                    <span className="font-mono text-sm bg-secondary-foreground/10 px-2 py-1 rounded-md">
                      {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDeleteMode && (
                      <Checkbox
                        checked={selectedClips.includes(index)}
                        onCheckedChange={() => toggleClipSelection(index)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    {!isDeleteMode && !isSequenceMode && (
                      <Button onClick={() => {
                        setCurrentClipIndex(index);
                        handleClipPlayback(clip.startTime, clip.endTime);
                      }} size="sm" variant="mystic">
                        <Play className="mr-1" />
                        Play
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
