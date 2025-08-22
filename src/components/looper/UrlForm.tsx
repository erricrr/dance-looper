"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Trash2, HeartOff } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formSchema } from "@/lib/types";
import { getYoutubeVideoId } from "@/lib/utils";

type UrlFormProps = {
  isUrlLoading: boolean;
  onUrlSubmit: (values: z.infer<typeof formSchema>) => void;
  savedUrls: string[];
  setSavedUrls: React.Dispatch<React.SetStateAction<string[]>>;
  loadSavedUrl: (url: string) => void;
  isFormOpen: boolean;
  setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const MAX_SAVED_URLS = 5;

export function UrlForm({
  isUrlLoading,
  onUrlSubmit,
  savedUrls,
  setSavedUrls,
  loadSavedUrl,
  isFormOpen,
  setIsFormOpen
}: UrlFormProps) {
  const [isSavedVideosOpen, setIsSavedVideosOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const urlForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { youtubeUrl: "" },
  });

  // Static form - always visible
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const saveUrl = () => {
    const urlToSave = urlForm.getValues("youtubeUrl");
    if (!urlToSave || getYoutubeVideoId(urlToSave) === null) {
        toast({ variant: "destructive", title: "Invalid URL", description: "Please enter a valid YouTube URL to save." });
        return;
    }
    if (savedUrls.includes(urlToSave)) {
        toast({ title: "Already Saved", description: "This link is already in your saved list." });
        return;
    }
    if (savedUrls.length >= MAX_SAVED_URLS) {
        toast({ variant: "destructive", title: "Saved list is full", description: `You can only save up to ${MAX_SAVED_URLS} videos. Please remove one to add another.` });
        return;
    }

    try {
      const newUrls = [urlToSave, ...savedUrls];
      setSavedUrls(newUrls);
      localStorage.setItem("danceLooperUrls", JSON.stringify(newUrls));
      toast({ title: "Link Saved!", description: "It has been added to your saved list." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save the URL."});
      console.error("Failed to save URL to localStorage", error);
    }
  };

  const removeUrl = (urlToRemove: string) => {
    try {
      const newUrls = savedUrls.filter(url => url !== urlToRemove);
      setSavedUrls(newUrls);
      localStorage.setItem("danceLooperUrls", JSON.stringify(newUrls));
      toast({ title: "Link removed from saved list." });
    } catch (error) {
      console.error("Failed to remove link from localStorage", error);
    }
  };

  return (
    <div
      ref={formRef}
      className="max-w-2xl mx-auto"
    >
      <Card className="shadow-lg">
        <Collapsible open={true} onOpenChange={() => {}}>
          <div className="p-6">
            <div className="text-left">
              <CardTitle>Paste a YouTube Link</CardTitle>
              <CardDescription className="pt-1">Or pick from your saved links (if you have any)</CardDescription>
            </div>
          </div>
          <CollapsibleContent>
            <CardContent className="p-6 pt-0">
              <Form {...urlForm}>
                <form onSubmit={urlForm.handleSubmit(onUrlSubmit)} className="space-y-4">
                  <FormField
                    control={urlForm.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube Link</FormLabel>
                        <div className="flex gap-2">
                            <FormControl>
                              <Input placeholder="https://www.youtube.com/watch?v=..." {...field} disabled={isUrlLoading} />
                            </FormControl>
                            <TooltipProvider>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          onClick={saveUrl}
                                          disabled={!urlForm.formState.isValid || isUrlLoading}
                                          aria-label="Save video for later"
                                      >
                                          <Heart/>
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <div className="text-center">
                                        <p>Save video for later</p>
                                      </div>
                                  </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" variant="mystic" className="w-full" disabled={isUrlLoading}>
                    {isUrlLoading ? (
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
              {savedUrls.length > 0 && (
                  <div className="mt-6">
                      <button
                        onClick={() => setIsSavedVideosOpen(!isSavedVideosOpen)}
                        className="w-full flex items-center gap-2 text-sm font-semibold hover:bg-muted/50 rounded-md p-2 transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        Saved Links ({savedUrls.length}/{MAX_SAVED_URLS})
                      </button>

                      <div
                        className={cn(
                          "grid transition-all duration-300 ease-in-out overflow-hidden",
                          isSavedVideosOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                        )}
                      >
                        <div className="overflow-hidden pb-1">
                          <ScrollArea className="h-40 rounded-md border">
                            <div className="p-4 space-y-2">
                              {savedUrls.map(url => (
                                <div key={url} className="flex items-center justify-between p-2 rounded-md hover:bg-muted group">
                                  <button
                                    onClick={() => {
                                      urlForm.setValue("youtubeUrl", url);
                                      // Focus the input field
                                      const input = document.querySelector('input[placeholder*="youtube.com"]') as HTMLInputElement;
                                      if (input) {
                                        input.focus();
                                      }
                                    }}
                                    className="flex-1 text-left text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
                                    title={url}
                                  >
                                    {url}
                                  </button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removeUrl(url)}
                                    className="h-6 w-6 shrink-0"
                                    aria-label="Remove from saved links"
                                  >
                                    <HeartOff className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                  </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  )
}
