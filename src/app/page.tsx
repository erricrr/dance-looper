
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
import { SequencePlayer } from "@/components/looper/SequencePlayer";

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

  const [clipCreatorResetKey, setClipCreatorResetKey] = useState(0);
  const [isResumingFromPause, setIsResumingFromPause] = useState(false);

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
        console.log('Exiting sequence mode due to manual clip playback');
        setIsSequenceMode(false);
        setSequenceClips([]);
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

      console.log('Clip playback started successfully:', {
        startTime,
        endTime,
        shouldPlay,
        playerState: player.getPlayerState(),
        currentTime: player.getCurrentTime()
      });

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

      // Log current state for debugging
      if (currentClip) {
        console.log('Paused clip:', {
          startTime: currentClip.startTime,
          endTime: currentClip.endTime,
          isSequence: isSequenceMode,
          currentTime: player.getCurrentTime()
        });
      }
    } catch (error) {
      console.error('Error in handlePause:', error);
    }
  };

  const handleResume = () => {
    console.log('handleResume called');
    if (!player) return;
    try {
      player.playVideo();

      // Log current state for debugging
      if (currentClip) {
        console.log('Resumed clip:', {
          startTime: currentClip.startTime,
          endTime: currentClip.endTime,
          isSequence: isSequenceMode,
          currentTime: player.getCurrentTime()
        });
      }

      videoPlayerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      console.error('Error in handleResume:', error);
    }
  };

  const [sequenceStartFunction, setSequenceStartFunction] = useState<((clips: Clip[]) => void) | null>(null);
  const fallbackSequenceIntervalRef = useRef<NodeJS.Timeout>();

  // Debug when sequence function becomes available
  useEffect(() => {
    if (sequenceStartFunction) {
      console.log('Sequence start function is now ready');
    } else {
      console.log('Sequence start function is NOT ready');
    }
  }, [sequenceStartFunction]);

  // Debug component mounting and player state
  useEffect(() => {
    console.log('Main page state update:', {
      player: !!player,
      videoDuration,
      sequenceStartFunction: !!sequenceStartFunction,
      isSequenceMode
    });
  }, [player, videoDuration, sequenceStartFunction, isSequenceMode]);

  // Cleanup fallback sequence interval when sequence mode changes
  useEffect(() => {
    return () => {
      if (fallbackSequenceIntervalRef.current) {
        clearInterval(fallbackSequenceIntervalRef.current);
        fallbackSequenceIntervalRef.current = undefined;
      }
    };
  }, [isSequenceMode]);

  const handleSequencePlayback = (sequenceClips: Clip[]) => {
    console.log('handleSequencePlayback called with:', {
      sequenceClips,
      type: typeof sequenceClips,
      isArray: Array.isArray(sequenceClips),
      length: sequenceClips?.length
    });

    if (!player || !sequenceClips || sequenceClips.length === 0) {
      console.error('Invalid sequence clips:', sequenceClips);
      return;
    }

    console.log('Starting sequence playback for clips:', sequenceClips);

    // Use the SequencePlayer component to handle the sequence
    if (sequenceStartFunction) {
      console.log('Calling sequenceStartFunction with:', sequenceClips);
      sequenceStartFunction(sequenceClips);
      videoPlayerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
      console.log('SequencePlayer not ready - using fallback sequence logic');

      // Fallback: implement basic sequence logic directly here
      try {
        const firstClip = sequenceClips[0];
        const lastClip = sequenceClips[sequenceClips.length - 1];
        const startTime = firstClip.startTime;
        const endTime = Math.min(lastClip.endTime, videoDuration);

        console.log('Fallback sequence created:', { startTime, endTime, videoDuration });

        // Set as current clip
        setCurrentClip({ startTime, endTime });
        setCurrentClipIndex(null);
        setIsSequenceMode(true);
        setSequenceClips(sequenceClips);

                // Start playback
        player.setPlaybackRate(playbackSpeed);
        player.seekTo(startTime, true);
        player.playVideo();

        videoPlayerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

                console.log('Fallback sequence started successfully');
        console.log('Fallback sequence monitoring active - will stop at:', endTime.toFixed(2));

        // Set up monitoring for the fallback sequence
        fallbackSequenceIntervalRef.current = setInterval(() => {
          if (!player || !isSequenceMode) {
            if (fallbackSequenceIntervalRef.current) {
              clearInterval(fallbackSequenceIntervalRef.current);
              fallbackSequenceIntervalRef.current = undefined;
            }
            return;
          }

          try {
            const currentTime = player.getCurrentTime();
            const playerState = player.getPlayerState();

            // Check if player is actually playing
            if (playerState !== YouTube.PlayerState.PLAYING) {
              return;
            }

            // Check if sequence should end
            if (currentTime >= endTime) {
              console.log('Fallback sequence ending at:', currentTime.toFixed(2));

              if (isLooping) {
                // Loop the sequence
                console.log('Looping fallback sequence from:', startTime);
                player.seekTo(startTime, true);
              } else {
                // End the sequence but stay in sequence mode
                console.log('Ending fallback sequence');
                player.pauseVideo();
                setCurrentClip(null);
                // Don't exit sequence mode - keep the user in "Create Sequence" mode
                // setIsSequenceMode(false);
                // setSequenceClips([]);
              }

              if (fallbackSequenceIntervalRef.current) {
                clearInterval(fallbackSequenceIntervalRef.current);
                fallbackSequenceIntervalRef.current = undefined;
              }
            }
          } catch (error) {
            console.error('Error in fallback sequence monitoring:', error);
            if (fallbackSequenceIntervalRef.current) {
              clearInterval(fallbackSequenceIntervalRef.current);
              fallbackSequenceIntervalRef.current = undefined;
            }
          }
        }, 100); // Check every 100ms
      } catch (error) {
        console.error('Error in fallback sequence logic:', error);
        toast({
          variant: "destructive",
          title: "Sequence Error",
          description: "Failed to start sequence. Please try again.",
        });
      }
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
        // Restart any clip from its start time
        console.log('Video ended, restarting clip:', {
          startTime: currentClip.startTime,
          endTime: currentClip.endTime
        });
        player.seekTo(currentClip.startTime, true);
        player.playVideo();
      } catch (error) {
        console.error('Error in onPlayerStateChange:', error);
      }
    }
  };

  // Monitor individual clips (not sequences)
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isPlaying && currentClip && player && !isSequenceMode) {
        console.log('Starting individual clip monitoring for:', {
            startTime: currentClip.startTime,
            endTime: currentClip.endTime
        });

        const intervalTime = 100; // Check every 100ms

        intervalId = setInterval(() => {
            if (player && typeof player.getCurrentTime === 'function' && currentClip) {
                try {
                    const currentTime = player.getCurrentTime();
                    const playerState = player.getPlayerState();

                    // Check if player is actually playing
                    if (playerState !== YouTube.PlayerState.PLAYING) {
                        return;
                    }

                    // Simple: clip is finished when we reach or pass the end time
                    const isClipFinished = currentTime >= currentClip.endTime;

                    if (isClipFinished) {
                        console.log('Individual clip finished at:', currentTime.toFixed(2));

                        if (isLooping) {
                            // Loop the clip
                            player.seekTo(currentClip.startTime, true);
                        } else {
                            // Stop the clip
                            player.pauseVideo();
                            setCurrentClip(null);
                        }
                    }
                } catch (error) {
                    console.error('Error in clip interval:', error);
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = undefined;
                    }
                }
            }
        }, intervalTime);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };
  }, [isPlaying, currentClip, player, isLooping, isSequenceMode]);



  // Handle looping the entire video when no clips exist
  useEffect(() => {
    if (isPlaying && isLooping && clips.length === 0 && player && !currentClip) {
        const intervalTime = 100; // Use same interval for consistency

        const fullVideoLoopInterval = setInterval(() => {
            if (player && typeof player.getCurrentTime === 'function') {
                try {
                    const currentTime = player.getCurrentTime();
                    const isVideoEnd = Math.abs(currentTime - videoDuration) < 0.5;

                    if (isVideoEnd) {
                        // Loop the entire video from the beginning
                        player.seekTo(0, true);
                    }
                } catch (error) {
                    console.error('Error in full video loop interval:', error);
                }
            }
        }, intervalTime);

        return () => {
            clearInterval(fullVideoLoopInterval);
        };
    }
  }, [isPlaying, isLooping, clips.length, player, currentClip, videoDuration]);

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
            />

            {/* Hidden SequencePlayer component to handle sequence logic */}
            <SequencePlayer
              player={player}
              sequenceClips={sequenceClips}
              isSequenceMode={isSequenceMode}
              setIsSequenceMode={setIsSequenceMode}
              setSequenceClips={setSequenceClips}
              setCurrentClip={setCurrentClip}
              setCurrentClipIndex={setCurrentClipIndex}
              isLooping={isLooping}
              playbackSpeed={playbackSpeed}
              videoDuration={videoDuration}
              onSequenceEnd={() => {
                console.log('Sequence ended callback');
              }}
              onStartSequence={setSequenceStartFunction}
            />
          </div>
        )}

        {clips.length > 0 && (
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
        )}
      </main>
    </ErrorBoundary>
  );
}
