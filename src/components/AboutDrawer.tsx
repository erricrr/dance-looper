"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AboutDrawer() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet>
  <SheetTrigger asChild>
    <Button
      variant="outline"
      size="icon"
      className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent/80 shadow-lg"
      aria-label="About this app"
    >
      <HelpCircle className="h-5 w-5" />
    </Button>
  </SheetTrigger>

  <SheetContent side="bottom" className="h-[80vh] max-h-[600px]">
    <SheetHeader>
      <SheetTitle className="text-2xl font-bold">About Dalooper</SheetTitle>
      <SheetDescription className="text-base">
        Master any skill through the power of repetition
      </SheetDescription>
    </SheetHeader>

    <div className="mt-6 space-y-6 overflow-y-auto flex-1">
      <section>
        <h3 className="text-lg font-semibold mb-3">The Birth of Dalooper</h3>
        <p className="text-muted-foreground leading-relaxed">
          Born from the desire to master steps in "salsa caleña" videos, Dalooper
          transforms complex choreography into digestible, loopable moments.
          Mirror the video to follow along naturally, practice at your own rhythm,
          repeat until perfect.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Beyond Dance</h3>
        <p className="text-muted-foreground leading-relaxed">
          While born for salsa, Dalooper excels with any repetitive learning -
          language pronunciation, music performances, sports techniques, or
          analyzing detailed movements. Discover your perfect loop.
        </p>
      </section>

      <Separator />

      <section>
        <h3 className="text-lg font-semibold mb-3">Get in Touch</h3>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Questions, feedback, or improvement ideas? I'd love to hear from you!
        </p>
        <a
          href="mailto:voicevoz321@gmail.com"
          className="text-primary hover:underline font-medium text-sm"
        >
          voicevoz321@gmail.com
        </a>
      </section>

      <footer className="text-center pt-4">
        <p className="text-xs text-muted-foreground">
          Dalooper &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  </SheetContent>
</Sheet>
    </div>
  );
}
