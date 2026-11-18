"use client";

import React, { useState, useEffect } from "react";
import { Filter, X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export interface FilterBarProps {
  children: React.ReactNode;
  activeFilters?: ActiveFilter[];
  onReset?: () => void;
  totalResults?: number;
  title?: string;
  className?: string;
}

export function FilterBar({
  children,
  activeFilters = [],
  onReset,
  totalResults,
  title = "Filters",
  className,
}: FilterBarProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close mobile drawer on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileDrawerOpen]);

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      {/* Desktop Filter Row (md+) */}
      <div className="hidden md:flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {children}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {totalResults !== undefined && (
            <span className="text-xs text-muted-foreground font-medium">
              {totalResults} {totalResults === 1 ? "result" : "results"}
            </span>
          )}

          {hasActiveFilters && onReset && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-muted-foreground hover:text-foreground h-9 px-2.5 gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset all
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle Button (<md) */}
      <div className="flex md:hidden items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => setMobileDrawerOpen(true)}
          className="flex-1 justify-between bg-surface border-border text-foreground shadow-raised-sm hover:shadow-raised active:shadow-pressed min-h-[40px] px-3.5 rounded-xl"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4 text-primary" />
            {title}
          </span>
          {hasActiveFilters && (
            <Badge variant="accent" className="ml-2 px-1.5 py-0 text-xs font-semibold shadow-raised-sm">
              {activeFilters.length}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && onReset && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="min-h-[40px] px-3 text-xs text-muted-foreground hover:text-foreground shrink-0 rounded-xl"
            aria-label="Reset all filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Reset</span>
          </Button>
        )}
      </div>

      {/* Mobile Slide-Over Drawer (<md) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-foreground/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter Options"
            className="relative z-50 flex h-full w-[85%] max-w-sm flex-col bg-surface border-l border-border shadow-raised duration-200 animate-in slide-in-from-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-4 min-h-[56px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
                {hasActiveFilters && (
                  <Badge variant="accent" className="px-1.5 py-0 text-xs font-semibold shadow-raised-sm">
                    {activeFilters.length}
                  </Badge>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-border bg-surface shadow-raised hover:shadow-raised-sm active:shadow-pressed text-foreground cursor-pointer transition-all"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {children}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 flex flex-col gap-2 bg-surface">
              {hasActiveFilters && onReset && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onReset();
                  }}
                  className="w-full min-h-[40px] justify-center text-sm rounded-xl"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear all filters
                </Button>
              )}
              <Button
                type="button"
                variant="default"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full min-h-[40px] justify-center text-sm rounded-xl shadow-raised"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Badges (Shown when filters are applied) */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            Active:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant="accent"
                className="inline-flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium rounded-full bg-accent text-accent-foreground border border-border/40 shadow-raised-sm"
              >
                <span>
                  <strong className="font-semibold">{filter.label}:</strong> {filter.value}
                </span>
                <button
                  type="button"
                  onClick={filter.onRemove}
                  aria-label={`Remove filter ${filter.label}`}
                  className="rounded-full p-0.5 hover:bg-accent-foreground/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline ml-1 cursor-pointer font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
