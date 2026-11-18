"use client";

import React, { useState, useEffect, useRef, useTransition, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface DateRange {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface DateRangePickerProps {
  fromParam?: string;
  toParam?: string;
  resetPageParam?: string;
  className?: string;
}

// Convert Date object to YYYY-MM-DD string in local timezone (Dhaka / UTC+6 safe)
function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Parse YYYY-MM-DD string into a local Date
function parseDateString(str?: string): Date | undefined {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return undefined;
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Format range for display button
function formatRangeDisplay(fromStr?: string, toStr?: string): string {
  const fromDate = parseDateString(fromStr);
  const toDate = parseDateString(toStr);

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);

  if (fromDate && toDate) {
    if (fromStr === toStr) return fmt(fromDate);
    return `${fmt(fromDate)} – ${fmt(toDate)}`;
  }
  if (fromDate) return `From ${fmt(fromDate)}`;
  if (toDate) return `Until ${fmt(toDate)}`;
  return "Select date range";
}

export function DateRangePicker({
  fromParam = "from",
  toParam = "to",
  resetPageParam = "page",
  className,
}: DateRangePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const urlFrom = searchParams.get(fromParam) || undefined;
  const urlTo = searchParams.get(toParam) || undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState<string | undefined>(urlFrom);
  const [tempTo, setTempTo] = useState<string | undefined>(urlTo);

  // Month being viewed in the calendar
  const [viewDate, setViewDate] = useState<Date>(() => {
    return parseDateString(urlFrom) || new Date();
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize internal state when URL parameters change externally (adjust during render per React 19)
  const [prevUrl, setPrevUrl] = useState({ urlFrom, urlTo });
  if (prevUrl.urlFrom !== urlFrom || prevUrl.urlTo !== urlTo) {
    setPrevUrl({ urlFrom, urlTo });
    setTempFrom(urlFrom);
    setTempTo(urlTo);
  }

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Quick Preset Handlers
  const applyPreset = (preset: "today" | "last7" | "last30" | "thisMonth" | "last12m") => {
    const now = new Date();
    let start: Date;
    const end: Date = now;

    switch (preset) {
      case "today":
        start = now;
        break;
      case "last7":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        break;
      case "last30":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        break;
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last12m":
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }

    const fromStr = toDateString(start);
    const toStr = toDateString(end);

    setTempFrom(fromStr);
    setTempTo(toStr);
    setViewDate(start);
  };

  const handleDateClick = (dateStr: string) => {
    if (!tempFrom || (tempFrom && tempTo)) {
      // Starting a new range
      setTempFrom(dateStr);
      setTempTo(undefined);
    } else {
      // Completing the range
      if (dateStr < tempFrom) {
        setTempTo(tempFrom);
        setTempFrom(dateStr);
      } else {
        setTempTo(dateStr);
      }
    }
  };

  const handleApply = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (tempFrom) {
        params.set(fromParam, tempFrom);
      } else {
        params.delete(fromParam);
      }
      if (tempTo) {
        params.set(toParam, tempTo);
      } else {
        params.delete(toParam);
      }
      if (resetPageParam) {
        params.delete(resetPageParam);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempFrom(undefined);
    setTempTo(undefined);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(fromParam);
      params.delete(toParam);
      if (resetPageParam) {
        params.delete(resetPageParam);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
    setIsOpen(false);
  };

  // Generate calendar days for viewDate month
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Leading days from previous month
    const startDayOfWeek = firstDay.getDay(); // 0 = Sun
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevD = new Date(year, month, -i);
      days.push({
        dateStr: toDateString(prevD),
        dayNum: prevD.getDate(),
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const currD = new Date(year, month, d);
      days.push({
        dateStr: toDateString(currD),
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Trailing days from next month
    const endDayOfWeek = lastDay.getDay();
    for (let i = 1; i < 7 - endDayOfWeek; i++) {
      const nextD = new Date(year, month + 1, i);
      days.push({
        dateStr: toDateString(nextD),
        dayNum: nextD.getDate(),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewDate]);

  const viewMonthName = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(viewDate);
  }, [viewDate]);

  const hasActiveRange = Boolean(urlFrom || urlTo);

  return (
    <div ref={containerRef} className={cn("relative inline-block w-full sm:w-auto", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={cn(
          "flex h-10 w-full sm:w-auto min-w-[220px] items-center justify-between gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground transition-all duration-150 min-h-[40px] cursor-pointer",
          hasActiveRange
            ? "shadow-inset border-primary/50 text-foreground font-medium"
            : "shadow-raised-sm hover:shadow-raised active:shadow-pressed"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">{formatRangeDisplay(urlFrom, urlTo)}</span>
        </div>
        {hasActiveRange && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-surface-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Clear date filter"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {/* Popover (Desktop) & Bottom Sheet (Mobile) */}
      {isOpen && (
        <>
          {/* Mobile Backdrop (<md) */}
          <div
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-xs md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Choose date range"
            className={cn(
              "z-50 border border-border bg-surface shadow-raised rounded-2xl p-4 transition-all duration-200",
              // Mobile: bottom sheet
              "fixed inset-x-0 bottom-0 md:absolute md:inset-auto md:top-full md:left-0 md:mt-2 md:w-[350px] max-h-[90vh] overflow-y-auto"
            )}
          >
            {/* Header with Title and Close on Mobile */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <span className="text-sm font-semibold text-foreground">Date Range</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close date picker"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Presets Pills */}
            <div className="flex flex-wrap gap-1.5 py-3 border-b border-border/60">
              {[
                { label: "Today", value: "today" },
                { label: "7 Days", value: "last7" },
                { label: "30 Days", value: "last30" },
                { label: "This Month", value: "thisMonth" },
                { label: "12 Months", value: "last12m" },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => applyPreset(p.value as Parameters<typeof applyPreset>[0])}
                  className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground shadow-raised-sm hover:shadow-raised active:shadow-pressed transition-all cursor-pointer min-h-[32px]"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between pt-3 pb-2">
              <button
                type="button"
                onClick={() =>
                  setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface shadow-raised-sm hover:shadow-raised active:shadow-pressed text-foreground transition-all cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-foreground">{viewMonthName}</span>
              <button
                type="button"
                onClick={() =>
                  setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface shadow-raised-sm hover:shadow-raised active:shadow-pressed text-foreground transition-all cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground py-1">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs py-1">
              {calendarDays.map((d) => {
                const isSelectedStart = d.dateStr === tempFrom;
                const isSelectedEnd = d.dateStr === tempTo;
                const isInRange =
                  tempFrom && tempTo && d.dateStr >= tempFrom && d.dateStr <= tempTo;

                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => handleDateClick(d.dateStr)}
                    className={cn(
                      "h-8 w-8 mx-auto flex items-center justify-center rounded-lg font-medium transition-all cursor-pointer min-h-[32px] min-w-[32px]",
                      !d.isCurrentMonth && "text-muted-foreground/40",
                      d.isCurrentMonth && "text-foreground",
                      isInRange && !isSelectedStart && !isSelectedEnd && "bg-accent text-accent-foreground rounded-none",
                      (isSelectedStart || isSelectedEnd) &&
                        "bg-primary text-primary-foreground font-bold shadow-raised rounded-lg border border-primary/20",
                      !isInRange &&
                        !isSelectedStart &&
                        !isSelectedEnd &&
                        "hover:bg-surface-muted hover:shadow-raised-sm active:shadow-pressed"
                    )}
                  >
                    {d.dayNum}
                  </button>
                );
              })}
            </div>

            {/* Selected Summary and Footer Buttons */}
            <div className="pt-3 mt-2 border-t border-border/60 space-y-3">
              <div className="text-xs text-muted-foreground text-center">
                {tempFrom && tempTo
                  ? `${formatRangeDisplay(tempFrom, tempTo)}`
                  : tempFrom
                  ? `Selected start: ${tempFrom} (pick end date)`
                  : "Pick start and end date"}
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="rounded-xl flex-1 min-h-[38px] text-xs"
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleApply}
                  className="rounded-xl flex-1 min-h-[38px] text-xs shadow-raised gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
