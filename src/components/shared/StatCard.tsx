"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  isLoading = false,
  className,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("p-6 rounded-xl border border-border bg-surface shadow-raised", className)}>
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3.5 w-36" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6 rounded-xl border border-border bg-surface shadow-raised transition-all", className)}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-primary border border-border-subtle shadow-inset">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border shadow-raised-sm",
                trend.isPositive
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-danger/10 text-danger border-danger/20"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="mr-0.5 h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="mr-0.5 h-3.5 w-3.5" />
              )}
              {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
            </span>
          )}
        </div>

        {(description || trend?.label) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {trend?.label ? `${trend.label} ` : null}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
