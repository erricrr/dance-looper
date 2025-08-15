"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import YouTube, { YouTubePlayer } from 'react-youtube';
import { analyzeDanceVideo, AnalyzeDanceVideoOutput } from "@/ai/flows/analyze-dance-video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Film, Bot, Play, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  youtubeUrl: z.string().url({ message: "Please enter a valid YouTube URL." })
    .refine(url => url.includes("youtube.com") || url.includes("youtu.be"), {
      message: "Please enter a valid YouTube URL.",
    }),
  danceStyle: z.string().min(1, { message: "Please select a dance style." }),
});

type AnalysisResult = AnalyzeDanceVideoOutput & {
  videoId: string;
};
type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [currentClip, setCurrentClip] = useState<{startTime: number, endTime: number} | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(0.5);
  const [isLooping, setIsLooping] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const clipIntervalRef = useRef<NodeJS.Timeout>();


  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: "",
      danceStyle: "",
    },
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setAnalysis(null);
    setProgress(0);
    setCurrentClip(null);
    if(player) player.stopVideo();

    const videoId = getYoutubeVideoId(values.youtubeUrl);
    if (!videoId) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Could not extract video ID from the YouTube URL.",
      });
      setIsLoading(false);
      return;
    }

    let progressInterval: NodeJS.Timeout;

    try {
      progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 95 ? 95 : prev + 5));
      }, 400);

      const analysisResult = await analyzeDanceVideo({ videoUrl: values.youtubeUrl, danceStyle: values.danceStyle });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setAnalysis({
        ...analysisResult,
        videoId,
      });
      
      setIsFormOpen(false);

    } catch (error) {
      if (progressInterval!) clearInterval(progressInterval!);
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error processing the video. Please try another one.",
      });
    } finally {
      setIsLoading(false);
    }
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
    if (readyPlayer && typeof readyPlayer.setPlaybackRate === 'function') {
      readyPlayer.setPlaybackRate(playbackSpeed);
    }
  };
  
  const onPlayerStateChange = (event: { data: number }) => {
    const isNowPlaying = event.data === YouTube.PlayerState.PLAYING;
    setIsPlaying(isNowPlaying);
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
    if (analysis) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [analysis]);

  const formatTime = (seconds: number) => {
    return new Date(seconds * 1000).toISOString().substr(14, 5)
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight mb-4">
          DanceStep AI
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Paste a YouTube link of a dance routine, and our AI will break down the steps for you.
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
                    <Bot />
                    Analyze a Dance Video
                  </CardTitle>
                  <CardDescription>
                    Enter a YouTube URL and select the dance style to begin the analysis.
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
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
                  <FormField
                    control={form.control}
                    name="danceStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dance Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a dance style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="latin">Latin</SelectItem>
                            <SelectItem value="hip-hop">Hip Hop</SelectItem>
                            <SelectItem value="ballet">Ballet</SelectItem>
                            <SelectItem value="jazz">Jazz</SelectItem>
                            <SelectItem value="tap">Tap</SelectItem>
                            <SelectItem value="contemporary">Contemporary</SelectItem>
                            <SelectItem value="other">Other / Not Sure</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Process Video"
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
            <p className="text-muted-foreground mb-2">Analyzing... please wait.</p>
            <Progress value={progress} className="w-full" />
        </div>
      )}

      {analysis && (
        <div ref={resultsRef} className="mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-3">
              <Card className="shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Film />
                    Original Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video">
                    <YouTube
                      videoId={analysis.videoId}
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
            
          </div>
          
          <div className="mt-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Dance Step Timeline</CardTitle>
                <CardDescription>Click a step to play its segment. Adjust speed and looping below.</CardDescription>
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
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Accordion type="single" collapsible className="w-full">
                    {analysis.danceSteps.map((step, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="pr-4">
                          <div className="flex items-center justify-between w-full">
                            <span>{step.stepName}</span>
                            <span className="text-muted-foreground text-sm font-mono bg-muted px-2 py-1 rounded-md">
                              {formatTime(step.startTime)} - {formatTime(step.endTime)}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="flex items-center gap-4">
                            <Button onClick={() => handleClipPlayback(step.startTime, step.endTime)}>
                              <Play className="mr-2 h-4 w-4" /> Play Clip
                            </Button>
                            <p className="text-base leading-relaxed">
                              {step.description || "No description available."}
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <footer className="text-center mt-16 text-muted-foreground text-sm">
        <p>Built with Next.js, Genkit, and shadcn/ui.</p>
        <p>DanceStep AI &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
