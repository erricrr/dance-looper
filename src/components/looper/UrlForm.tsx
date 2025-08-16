"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronDown, Bookmark, Trash2 } from "lucide-react";
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
  const { toast } = useToast();

  const urlForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { youtubeUrl: "" },
  });

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
      toast({ title: "Video removed from saved list." });
    } catch (error) {
      console.error("Failed to remove URL from localStorage", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
          <CollapsibleTrigger asChild>
              <button className="w-full p-6">
                  <div className="flex justify-between items-center">
                      <div className="text-left flex items-center gap-4">
                        <div>
                            <CardTitle>Paste a YouTube Link</CardTitle>
                            <CardDescription className={cn("pt-1", !isFormOpen && "hidden")}>Or pick from your saved links (if you have any)</CardDescription>
                            <CardDescription className={cn("pt-1", isFormOpen && "hidden")}>Click to change video</CardDescription>
                        </div>
                      </div>
                      <ChevronDown className={cn("h-6 w-6 transition-transform duration-200", isFormOpen && "rotate-180")} />
                  </div>
              </button>
          </CollapsibleTrigger>
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
                                          <Bookmark/>
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <p>Save video for later</p>
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
                  <Collapsible open={isSavedVideosOpen} onOpenChange={setIsSavedVideosOpen} className="mt-6">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Bookmark className="h-4 w-4" />
                            Saved Links ({savedUrls.length}/{MAX_SAVED_URLS})
                            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isSavedVideosOpen && "rotate-180")} />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <ScrollArea className="h-40 rounded-md border">
                        <div className="p-4 space-y-2">
                          {savedUrls.map(url => (
                            <div key={url} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted">
                              <span className="text-sm text-muted-foreground truncate flex-1" title={url}>{url}</span>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => loadSavedUrl(url)}>Load</Button>
                                <Button size="icon" variant="ghost" onClick={() => removeUrl(url)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CollapsibleContent>
                  </Collapsible>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  )
}
