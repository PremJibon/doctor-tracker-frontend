import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none min-h-[40px] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary/20 shadow-raised hover:bg-primary-hover active:shadow-pressed",
        destructive:
          "bg-danger text-danger-foreground border border-danger/20 shadow-raised hover:opacity-90 active:shadow-pressed",
        outline:
          "border border-border bg-surface text-foreground shadow-raised-sm hover:shadow-raised active:shadow-pressed",
        secondary:
          "border border-border bg-surface text-foreground shadow-raised-sm hover:shadow-raised active:shadow-pressed",
        ghost:
          "text-foreground hover:bg-surface-muted hover:shadow-raised-sm active:shadow-pressed",
        link: "text-primary underline-offset-4 hover:underline min-h-0 h-auto p-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
