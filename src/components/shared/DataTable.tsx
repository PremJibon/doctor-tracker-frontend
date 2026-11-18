"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyState?: React.ReactNode;
  mobileCardRenderer?: (item: T, index: number) => React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  skeletonRows = 5,
  emptyState,
  mobileCardRenderer,
  onRowClick,
  className,
}: DataTableProps<T>) {
  // 1. Loading State
  if (isLoading) {
    return (
      <div className={cn("w-full space-y-4", className)}>
        {/* Desktop skeleton table */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border bg-surface-muted px-4 py-3 flex gap-4">
            {columns.map((col, idx) => (
              <div key={idx} className={cn("flex-1", col.headerClassName)}>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: skeletonRows }).map((_, rIdx) => (
              <div key={rIdx} className="px-4 py-4 flex gap-4 items-center">
                {columns.map((col, cIdx) => (
                  <div key={cIdx} className={cn("flex-1", col.className)}>
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile skeleton cards (<md) */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: skeletonRows }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border bg-surface p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-1/2" />
              <div className="pt-2 border-t border-border flex justify-between">
                <Skeleton className="h-3.5 w-1/4" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!data || data.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
        No records found.
      </div>
    );
  }

  // 3. Success State
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Table View (md+) */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-surface shadow-xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item, index) => {
              const rowKey = keyExtractor(item, index);
              const isClickable = Boolean(onRowClick);

              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick?.(item)}
                  onKeyDown={
                    isClickable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRowClick?.(item);
                          }
                        }
                      : undefined
                  }
                  tabIndex={isClickable ? 0 : undefined}
                  role={isClickable ? "button" : undefined}
                  className={cn(
                    "transition-colors",
                    isClickable
                      ? "cursor-pointer hover:bg-surface-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                      : "hover:bg-surface-muted/30"
                  )}
                >
                  {columns.map((col) => {
                    const content = col.render
                      ? col.render(item, index)
                      : (item as Record<string, unknown>)[col.key] !== undefined
                      ? String((item as Record<string, unknown>)[col.key])
                      : null;

                    return (
                      <td
                        key={`${rowKey}-${col.key}`}
                        className={cn(
                          "px-4 py-3.5 text-sm text-foreground align-middle",
                          col.className
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (<md) */}
      <div className="md:hidden space-y-3">
        {data.map((item, index) => {
          const itemKey = keyExtractor(item, index);

          if (mobileCardRenderer) {
            return (
              <div
                key={itemKey}
                onClick={() => onRowClick?.(item)}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick?.(item);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
                className={cn(
                  "rounded-lg border border-border bg-surface p-4 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  onRowClick && "cursor-pointer active:bg-surface-muted"
                )}
              >
                {mobileCardRenderer(item, index)}
              </div>
            );
          }

          // Fallback auto-rendered card if no mobileCardRenderer provided
          return (
            <div
              key={itemKey}
              onClick={() => onRowClick?.(item)}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick?.(item);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "button" : undefined}
              className={cn(
                "rounded-lg border border-border bg-surface p-4 shadow-xs space-y-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                onRowClick && "cursor-pointer active:bg-surface-muted"
              )}
            >
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => {
                  const content = col.render
                    ? col.render(item, index)
                    : (item as Record<string, unknown>)[col.key] !== undefined
                    ? String((item as Record<string, unknown>)[col.key])
                    : null;

                  return (
                    <div
                      key={`${itemKey}-${col.key}`}
                      className="flex items-start justify-between gap-2 text-sm"
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {col.header}
                      </span>
                      <span className="text-right text-sm font-medium text-foreground">
                        {content}
                      </span>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
