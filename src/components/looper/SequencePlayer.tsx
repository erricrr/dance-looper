"use client";

import { useState, useRef, useEffect } from "react";
import { YouTubePlayer } from 'react-youtube';
import { Clip } from "@/lib/types";

interface SequencePlayerProps {
  player: YouTubePlayer | null;
  sequenceClips: Clip[];
  isSequenceMode: boolean;
  setIsSequenceMode: (mode: boolean) => void;
  setSequenceClips: (clips: Clip[]) => void;
  setCurrentClip: (clip: { startTime: number; endTime: number } | null) => void;
  setCurrentClipIndex: (index: number | null) => void;
  isLooping: boolean;
  playbackSpeed: number;
  videoDuration: number;
  onSequenceEnd?: () => void;
  onStartSequence?: (startSequenceFn: (clips: Clip[]) => void) => void;
}

export function SequencePlayer({
  player,
  sequenceClips,
  isSequenceMode,
  setIsSequenceMode,
  setSequenceClips,
  setCurrentClip,
  setCurrentClipIndex,
  isLooping,
  playbackSpeed,
  videoDuration,
  onSequenceEnd,
  onStartSequence
}: SequencePlayerProps) {
  const sequenceIntervalRef = useRef<NodeJS.Timeout>();
  const [currentSequenceTime, setCurrentSequenceTime] = useState(0);
  const isReadyRef = useRef(false);

  // Debug component mounting
  useEffect(() => {
    console.log('SequencePlayer mounted with:', {
      player: !!player,
      videoDuration,
      onStartSequence: !!onStartSequence,
      isSequenceMode
    });
  }, []);

  // Start sequence playback
  const startSequence = (clips: Clip[]) => {
    console.log('startSequence called with:', { clips, type: typeof clips, isArray: Array.isArray(clips) });

    if (!player) {
      console.error('Cannot start sequence: player not ready');
      return;
    }

    if (!clips) {
      console.error('Cannot start sequence: clips parameter is null/undefined');
      return;
    }

    if (!Array.isArray(clips)) {
      console.error('Cannot start sequence: clips parameter is not an array:', clips);
      return;
    }

    if (clips.length === 0) {
      console.error('Cannot start sequence: clips array is empty');
      return;
    }

    if (videoDuration <= 0) {
      console.log('Video duration not ready yet, waiting...');
      // Wait a bit and retry
      setTimeout(() => {
        if (videoDuration > 0) {
          console.log('Video duration now ready, starting sequence');
          startSequence(clips);
        } else {
          console.error('Video duration still not ready after retry');
        }
      }, 100);
      return;
    }

    console.log('Starting sequence playback:', clips);

    const firstClip = clips[0];
    const lastClip = clips[clips.length - 1];
    const startTime = firstClip.startTime;
    const endTime = Math.min(lastClip.endTime, videoDuration);

    console.log('Sequence bounds:', { startTime, endTime, videoDuration });

    // Set as current clip
    setCurrentClip({ startTime, endTime });
    setCurrentClipIndex(null);
    setIsSequenceMode(true);
    setSequenceClips(clips);

    try {
      player.setPlaybackRate(playbackSpeed);
      player.seekTo(startTime, true);
      player.playVideo();

      console.log('Sequence started successfully');
    } catch (error) {
      console.error('Error starting sequence:', error);
    }
  };

  // Monitor sequence progress
  useEffect(() => {
    if (!isSequenceMode || !player || !sequenceClips.length) {
      if (sequenceIntervalRef.current) {
        clearInterval(sequenceIntervalRef.current);
        sequenceIntervalRef.current = undefined;
      }
      return;
    }

    console.log('Setting up sequence monitoring');

    const interval = setInterval(() => {
      if (!player || !sequenceClips.length) return;

      try {
        const currentTime = player.getCurrentTime();
        const playerState = player.getPlayerState();

        setCurrentSequenceTime(currentTime);

        // Check if player is actually playing
        if (playerState !== 1) { // 1 = PLAYING
          console.log('Player not playing, state:', playerState);
          return;
        }

        // Get the current sequence end time
        const lastClip = sequenceClips[sequenceClips.length - 1];
        const sequenceEndTime = Math.min(lastClip.endTime, videoDuration);

        console.log('Sequence progress:', {
          currentTime: currentTime.toFixed(2),
          sequenceEndTime: sequenceEndTime.toFixed(2),
          timeRemaining: (sequenceEndTime - currentTime).toFixed(2)
        });

        // Check if sequence should end
        if (currentTime >= sequenceEndTime) {
          console.log('Sequence ending at:', currentTime.toFixed(2));

          if (isLooping) {
            // Loop the sequence
            const firstClip = sequenceClips[0];
            console.log('Looping sequence from:', firstClip.startTime);
            player.seekTo(firstClip.startTime, true);
          } else {
            // End the sequence but stay in sequence mode
            console.log('Ending sequence');
            player.pauseVideo();
            setCurrentClip(null);
            // Don't exit sequence mode - keep the user in "Create Sequence" mode
            // setIsSequenceMode(false);
            // setSequenceClips([]);

            if (onSequenceEnd) {
              onSequenceEnd();
            }
          }
        }
      } catch (error) {
        console.error('Error in sequence monitoring:', error);
      }
    }, 100); // Check every 100ms

    sequenceIntervalRef.current = interval;

    return () => {
      if (sequenceIntervalRef.current) {
        clearInterval(sequenceIntervalRef.current);
        sequenceIntervalRef.current = undefined;
      }
    };
  }, [isSequenceMode, player, sequenceClips, isLooping, videoDuration, setCurrentClip, setIsSequenceMode, setSequenceClips, onSequenceEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sequenceIntervalRef.current) {
        clearInterval(sequenceIntervalRef.current);
        sequenceIntervalRef.current = undefined;
      }
    };
  }, []);

      // Expose startSequence function via callback
  useEffect(() => {
    console.log('SequencePlayer useEffect running:', {
      onStartSequence: !!onStartSequence,
      player: !!player,
      videoDuration,
      isSequenceMode
    });

    if (onStartSequence && player) {
      console.log('SequencePlayer ready, exposing startSequence function');
      console.log('Current state:', { player: !!player, videoDuration, isSequenceMode });

      isReadyRef.current = true;

      // Create a bound function to ensure proper context
      const boundStartSequence = (clips: Clip[]) => {
        console.log('Bound function called with:', clips);
        console.log('Call stack:', new Error().stack);
        console.log('Current state when called:', { isSequenceMode, isReady: isReadyRef.current });

        // Only proceed if we're ready
        if (!isReadyRef.current) {
          console.log('SequencePlayer not ready, ignoring call');
          return;
        }

        // Only proceed if we have valid clips and are in the right state
        if (!clips || !Array.isArray(clips) || clips.length === 0) {
          console.log('Bound function called with invalid clips, ignoring:', clips);
          return;
        }

        // Only proceed if we're not already in sequence mode
        if (isSequenceMode) {
          console.log('Already in sequence mode, ignoring call');
          return;
        }

        startSequence(clips);
      };

      onStartSequence(boundStartSequence);
    } else {
      console.log('SequencePlayer not ready yet:', {
        onStartSequence: !!onStartSequence,
        player: !!player,
        videoDuration
      });
      isReadyRef.current = false;
    }
  }, [onStartSequence, startSequence, player, isSequenceMode]);

  return null; // This component doesn't render anything
}
