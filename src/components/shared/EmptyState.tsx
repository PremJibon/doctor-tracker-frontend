"use client";

import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-surface p-8 text-center animate-in fade-in-50 duration-200",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border shadow-inset text-muted-foreground mb-4">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && (
        <div className="mt-5">
          <Button
            type="button"
            variant="default"
            size="default"
            onClick={action.onClick}
            className="gap-2 min-h-[40px]"
          >
            {action.icon}
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
