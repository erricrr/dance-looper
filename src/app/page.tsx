
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import YouTube, { YouTubePlayer } from 'react-youtube';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Clip, PlaybackSpeed, formSchema } from "@/lib/types";
import { getYoutubeVideoId } from "@/lib/utils";
import { UrlForm } from "@/components/looper/UrlForm";
import { ClipCreator } from "@/components/looper/ClipCreator";
import { VideoPlayer } from "@/components/looper/VideoPlayer";
import { PracticeClips } from "@/components/looper/PracticeClips";
import { ClipNavigation } from "@/components/looper/ClipNavigation";
import { AboutDrawer } from "@/components/AboutDrawer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [clips, setClips] = useState<Clip[]>([]);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [currentClip, setCurrentClip] = useState<{startTime: number, endTime: number} | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true); // Keeping for compatibility but not used
  const [savedUrls, setSavedUrls] = useState<string[]>([]);
  const [currentClipIndex, setCurrentClipIndex] = useState<number | null>(null);
  const [isSequenceMode, setIsSequenceMode] = useState(false);
  const [clipCreatorResetKey, setClipCreatorResetKey] = useState(0);
  const clipIntervalRef = useRef<NodeJS.Timeout>();

  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const practiceClipsRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  const clipCreatorRef = useRef<HTMLDivElement>(null);

  const urlForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { youtubeUrl: "" },
  });

  useEffect(() => {
    try {
      const storedUrls = localStorage.getItem("danceLooperUrls");
      if (storedUrls) {
        setSavedUrls(JSON.parse(storedUrls));
      }
    } catch (error) {
      console.error("Failed to load saved URLs from localStorage", error);
    }
  }, []);

  const onUrlSubmit = async (values: z.infer<typeof formSchema>) => {
    const extractedVideoId = getYoutubeVideoId(values.youtubeUrl);
    if (!extractedVideoId) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Could not extract video ID from the YouTube URL.",
      });
      return;
    }

    // Check if the same video is already loaded
    if (videoId === extractedVideoId) {
      toast({
        title: "Video Already Loaded",
        description: "This video is already loaded and ready to use.",
      });
      return;
    }

    setIsUrlLoading(true);
    setIsPlayerLoading(true);
    setClips([]);
    setVideoId(null);
    setVideoDuration(0);
    setCurrentClip(null);
    setCurrentClipIndex(null);
    setIsSequenceMode(false);
    setClipCreatorResetKey(prev => prev + 1); // Reset ClipCreator state
    if(player) player.stopVideo();

    setVideoId(extractedVideoId);
  };

  const loadSavedUrl = (url: string) => {
    urlForm.setValue("youtubeUrl", url);
    onUrlSubmit({ youtubeUrl: url });
  };

  const handleClipPlayback = (startTime: number, endTime: number) => {
    if (!player) return;

    if (player && typeof player.setPlaybackRate === 'function') {
      player.setPlaybackRate(playbackSpeed);
    }
    setCurrentClip({startTime, endTime});

    // Find the clip index that matches the start and end times
    const clipIndex = clips.findIndex(clip =>
      Math.abs(clip.startTime - startTime) < 0.1 && Math.abs(clip.endTime - endTime) < 0.1
    );
    setCurrentClipIndex(clipIndex >= 0 ? clipIndex : null);

    player.seekTo(startTime, true);
    player.playVideo();
    videoPlayerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    const readyPlayer = event.target;
    setPlayer(readyPlayer);
    const duration = readyPlayer.getDuration();
    setVideoDuration(duration);
    if (readyPlayer && typeof readyPlayer.setPlaybackRate === 'function') {
      readyPlayer.setPlaybackRate(playbackSpeed);
    }
    setIsUrlLoading(false);
    setIsPlayerLoading(false);
    // Form is now always open, no need to close it
  };

  const onPlayerStateChange = (event: { data: number }) => {
    const isNowPlaying = event.data === YouTube.PlayerState.PLAYING;
    setIsPlaying(isNowPlaying);

    // Handle video ending - if we're looping and have a current clip, restart it
    if (event.data === YouTube.PlayerState.ENDED && isLooping && currentClip && player) {
      player.seekTo(currentClip.startTime, true);
      player.playVideo();
    }
  };

  useEffect(() => {
    if (isPlaying && currentClip && player) {
        clipIntervalRef.current = setInterval(() => {
            if (player && typeof player.getCurrentTime === 'function') {
                const currentTime = player.getCurrentTime();
                // Add a small tolerance (0.1 seconds) to handle cases where currentTime
                // might not exactly reach endTime, especially for clips ending at video duration
                const tolerance = 0.1;
                const isClipFinished = currentTime >= (currentClip.endTime - tolerance);

                // Special handling for clips that end at or very close to video duration
                const isLastClip = Math.abs(currentClip.endTime - videoDuration) < 0.5;
                const isAtVideoEnd = Math.abs(currentTime - videoDuration) < 0.5;

                if (isClipFinished || (isLastClip && isAtVideoEnd)) {
                    if (isLooping) {
                      player.seekTo(currentClip.startTime, true);
                    } else {
                      player.pauseVideo();
                      setCurrentClip(null);
                    }
                }
            }
        }, 100);
    }

    return () => {
      if(clipIntervalRef.current) {
        clearInterval(clipIntervalRef.current);
        clipIntervalRef.current = undefined;
      }
    };
  }, [isPlaying, currentClip, player, isLooping, videoDuration]);

  useEffect(() => {
    if (player && typeof player.setPlaybackRate === 'function' && isPlaying) {
      player.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed, player, isPlaying]);

    useEffect(() => {
    if (videoId && videoDuration > 0) {
      setTimeout(() => {
        clipCreatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500); // Wait for video to be fully loaded and Create Clips to be expanded
    }
  }, [videoId, videoDuration]);

  return (
    <ErrorBoundary>
      <main className="container mx-auto px-4 py-8 md:py-16 pb-24 relative">
        <AboutDrawer />
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold font-headline tracking-tight mb-4">
            Dalooper
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Paste a YouTube link to break videos into clips — loop them as you learn.
          </p>
        </header>

        <UrlForm
          isUrlLoading={isUrlLoading}
          onUrlSubmit={onUrlSubmit}
          savedUrls={savedUrls}
          setSavedUrls={setSavedUrls}
          loadSavedUrl={loadSavedUrl}
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
        />

        {isUrlLoading && !videoId && (
           <div className="mt-12 max-w-2xl mx-auto text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Loading video...</p>
          </div>
        )}

        {videoId && (
          <div ref={resultsRef} className="mt-8 max-w-4xl mx-auto">
            <div ref={clipCreatorRef}>
              <ClipCreator
                player={player}
                videoDuration={videoDuration}
                isPlayerLoading={isPlayerLoading}
                clips={clips}
                setClips={setClips}
                practiceClipsRef={practiceClipsRef}
                isOpen={true}
                resetKey={clipCreatorResetKey}
              />
            </div>

            <VideoPlayer
              videoId={videoId}
              isPlayerLoading={isPlayerLoading}
              isMirrored={isMirrored}
              setIsMirrored={setIsMirrored}
              onPlayerReady={onPlayerReady}
              onPlayerStateChange={onPlayerStateChange}
              videoPlayerRef={videoPlayerRef}
            />

            <PracticeClips
              clips={clips}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              isLooping={isLooping}
              setIsLooping={setIsLooping}
              handleClipPlayback={handleClipPlayback}
              practiceClipsRef={practiceClipsRef}
              setClips={setClips}
              setCurrentClipIndex={setCurrentClipIndex}
              isSequenceMode={isSequenceMode}
              setIsSequenceMode={setIsSequenceMode}
            />
          </div>
        )}

        <ClipNavigation
          clips={clips}
          currentClipIndex={currentClipIndex}
          setCurrentClipIndex={setCurrentClipIndex}
          handleClipPlayback={handleClipPlayback}
          isSequenceMode={isSequenceMode}
        />
      </main>
    </ErrorBoundary>
  );
}
