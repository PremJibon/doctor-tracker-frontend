import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-raised-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary text-primary-foreground",
        secondary: "border-border bg-surface-muted text-muted-foreground",
        accent: "border-accent-foreground/20 bg-accent text-accent-foreground",
        destructive: "border-danger/20 bg-danger text-danger-foreground",
        danger: "border-danger/20 bg-danger text-danger-foreground",
        warning: "border-warning/20 bg-warning text-warning-foreground",
        success: "border-success/20 bg-success text-success-foreground",
        outline: "border-border bg-surface text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
