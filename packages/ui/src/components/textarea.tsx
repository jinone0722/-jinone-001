import * as React from "react";
import { cn } from "../lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-28 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";
