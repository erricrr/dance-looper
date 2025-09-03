"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SkipBack, SkipForward, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, PlayCircle, PauseCircle } from "lucide-react";
import { Clip } from "@/lib/types";
import { formatTime } from "@/lib/utils";

type ClipNavigationProps = {
  clips: Clip[];
  currentClipIndex: number | null;
  setCurrentClipIndex: React.Dispatch<React.SetStateAction<number | null>>;
  handleClipPlayback: (startTime: number, endTime: number, shouldPlay?: boolean) => void;
  handlePause: () => void;
  handleResume: () => void;
  currentClip: {startTime: number, endTime: number} | null;
  isSequenceMode: boolean;
  isPlaying: boolean;
};

export function ClipNavigation({
  clips,
  currentClipIndex,
  setCurrentClipIndex,
  handleClipPlayback,
  handlePause,
  handleResume,
  currentClip,
  isSequenceMode,
  isPlaying,
}: ClipNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const navigateToPreviousClip = useCallback(() => {
    if (clips.length === 0) return;
    if (currentClipIndex === null || currentClipIndex <= 0) {
      const lastClip = clips[clips.length - 1];
      if (lastClip) {
        setCurrentClipIndex(clips.length - 1);
        handleClipPlayback(lastClip.startTime, lastClip.endTime, true);
      }
    } else {
      const prevClip = clips[currentClipIndex - 1];
      if (prevClip) {
        setCurrentClipIndex(currentClipIndex - 1);
        handleClipPlayback(prevClip.startTime, prevClip.endTime, true);
      }
    }
  }, [currentClipIndex, clips, handleClipPlayback, setCurrentClipIndex]);

  const navigateToNextClip = useCallback(() => {
    if (clips.length === 0) return;
    if (currentClipIndex === null || currentClipIndex >= clips.length - 1) {
      const firstClip = clips[0];
      if (firstClip) {
        setCurrentClipIndex(0);
        handleClipPlayback(firstClip.startTime, firstClip.endTime, true);
      }
    } else {
      const nextClip = clips[currentClipIndex + 1];
      if (nextClip) {
        setCurrentClipIndex(currentClipIndex + 1);
        handleClipPlayback(nextClip.startTime, nextClip.endTime, true);
      }
    }
  }, [currentClipIndex, clips, handleClipPlayback, setCurrentClipIndex]);

  const navigateToFirstClip = useCallback(() => {
    if (clips.length > 0) {
      const firstClip = clips[0];
      if (firstClip) {
        setCurrentClipIndex(0);
        handleClipPlayback(firstClip.startTime, firstClip.endTime, true);
      }
    }
  }, [clips, handleClipPlayback, setCurrentClipIndex]);

  const navigateToLastClip = useCallback(() => {
    if (clips.length > 0) {
      const lastClip = clips[clips.length - 1];
      if (lastClip) {
        setCurrentClipIndex(clips.length - 1);
        handleClipPlayback(lastClip.startTime, lastClip.endTime, true);
      }
    }
  }, [clips, handleClipPlayback, setCurrentClipIndex]);

  const togglePlayPause = useCallback(() => {
    console.log('togglePlayPause called:', { currentClipIndex, isPlaying });
    if (currentClipIndex !== null) {
      if (isPlaying) {
        console.log('Calling handlePause');
        handlePause();
      } else {
        // Check if we have a current clip and are resuming
        if (currentClip && isPlaying === false) {
          console.log('Calling handleResume');
          handleResume();
        } else {
          console.log('Calling handleClipPlayback with shouldPlay: true');
          const currentClipData = clips[currentClipIndex];
          if (currentClipData) {
            handleClipPlayback(
              currentClipData.startTime,
              currentClipData.endTime,
              true
            );
          }
        }
      }
    }
  }, [currentClipIndex, clips, isPlaying, handleClipPlayback, handlePause, handleResume]);

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
        case ' ':
          event.preventDefault();
          togglePlayPause();
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigateToPreviousClip, navigateToNextClip, navigateToFirstClip, navigateToLastClip, togglePlayPause]);

  if (clips.length === 0 || isSequenceMode) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-t from-background/98 via-background/95 to-transparent backdrop-blur-md border-t border-border/50" />
      <div className={`relative container mx-auto transition-all duration-500 ease-out ${isExpanded ? 'px-2 xs:px-3 sm:px-6 py-4' : 'px-2 xs:px-3 sm:px-4 py-2'}`}>
        <div className={`
          relative overflow-hidden rounded-xl transition-all duration-500 ease-out
          ${isExpanded
            ? 'bg-card/90 backdrop-blur-sm border border-border/60 shadow-lg shadow-black/5 p-2 xs:p-3 sm:p-5'
            : 'bg-card/80 backdrop-blur-sm border border-border/40 shadow-md shadow-black/3 p-2 xs:p-3'
          }
        `}>
          {/* Minimized view */}
          {!isExpanded && (
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => setIsExpanded(true)}
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-md text-primary">
                  {isPlaying ? (
                    <PauseCircle className="h-4 w-4" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">Clip Navigation</span>
                  {currentClipIndex !== null ? (
                    <span className="text-xs text-muted-foreground">
                      {currentClipIndex + 1} of {clips.length}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No clip selected
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="h-8 w-8 hover:bg-transparent"
                  aria-label="Expand section"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {/* Expanded view */}
          {isExpanded && (
            <>
              {/* Header and Clip Info (inline) */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg text-primary">
                    {isPlaying ? (
                      <PauseCircle className="h-4 w-4" />
                    ) : (
                      <PlayCircle className="h-4 w-4" />
                    )}
                  </div>
                  <Label className="text-base hidden sm:block text-center font-semibold text-foreground">
                  Clip Navigation
                    </Label>
                  {currentClipIndex !== null && clips[currentClipIndex] ? (
                    <div className="flex items-center gap-2 -ml-1 sm:ml-4 text-sm">
                      <span className="text-primary font-semibold">{currentClipIndex + 1}</span>
                      <span className="text-muted-foreground">of {clips.length}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        ({formatTime(clips[currentClipIndex].startTime)} - {formatTime(clips[currentClipIndex].endTime)})
                    </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 -ml-1 sm:ml-4 text-sm">
                      <span className="text-muted-foreground">No clip selected</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-9 w-9 hover:bg-transparent"
                  aria-label="Collapse section"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToFirstClip}
                  disabled={clips.length === 0}
                  className="h-9 px-3 rounded-lg border-border/60 hover:bg-primary hover:border-border hover:text-primary-foreground transition-all duration-200 disabled:opacity-50 flex-shrink-0"
                >
                  <SkipBack className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2 text-sm font-medium">First</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToPreviousClip}
                  disabled={clips.length === 0}
                  className="h-9 px-3 rounded-lg border-border/60 hover:bg-primary hover:border-border hover:text-primary-foreground transition-all duration-200 disabled:opacity-50 flex-shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2 text-sm font-medium">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayPause}
                  disabled={currentClipIndex === null}
                  className="h-9 px-3 rounded-lg border-border/60 hover:bg-primary hover:border-border hover:text-primary-foreground transition-all duration-200 disabled:opacity-50 flex-shrink-0"
                >
                  {isPlaying ? (
                    <PauseCircle className="h-4 w-4" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline ml-2 text-sm font-medium">
                    {isPlaying ? "Pause" : "Play"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToNextClip}
                  disabled={clips.length === 0}
                  className="h-9 px-3 rounded-lg border-border/60 hover:bg-primary hover:border-border hover:text-primary-foreground transition-all duration-200 disabled:opacity-50 flex-shrink-0"
                >
                  <span className="hidden sm:inline mr-2 text-sm font-medium">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToLastClip}
                  disabled={clips.length === 0}
                  className="h-9 px-3 rounded-lg border-border/60 hover:bg-primary hover:border-border hover:text-primary-foreground transition-all duration-200 disabled:opacity-50 flex-shrink-0"
                >
                  <span className="hidden sm:inline mr-2 text-sm font-medium">Last</span>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
