"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { analyzeDanceVideo, AnalyzeDanceVideoOutput } from "@/ai/flows/analyze-dance-video";
import { generateDanceStepDescriptions } from "@/ai/flows/generate-dance-step-descriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Film, Bot, Music4 } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";

const formSchema = z.object({
  youtubeUrl: z.string().url({ message: "Please enter a valid YouTube URL." })
    .refine(url => url.includes("youtube.com") || url.includes("youtu.be"), {
      message: "Please enter a valid YouTube URL.",
    }),
});

type Description = { stepName: string; description: string };
type AnalysisResult = AnalyzeDanceVideoOutput & {
  descriptions: Description[];
  embedUrl: string;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: "",
    },
  });

  const getYoutubeEmbedUrl = (url: string): string | null => {
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
        }
      }
    } catch (e) {
      return null;
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setAnalysis(null);
    setProgress(0);

    const embedUrl = getYoutubeEmbedUrl(values.youtubeUrl);
    if (!embedUrl) {
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

      const analysisResult = await analyzeDanceVideo({ videoUrl: values.youtubeUrl });
      
      const descriptions = await Promise.all(
        analysisResult.danceSteps.map(async (step) => {
          const desc = await generateDanceStepDescriptions({
            danceStep: step.stepName,
            videoDescription: "A dance video.",
          });
          return { stepName: step.stepName, description: desc.description };
        })
      );
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setAnalysis({
        ...analysisResult,
        descriptions,
        embedUrl,
      });

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

  useEffect(() => {
    if (analysis) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [analysis]);

  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
          <Music4 className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
          DanceStep AI
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Paste a YouTube link of a dance routine, and our AI will break down the steps for you.
        </p>
      </header>
      
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot />
            Analyze a Dance Video
          </CardTitle>
          <CardDescription>
            Enter a YouTube URL below to begin the analysis.
          </CardDescription>
        </CardHeader>
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
      </Card>

      {isLoading && (
        <div className="mt-12 max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground mb-2">Analyzing... please wait.</p>
            <Progress value={progress} className="w-full" />
        </div>
      )}

      {analysis && (
        <div ref={resultsRef} className="mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
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
                    <iframe
                      className="w-full h-full rounded-md"
                      src={analysis.embedUrl}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md mb-4 relative overflow-hidden border">
                    <Image
                      src="https://placehold.co/1280x720.png"
                      alt="Annotated Video Placeholder"
                      width={1280}
                      height={720}
                      className="object-cover w-full h-full opacity-30"
                      data-ai-hint="dance studio"
                    />
                    <Icons.PoseSkeleton className="absolute inset-0 m-auto w-1/2 h-1/2 text-primary opacity-50" />
                    <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded-md text-xs font-semibold">
                      SKELETON OVERLAY
                    </div>
                  </div>
                  <Button className="w-full" variant="secondary" disabled>
                    <Download className="mr-2 h-4 w-4" />
                    Download Processed Video
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Dance Step Timeline</CardTitle>
                <CardDescription>Click on a step to see its description.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Accordion type="single" collapsible className="w-full">
                    {analysis.danceSteps.map((step, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>
                          <div className="flex items-center justify-between w-full pr-4">
                            <span>{step.stepName}</span>
                            <span className="text-muted-foreground text-sm font-mono bg-muted px-2 py-1 rounded-md">
                              {new Date(step.timestamp * 1000).toISOString().substr(14, 5)}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-base leading-relaxed">
                            {analysis.descriptions.find(d => d.stepName === step.stepName)?.description || "No description available."}
                          </p>
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
