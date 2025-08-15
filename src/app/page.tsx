"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import YouTube, { YouTubePlayer } from 'react-youtube';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Film, Video, Play, ChevronDown, Plus, ChevronsRight, ArrowUpDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  youtubeUrl: z.string().url({ message: "Please enter a valid YouTube URL." })
    .refine(url => url.includes("youtube.com") || url.includes("youtu.be"), {
      message: "Please enter a valid YouTube URL.",
    }),
});

const customClipSchema = z.object({
  startTime: z.string().refine(val => /^\d{1,2}:\d{2}$/.test(val), { message: "Use MM:SS" }),
  endTime: z.string().refine(val => /^\d{1,2}:\d{2}$/.test(val), { message: "Use MM:SS" }),
});


type Clip = {
  startTime: number;
  endTime: number;
  stepName: string;
};

type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [clips, setClips] = useState<Clip[]>([]);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [currentClip, setCurrentClip] = useState<{startTime: number, endTime: number} | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(0.5);
  const [isLooping, setIsLooping] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isCreateClipsOpen, setIsCreateClipsOpen] = useState(true);
  const [isPracticeClipsOpen, setIsPracticeClipsOpen] = useState(true);
  const [componentOrder, setComponentOrder] = useState<('create' | 'practice')[]>(['create', 'practice']);
  const clipIntervalRef = useRef<NodeJS.Timeout>();

  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const practiceClipsRef = useRef<HTMLDivElement>(null);

  const urlForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { youtubeUrl: "" },
  });
  
  const customClipForm = useForm<z.infer<typeof customClipSchema>>({
    resolver: zodResolver(customClipSchema),
    defaultValues: { startTime: "00:00", endTime: "00:00" },
  });

  const getYoutubeVideoId = (url: string): string | null => {
    let videoId: string | null = null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.hostname.includes('youtube.com')) {
        if (urlObj.pathname === '/watch') {
          videoId = urlObj.searchParams.get('v');
        } else if (urlObj.pathname.startsWith('/embed/')) {
          videoId = urlObj.pathname.split('/embed/')[1];
        } else if (urlObj.pathname.startsWith('/v/')) {
          videoId = urlObj.pathname.split('/v/')[1];
        } else if (urlObj.pathname.startsWith('/shorts/')) {
          videoId = urlObj.pathname.split('/shorts/')[1];
        }
      }
    } catch (e) {
      return null;
    }
    return videoId;
  };

  const onUrlSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setClips([]);
    setVideoId(null);
    setVideoDuration(0);
    setCurrentClip(null);
    if(player) player.stopVideo();

    const extractedVideoId = getYoutubeVideoId(values.youtubeUrl);
    if (!extractedVideoId) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Could not extract video ID from the YouTube URL.",
      });
      setIsLoading(false);
      return;
    }
    setVideoId(extractedVideoId);
    // The video player will be rendered, and its onReady event will handle the rest.
  };
  
  const handleClipPlayback = (startTime: number, endTime: number) => {
    if (!player) return;

    if (player && typeof player.setPlaybackRate === 'function') {
      player.setPlaybackRate(playbackSpeed);
    }
    setCurrentClip({startTime, endTime});
    player.seekTo(startTime, true);
    player.playVideo();
  };
  
  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    const readyPlayer = event.target;
    setPlayer(readyPlayer);
    const duration = readyPlayer.getDuration();
    setVideoDuration(duration);
    if (readyPlayer && typeof readyPlayer.setPlaybackRate === 'function') {
      readyPlayer.setPlaybackRate(playbackSpeed);
    }
    setIsLoading(false);
    setIsFormOpen(false);
  };
  
  const onPlayerStateChange = (event: { data: number }) => {
    const isNowPlaying = event.data === YouTube.PlayerState.PLAYING;
    setIsPlaying(isNowPlaying);
  };

  const parseTimeToSeconds = (time: string): number => {
      const [minutes, seconds] = time.split(':').map(Number);
      return (minutes * 60) + seconds;
  };

  const scrollToPracticeClips = () => {
    setIsPracticeClipsOpen(true);
    setTimeout(() => {
        practiceClipsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  const handleCustomClipSubmit = (values: z.infer<typeof customClipSchema>) => {
      const startTime = parseTimeToSeconds(values.startTime);
      const endTime = parseTimeToSeconds(values.endTime);

      if (startTime >= endTime) {
          toast({ variant: "destructive", title: "Invalid Time", description: "Start time must be before end time." });
          return;
      }
      if (endTime > videoDuration) {
          toast({ variant: "destructive", title: "Invalid Time", description: `End time cannot exceed video duration (${formatTime(videoDuration)}).` });
          return;
      }
      
      const newClip: Clip = {
        startTime,
        endTime,
        stepName: `Custom Clip ${clips.length + 1} (${values.startTime} - ${values.endTime})`,
      };

      setClips(prev => [...prev, newClip].sort((a,b) => a.startTime - b.startTime));
      customClipForm.reset({startTime: "00:00", endTime: "00:00"});
      scrollToPracticeClips();
  };

  const segmentVideo = (segmentDuration: number) => {
    if (!videoDuration) return;
    const newClips: Clip[] = [];
    for (let i = 0; i < videoDuration; i += segmentDuration) {
      const startTime = i;
      const endTime = Math.min(i + segmentDuration, videoDuration);
      newClips.push({
        startTime,
        endTime,
        stepName: `Segment ${formatTime(startTime)} - ${formatTime(endTime)}`
      });
    }
    setClips(newClips);
    scrollToPracticeClips();
  };

  useEffect(() => {
    if (isPlaying && currentClip && player) {
        clipIntervalRef.current = setInterval(() => {
            if (player && typeof player.getCurrentTime === 'function') {
                const currentTime = player.getCurrentTime();
                if (currentTime >= currentClip.endTime) {
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
  }, [isPlaying, currentClip, player, isLooping]);

  useEffect(() => {
    if (player && typeof player.setPlaybackRate === 'function' && isPlaying) {
      player.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed, player, isPlaying]);

  useEffect(() => {
    if (videoId) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [videoId]);
  
  const toggleOrder = () => {
    setComponentOrder(prev => [...prev].reverse());
  }

  const formatTime = (seconds: number) => {
    return new Date(seconds * 1000).toISOString().substr(14, 5)
  }

  const sections = {
    create: (
      <div className="mt-8" key="create">
        <Collapsible open={isCreateClipsOpen} onOpenChange={setIsCreateClipsOpen}>
          <Card className="shadow-lg">
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center p-6 cursor-pointer">
                <div className="text-left">
                  <CardTitle>Create Practice Clips</CardTitle>
                  <CardDescription>Automatically segment the video or create your own custom clips.</CardDescription>
                </div>
                 <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronDown className={cn("h-6 w-6 transition-transform duration-200", isCreateClipsOpen && "rotate-180")} />
                    <span className="sr-only">Toggle</span>
                  </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-semibold">Auto-Segment Video</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button variant="outline" onClick={() => segmentVideo(3)}>Every 3 Secs</Button>
                    <Button variant="outline" onClick={() => segmentVideo(5)}>Every 5 Secs</Button>
                    <Button variant="outline" onClick={() => segmentVideo(10)}>Every 10 Secs</Button>
                  </div>
                </div>
                <div>
                    <Label className="font-semibold">Create Custom Clip</Label>
                    <Form {...customClipForm}>
                        <form onSubmit={customClipForm.handleSubmit(handleCustomClipSubmit)} className="flex items-end gap-2 mt-2">
                            <FormField
                                control={customClipForm.control}
                                name="startTime"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start</FormLabel>
                                    <FormControl>
                                    <Input placeholder="MM:SS" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <ChevronsRight className="h-6 w-6 mb-2" />
                            <FormField
                                control={customClipForm.control}
                                name="endTime"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End</FormLabel>
                                    <FormControl>
                                    <Input placeholder="MM:SS" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" size="icon" className="mb-1"><Plus/></Button>
                        </form>
                    </Form>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    ),
    practice: clips.length > 0 && (
      <div className="mt-8" key="practice" ref={practiceClipsRef}>
        <Collapsible open={isPracticeClipsOpen} onOpenChange={setIsPracticeClipsOpen}>
          <Card className="shadow-lg">
            <CollapsibleTrigger asChild>
               <div className="flex justify-between items-center p-6 cursor-pointer">
                 <div className="text-left">
                  <CardTitle>Your Practice Clips</CardTitle>
                  <CardDescription>Click a clip to play it. Adjust speed and looping below.</CardDescription>
                 </div>
                 <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronDown className={cn("h-6 w-6 transition-transform duration-200", isPracticeClipsOpen && "rotate-180")} />
                  <span className="sr-only">Toggle</span>
                </Button>
               </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6">
                <div className="pt-4 flex items-center gap-6">
                  <div className="flex-1">
                    <Label className="mb-2 block text-sm font-medium">Playback Speed</Label>
                    <Tabs value={playbackSpeed.toString()} onValueChange={(val) => setPlaybackSpeed(Number(val) as PlaybackSpeed)} className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="0.25">0.25x</TabsTrigger>
                        <TabsTrigger value="0.5">0.5x</TabsTrigger>
                        <TabsTrigger value="0.75">0.75x</TabsTrigger>
                        <TabsTrigger value="1">1x</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="flex flex-col items-center pt-1">
                      <Label htmlFor="loop-switch" className="mb-2 block text-sm font-medium">Loop Clip</Label>
                    <Switch id="loop-switch" checked={isLooping} onCheckedChange={setIsLooping} />
                  </div>
                </div>
              </div>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {clips.map((clip, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded-md">
                          {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                        </span>
                        <Button onClick={() => handleClipPlayback(clip.startTime, clip.endTime)} size="sm">
                          <Play className="mr-2 h-4 w-4" />
                          Play Clip
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    ),
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight mb-4">
          Dance Looper
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Paste a YouTube link to create custom loops for practicing dance routines.
        </p>
      </header>
      
      <Collapsible
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        className="max-w-2xl mx-auto"
      >
        <Card className="shadow-lg">
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center p-6 cursor-pointer">
                <div className="space-y-1.5">
                  <CardTitle className="flex items-center gap-2">
                    <Video />
                    Load a Dance Video
                  </CardTitle>
                  <CardDescription>
                    Enter a YouTube URL to begin.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronDown
                    className={cn(
                      "h-6 w-6 transition-transform duration-200",
                      isFormOpen && "rotate-180"
                    )}
                  />
                  <span className="sr-only">Toggle</span>
                </Button>
              </div>
            </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Form {...urlForm}>
                <form onSubmit={urlForm.handleSubmit(onUrlSubmit)} className="space-y-4">
                  <FormField
                    control={urlForm.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.youtube.com/watch?v=..." {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load Video"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      
      {isLoading && (
         <div className="mt-12 max-w-2xl mx-auto text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Loading video...</p>
        </div>
      )}

      {videoId && (
        <div ref={resultsRef} className="mt-16">
            <Card className="shadow-lg h-full lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film />
                  Original Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video">
                  <YouTube
                    videoId={videoId}
                    className="w-full h-full"
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
            </Card>
        </div>
      )}

      {player && videoDuration > 0 && (
          <div className="mt-4 -mb-4 flex justify-end">
            <Button variant="ghost" onClick={toggleOrder}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Switch Order
            </Button>
          </div>
        )}
      
      {player && videoDuration > 0 && componentOrder.map(key => sections[key])}
          
      <footer className="text-center mt-16 text-muted-foreground text-sm">
        <p>Built with Next.js and shadcn/ui.</p>
        <p>Dance Looper &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}

    