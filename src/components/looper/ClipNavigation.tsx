"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SkipBack, SkipForward, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, PlayCircle } from "lucide-react";
import { Clip } from "@/lib/types";
import { formatTime } from "@/lib/utils";

type ClipNavigationProps = {
  clips: Clip[];
  currentClipIndex: number | null;
  setCurrentClipIndex: React.Dispatch<React.SetStateAction<number | null>>;
  handleClipPlayback: (startTime: number, endTime: number) => void;
};

export function ClipNavigation({
  clips,
  currentClipIndex,
  setCurrentClipIndex,
  handleClipPlayback
}: ClipNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Navigation functions
  const navigateToPreviousClip = useCallback(() => {
    if (currentClipIndex === null || currentClipIndex <= 0) {
      setCurrentClipIndex(clips.length - 1);
      handleClipPlayback(clips[clips.length - 1].startTime, clips[clips.length - 1].endTime);
    } else {
      setCurrentClipIndex(currentClipIndex - 1);
      handleClipPlayback(clips[currentClipIndex - 1].startTime, clips[currentClipIndex - 1].endTime);
    }
  }, [currentClipIndex, clips, handleClipPlayback, setCurrentClipIndex]);

  const navigateToNextClip = useCallback(() => {
    if (currentClipIndex === null || currentClipIndex >= clips.length - 1) {
      setCurrentClipIndex(0);
      handleClipPlayback(clips[0].startTime, clips[0].endTime);
    } else {
      setCurrentClipIndex(currentClipIndex + 1);
      handleClipPlayback(clips[currentClipIndex + 1].startTime, clips[currentClipIndex + 1].endTime);
    }
  }, [currentClipIndex, clips, handleClipPlayback, setCurrentClipIndex]);

  const navigateToFirstClip = useCallback(() => {
    if (clips.length > 0) {
      setCurrentClipIndex(0);
      handleClipPlayback(clips[0].startTime, clips[0].endTime);
    }
  }, [clips, handleClipPlayback, setCurrentClipIndex]);

  const navigateToLastClip = useCallback(() => {
    if (clips.length > 0) {
      setCurrentClipIndex(clips.length - 1);
      handleClipPlayback(clips[clips.length - 1].startTime, clips[clips.length - 1].endTime);
    }
  }, [clips, handleClipPlayback, setCurrentClipIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (clips.length === 0) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          navigateToPreviousClip();
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateToNextClip();
          break;
        case 'Home':
          event.preventDefault();
          navigateToFirstClip();
          break;
        case 'End':
          event.preventDefault();
          navigateToLastClip();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigateToPreviousClip, navigateToNextClip, navigateToFirstClip, navigateToLastClip]);

  // Don't render if no clips
  if (clips.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Backdrop with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/98 via-background/95 to-transparent backdrop-blur-md border-t border-border/50" />

      <div className={`relative container mx-auto transition-all duration-500 ease-out ${isExpanded ? 'px-3 sm:px-6 py-4' : 'px-3 sm:px-4 py-2'}`}>
        <div className={`
          relative overflow-hidden rounded-xl transition-all duration-500 ease-out
          ${isExpanded
            ? 'bg-card/90 backdrop-blur-sm border border-border/60 shadow-lg shadow-black/5 p-3 sm:p-5'
            : 'bg-card/80 backdrop-blur-sm border border-border/40 shadow-md shadow-black/3 p-2 sm:p-3'
          }
        `}>

          {/* Minimized view */}
          {!isExpanded && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary">
                  <PlayCircle className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">Clip Navigation</span>
                  {currentClipIndex !== null && (
                    <span className="text-xs text-muted-foreground">
                      {currentClipIndex + 1} of {clips.length}
                    </span>
                  )}
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(true)}
                      className="h-8 w-8 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>Expand navigation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Expanded view */}
          {isExpanded && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                    <PlayCircle className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold text-foreground">Clip Navigation</Label>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>Use arrow keys or buttons</span>
                      <div className="flex gap-1">
                        <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">←</kbd>
                        <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">→</kbd>
                      </div>
                    </div>
                  </div>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(false)}
                        className="h-9 w-9 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p>Collapse navigation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {/* First button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={navigateToFirstClip}
                        disabled={clips.length === 0}
                        className="h-9 sm:h-10 px-2 sm:px-4 rounded-lg border-border/60 hover:bg-accent/50 hover:border-border transition-all duration-200 disabled:opacity-50"
                      >
                        <SkipBack className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2 text-sm font-medium">First</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p>Jump to first clip (Home)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Previous button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={navigateToPreviousClip}
                        disabled={clips.length === 0}
                        className="h-9 sm:h-10 px-2 sm:px-4 rounded-lg border-border/60 hover:bg-accent/50 hover:border-border transition-all duration-200 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2 text-sm font-medium">Previous</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p>Previous clip (←)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Current clip indicator */}
                <div className="px-3 sm:px-6 py-2 sm:py-3 bg-background/95 backdrop-blur-sm rounded-xl border border-border shadow-sm min-w-[120px] sm:min-w-[160px] text-center">
                  <div className="text-sm font-semibold text-foreground">
                    {currentClipIndex !== null ? (
                      <>
                        <span className="text-primary">{currentClipIndex + 1}</span>
                        <span className="text-muted-foreground mx-1">of</span>
                        <span>{clips.length}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No clip selected</span>
                    )}
                  </div>
                  {currentClipIndex !== null && (
                    <div className="text-xs text-muted-foreground mt-1 font-mono">
                      {formatTime(clips[currentClipIndex].startTime)} - {formatTime(clips[currentClipIndex].endTime)}
                    </div>
                  )}
                </div>

                {/* Next button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={navigateToNextClip}
                        disabled={clips.length === 0}
                        className="h-9 sm:h-10 px-2 sm:px-4 rounded-lg border-border/60 hover:bg-accent/50 hover:border-border transition-all duration-200 disabled:opacity-50"
                      >
                        <span className="hidden sm:inline mr-2 text-sm font-medium">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p>Next clip (→)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Last button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={navigateToLastClip}
                        disabled={clips.length === 0}
                        className="h-9 sm:h-10 px-2 sm:px-4 rounded-lg border-border/60 hover:bg-accent/50 hover:border-border transition-all duration-200 disabled:opacity-50"
                      >
                        <span className="hidden sm:inline mr-2 text-sm font-medium">Last</span>
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p>Jump to last clip (End)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
