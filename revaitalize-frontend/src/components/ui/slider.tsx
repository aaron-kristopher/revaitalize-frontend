"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const SliderStyles = React.memo(() => (
  <style>
    {`
      @keyframes aurora {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      .animate-aurora {
        background-size: 200% 200%;
        animation: aurora 4s ease infinite;
      }
    `}
  </style>
));

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <>
    <SliderStyles />
    
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-400 animate-aurora" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="z-10 block h-6 w-6 rounded-full border-2 border-sky-500 bg-white ring-offset-background transition-all duration-150 ease-in-out hover:scale-110 active:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  </>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }