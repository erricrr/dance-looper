"use client";

import { useState, useEffect, useRef } from "react";
import YouTube, { YouTubePlayer } from 'react-youtube';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Info, Maximize2, Minimize2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [showMirrorInfo, setShowMirrorInfo] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Close info panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-info-button]')) {
        setShowMirrorInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <div className="flex items-center gap-2 relative">
              <Label htmlFor="mirror-switch" className="text-sm font-medium">Mirror</Label>
              <button
                data-info-button
                className="p-1 rounded-md hover:bg-muted active:bg-muted transition-colors"
                onClick={() => setShowMirrorInfo(!showMirrorInfo)}
              >
                <Info className="h-4 w-4 text-muted-foreground" />
              </button>
              {showMirrorInfo && (
                <div className="absolute top-full left-0 mt-1 bg-background border rounded-md p-2 text-sm shadow-lg z-50 w-80">
                  <div className="text-center">
                    <p>Flips the video horizontally</p>
                    <p>to make it easier to follow along.</p>
                  </div>
                </div>
              )}
              <Switch id="mirror-switch" checked={isMirrored} onCheckedChange={setIsMirrored} />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullScreen}
              className="flex items-center gap-2"
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isFullScreen ? "Exit Full Window" : "Full Window"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Full Screen Overlay with Close Button */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute top-20 right-7 pointer-events-auto">
            <Button
              variant="mystic"
              size="sm"
              onClick={closeFullScreen}
              className="border"
            >
              <X/>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
