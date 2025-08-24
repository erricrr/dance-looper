
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
  const [sequenceClips, setSequenceClips] = useState<Clip[]>([]);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState<number>(0);
  const [clipCreatorResetKey, setClipCreatorResetKey] = useState(0);
  const [isResumingFromPause, setIsResumingFromPause] = useState(false);
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
    if(player) {
      try {
        player.stopVideo();
      } catch (error) {
        console.error('Error stopping video:', error);
      }
    }

    // Clear sequence state when loading new video
    setIsSequenceMode(false);
    setSequenceClips([]);
    setCurrentSequenceIndex(0);

    setVideoId(extractedVideoId);
  };

  const loadSavedUrl = (url: string) => {
    urlForm.setValue("youtubeUrl", url);
    onUrlSubmit({ youtubeUrl: url });
  };

  const handleClipPlayback = (startTime: number, endTime: number, shouldPlay: boolean = true) => {
    if (!player) return;

    console.log('handleClipPlayback called:', { startTime, endTime, shouldPlay });

    try {
      // Exit sequence mode if we're manually playing a clip
      if (isSequenceMode) {
        setIsSequenceMode(false);
        setSequenceClips([]);
        setCurrentSequenceIndex(0);
      }

      if (player && typeof player.setPlaybackRate === 'function') {
        player.setPlaybackRate(playbackSpeed);
      }

      // Find the clip index that matches the start and end times
      const clipIndex = clips.findIndex(clip =>
        Math.abs(clip.startTime - startTime) < 0.1 && Math.abs(clip.endTime - endTime) < 0.1
      );
      setCurrentClipIndex(clipIndex >= 0 ? clipIndex : null);

      // Always seek to start time and set current clip when this function is called
      setCurrentClip({startTime, endTime});
      player.seekTo(startTime, true);

      if (shouldPlay) {
        player.playVideo();
      }

      videoPlayerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      console.error('Error in handleClipPlayback:', error);
      // Don't throw the error, just log it to prevent the app from crashing
    }
  };

  const handlePause = () => {
    console.log('handlePause called');
    if (!player) return;
    try {
      player.pauseVideo();
    } catch (error) {
      console.error('Error in handlePause:', error);
    }
  };

  const handleResume = () => {
    console.log('handleResume called');
    if (!player) return;
    try {
      player.playVideo();
      videoPlayerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      console.error('Error in handleResume:', error);
    }
  };

  const handleSequencePlayback = (sequenceClips: Clip[]) => {
    if (!player || sequenceClips.length === 0) return;

    console.log('handleSequencePlayback called:', sequenceClips);

    setSequenceClips(sequenceClips);
    setCurrentSequenceIndex(0);
    setIsSequenceMode(true);

    // Play the first clip in the sequence
    const firstClip = sequenceClips[0];
    setCurrentClip({ startTime: firstClip.startTime, endTime: firstClip.endTime });
    setCurrentClipIndex(null); // Clear individual clip index since we're in sequence mode

    try {
      player.setPlaybackRate(playbackSpeed);
      player.seekTo(firstClip.startTime, true);
      player.playVideo();

      // Auto-scroll to video player
      videoPlayerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      console.error('Error in handleSequencePlayback:', error);
    }
  };

  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    try {
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
    } catch (error) {
      console.error('Error in onPlayerReady:', error);
      setIsUrlLoading(false);
      setIsPlayerLoading(false);
    }
  };

  const onPlayerStateChange = (event: { data: number }) => {
    const isNowPlaying = event.data === YouTube.PlayerState.PLAYING;
    setIsPlaying(isNowPlaying);

    // Handle video ending - if we're looping and have a current clip, restart it
    if (event.data === YouTube.PlayerState.ENDED && isLooping && currentClip && player) {
      try {
        player.seekTo(currentClip.startTime, true);
        player.playVideo();
      } catch (error) {
        console.error('Error in onPlayerStateChange:', error);
      }
    }
  };

  useEffect(() => {
    if (isPlaying && currentClip && player) {
        clipIntervalRef.current = setInterval(() => {
            if (player && typeof player.getCurrentTime === 'function' && currentClip) {
                try {
                    const currentTime = player.getCurrentTime();
                    // Add a small tolerance (0.1 seconds) to handle cases where currentTime
                    // might not exactly reach endTime, especially for clips ending at video duration
                    const tolerance = 0.1;
                    const isClipFinished = currentTime >= (currentClip.endTime - tolerance);

                    // Special handling for clips that end at or very close to video duration
                    const isLastClip = Math.abs(currentClip.endTime - videoDuration) < 0.5;
                    const isAtVideoEnd = Math.abs(currentTime - videoDuration) < 0.5;

                    if (isClipFinished || (isLastClip && isAtVideoEnd)) {
                        if (isSequenceMode && sequenceClips.length > 0) {
                          // Handle sequence mode - advance to next clip
                          const nextIndex = currentSequenceIndex + 1;
                          if (nextIndex < sequenceClips.length) {
                            // Play next clip in sequence
                            const nextClip = sequenceClips[nextIndex];
                            setCurrentSequenceIndex(nextIndex);
                            setCurrentClip({ startTime: nextClip.startTime, endTime: nextClip.endTime });
                            player.seekTo(nextClip.startTime, true);
                          } else {
                            // Sequence is complete
                            if (isLooping) {
                              // Restart sequence from beginning
                              const firstClip = sequenceClips[0];
                              setCurrentSequenceIndex(0);
                              setCurrentClip({ startTime: firstClip.startTime, endTime: firstClip.endTime });
                              player.seekTo(firstClip.startTime, true);
                            } else {
                              // Stop sequence
                              player.pauseVideo();
                              setCurrentClip(null);
                              setIsSequenceMode(false);
                              setSequenceClips([]);
                              setCurrentSequenceIndex(0);
                            }
                          }
                        } else if (isLooping) {
                          // Handle single clip looping
                          player.seekTo(currentClip.startTime, true);
                        } else {
                          // Handle single clip completion
                          player.pauseVideo();
                          setCurrentClip(null);
                        }
                    }
                } catch (error) {
                    console.error('Error in clip interval:', error);
                    // Clear the interval if there's an error to prevent repeated failures
                    if (clipIntervalRef.current) {
                        clearInterval(clipIntervalRef.current);
                        clipIntervalRef.current = undefined;
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
  }, [isPlaying, currentClip, player, isLooping, videoDuration, isSequenceMode, sequenceClips, currentSequenceIndex]);

  useEffect(() => {
    if (player && typeof player.setPlaybackRate === 'function' && isPlaying) {
      try {
        player.setPlaybackRate(playbackSpeed);
      } catch (error) {
        console.error('Error setting playback speed:', error);
      }
    }
  }, [playbackSpeed, player, isPlaying]);

  // Clear current clip when clips array changes (e.g., when segmentation settings are modified)
  useEffect(() => {
    if (currentClip && clips.length > 0) {
      // Check if the current clip still exists in the new clips array
      const clipStillExists = clips.some(clip =>
        Math.abs(clip.startTime - currentClip.startTime) < 0.1 &&
        Math.abs(clip.endTime - currentClip.endTime) < 0.1
      );

      if (!clipStillExists) {
        setCurrentClip(null);
        setCurrentClipIndex(null);
      }
    }
  }, [clips, currentClip]);

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
              handleSequencePlayback={handleSequencePlayback}
              practiceClipsRef={practiceClipsRef}
              setClips={setClips}
              setCurrentClipIndex={setCurrentClipIndex}
              currentClipIndex={currentClipIndex}
              isSequenceMode={isSequenceMode}
              setIsSequenceMode={setIsSequenceMode}
              sequenceClips={sequenceClips}
              currentSequenceIndex={currentSequenceIndex}
            />
          </div>
        )}

        <ClipNavigation
          clips={clips}
          currentClipIndex={currentClipIndex}
          setCurrentClipIndex={setCurrentClipIndex}
          handleClipPlayback={handleClipPlayback}
          handlePause={handlePause}
          handleResume={handleResume}
          currentClip={currentClip}
          isSequenceMode={isSequenceMode}
          isPlaying={isPlaying}
        />
      </main>
    </ErrorBoundary>
  );
}
