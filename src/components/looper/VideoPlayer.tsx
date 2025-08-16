"use client";

import YouTube, { YouTubePlayer } from 'react-youtube';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Info } from "lucide-react";
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
  return (
    <div className="mt-8" ref={videoPlayerRef}>
      <Card className="shadow-lg h-full">
        <CardHeader>
            <CardTitle>
              Video
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("aspect-video relative bg-muted rounded-md flex items-center justify-center transition-transform duration-300", isMirrored && "scale-x-[-1]")}>
            {isPlayerLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="mt-2 text-sm">Initializing player...</p>
              </div>
            )}
            <YouTube
              videoId={videoId}
              className={cn("w-full h-full", isPlayerLoading && "invisible")}
              iframeClassName="w-full h-full rounded-md"
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
        <CardFooter className="flex-row-reverse pt-6">
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
        </CardFooter>
      </Card>
    </div>
  );
}
