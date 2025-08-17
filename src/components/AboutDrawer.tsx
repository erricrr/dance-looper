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
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AboutDrawer() {
  return (
    <div className="mt-10 flex justify-center">
      <Sheet>
  <SheetTrigger asChild>
    <Button
      variant="outline"
      size="icon"
      className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent/80 shadow-lg"
      aria-label="About this app"
    >
      <HelpCircle className="h-5 w-5" />
    </Button>
  </SheetTrigger>

      <SheetContent
    side="bottom"
    className="h-[75vh] sm:h-[70vh] max-h-[700px] min-h-[350px] flex flex-col [&>button]:hidden rounded-t-xl shadow-lg"
    role="dialog"
    aria-modal="true"
  >
    <SheetHeader className="flex-shrink-0 pb-2">
      <SheetTitle className="text-2xl font-bold">About Dalooper</SheetTitle>
      <SheetDescription className="text-base">
        Master any skill through the power of repetition
      </SheetDescription>
    </SheetHeader>

    <div
      className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-accent/5 hover:scrollbar-thumb-accent/60"
      role="region"
      aria-label="About content"
      tabIndex={0}
    >
      <div className="space-y-6 pr-2">
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

      <footer className="text-center">
        <p className="text-xs text-muted-foreground">
          Dalooper &copy; {new Date().getFullYear()}
        </p>
      </footer>
      </div>
    </div>

    <div className="flex-shrink-0 pt-4 border-t bg-background/80 backdrop-blur-sm">
      <SheetClose asChild>
        <Button
          variant="mystic"
          className="w-full"
          aria-label="Close about drawer"
        >
          Close
        </Button>
      </SheetClose>
    </div>
  </SheetContent>
</Sheet>
    </div>
  );
}
