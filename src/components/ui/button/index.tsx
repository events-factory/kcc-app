import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50",
          {
            "bg-slate-900 text-white hover:bg-slate-800": variant === "default",
            "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
            "border border-slate-200 bg-white hover:bg-slate-100": variant === "outline",
            "bg-transparent hover:bg-slate-100": variant === "ghost",
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3 py-1 text-sm": size === "sm",
            "h-12 px-6 py-3 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
