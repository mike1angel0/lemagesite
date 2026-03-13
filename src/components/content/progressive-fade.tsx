import React from "react";
import { cn } from "@/lib/utils";

interface ProgressiveFadeProps {
  children: React.ReactNode;
  className?: string;
}

export function ProgressiveFade({ children, className }: ProgressiveFadeProps) {
  const childArray = React.Children.toArray(children);

  const opacityClasses = ["opacity-100", "opacity-30", "opacity-[0.12]"];

  return (
    <div className={cn("relative", className)}>
      {childArray.map((child, index) => (
        <div
          key={index}
          className={opacityClasses[index] ?? "opacity-[0.12]"}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
