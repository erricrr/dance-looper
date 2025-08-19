"use client";

import YouTube, { YouTubePlayer } from 'react-youtube';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Info, Maximize2, Minimize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

type VideoPlayerProps = {
  videoId: string;
  isPlayerLoading: boolean;
  isMirrored: boolean;
  setIsMirrored: React.Dispatch<React.SetStateAction<boolean>>;
  onPlayerReady: (event: { target: YouTubePlayer }) => void;
  onPlayerStateChange: (event: { data: number }) => void;
  videoPlayerRef: React.RefObject<HTMLDivElement>;
};

export function VideoPlayer({
  videoId,
  isPlayerLoading,
  isMirrored,
  setIsMirrored,
  onPlayerReady,
  onPlayerStateChange,
  videoPlayerRef
}: VideoPlayerProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
  };

  // Handle escape key to close full screen
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        closeFullScreen();
      }
    };

    if (isFullScreen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isFullScreen]);

  return (
    <>
      <div className="mt-8" ref={videoPlayerRef}>
        <Card className="shadow-lg h-full">
          <CardHeader>
            <CardTitle>
              Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={videoContainerRef}
              className={cn(
                "aspect-video relative bg-muted rounded-md flex items-center justify-center transition-all duration-300",
                isMirrored && "scale-x-[-1]",
                isFullScreen && "fixed inset-0 z-40 bg-black rounded-none aspect-auto"
              )}
            >
              {isPlayerLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="mt-2 text-sm">Initializing player...</p>
                </div>
              )}
              <YouTube
                videoId={videoId}
                className={cn("w-full h-full", isPlayerLoading && "invisible")}
                iframeClassName={cn(
                  "w-full h-full",
                  isFullScreen ? "rounded-none" : "rounded-md"
                )}
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
                opts={{
                  playerVars: {
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                  },
                }}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="mirror-switch" className="text-sm font-medium">Mirror</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p>Flips the video horizontally</p>
                      <p>to make it easier to follow along.</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Switch id="mirror-switch" checked={isMirrored} onCheckedChange={setIsMirrored} />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullScreen}
                    className="flex items-center gap-2"
                  >
                    {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    {isFullScreen ? "Exit Full Window" : "Full Window"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle full window mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </Card>
      </div>

      {/* Full Screen Overlay with Close Button */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute top-4 right-4 pointer-events-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={closeFullScreen}
              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
