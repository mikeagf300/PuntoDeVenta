import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variant === "default" && "bg-blue-600 text-white hover:bg-blue-500",
          variant === "outline" &&
            "border border-gray-300 bg-white hover:bg-gray-100",
          variant === "ghost" && "bg-transparent hover:bg-gray-100",
          variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
          size === "sm" && "text-sm py-1 px-2",
          size === "md" && "text-base py-2 px-4",
          size === "lg" && "text-lg py-3 px-6",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
