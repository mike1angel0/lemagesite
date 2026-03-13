import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        {label && (
          <label
            htmlFor={id}
            className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          className={cn(
            "w-full bg-transparent border border-border text-text-primary font-sans text-sm",
            "px-4 py-3.5",
            "placeholder:text-text-muted",
            "focus:outline-none focus:border-accent-dim",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
export type { InputProps };
